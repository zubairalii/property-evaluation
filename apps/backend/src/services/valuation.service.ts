import { ZodError } from 'zod';
import { env } from '../config/env';
import { logger } from '../config/logger';
import { supabaseAdmin } from '../config/supabase';
import { PROMPT_VERSION } from '../prompts/valuation.prompt';
import type { Evaluation, EvaluationResult, EvaluationView, MarketComparable } from '../types/domain';
import { HttpError } from '../utils/http-error';
import { parseResult, throwIfDbError } from '../utils/rows';
import { aiResponseSchema, type AiValuation } from '../validators/ai-response.schema';
import {
  derivePriceStatus,
  NO_MARKET_DATA_NOTE,
  toEvaluationView,
} from './investment.service';
import { marketDataProvider, summarizeComparables } from './market-data.service';
import { generateValuation } from './openai-valuation.client';
import { getOwnedEvaluation, updateEvaluationStatus } from './property.service';

const PROCESSING_LOCK_MS = 2 * 60 * 1000;

export function applyMarketDataPolicy(
  result: AiValuation,
  comparableCount: number,
  askingPrice: number,
): AiValuation {
  const unsupported =
    comparableCount <= 0 || result.confidence_level === 'insufficient_data' || result.estimated_value == null;

  if (!unsupported) {
    return aiResponseSchema.parse({
      ...result,
      currency: result.currency.toUpperCase(),
      price_status: derivePriceStatus(askingPrice, result.estimated_value),
    });
  }

  const explanation =
    comparableCount <= 0 && !result.valuation_explanation.toLowerCase().includes('verified market')
      ? `${result.valuation_explanation} ${NO_MARKET_DATA_NOTE}`
      : result.valuation_explanation;

  return aiResponseSchema.parse({
    ...result,
    estimated_value: null,
    minimum_value: null,
    maximum_value: null,
    price_status: 'unknown',
    confidence_level: 'insufficient_data',
    investment_recommendation: 'insufficient_data',
    valuation_explanation: explanation,
  });
}

function toValuationError(error: unknown): HttpError {
  if (error instanceof HttpError) return error;
  if (error instanceof ZodError) {
    logger.error({ issues: error.issues }, 'AI response failed validation');
    return new HttpError(502, 'The valuation response was invalid and was not saved.');
  }
  return new HttpError(502, 'The valuation service is unavailable. Please try again.');
}

async function readResult(evaluationId: string): Promise<EvaluationResult | null> {
  const { data, error } = await supabaseAdmin
    .from('evaluation_results')
    .select('*')
    .eq('evaluation_id', evaluationId)
    .maybeSingle();
  throwIfDbError(error, 'Failed to load evaluation result');
  return data ? parseResult(data) : null;
}

async function saveResult(
  evaluation: Evaluation,
  valuation: AiValuation,
  comparables: MarketComparable[],
  latencyMs: number,
  matchScope: string,
): Promise<EvaluationResult> {
  const existing = await readResult(evaluation.id);
  if (existing) return existing;

  const { data, error } = await supabaseAdmin
    .from('evaluation_results')
    .insert({
      evaluation_id: evaluation.id,
      estimated_value: valuation.estimated_value,
      minimum_value: valuation.minimum_value,
      maximum_value: valuation.maximum_value,
      currency: evaluation.currency,
      price_status: valuation.price_status,
      investment_recommendation: valuation.investment_recommendation,
      confidence_level: valuation.confidence_level,
      valuation_explanation: valuation.valuation_explanation,
      positive_factors: valuation.positive_factors,
      risk_factors: valuation.risk_factors,
      considerations: valuation.considerations,
      investment_analysis: valuation.investment_analysis,
      ai_model: env.OPENAI_MODEL,
      market_data_available: comparables.length > 0,
      metadata: {
        prompt_version: PROMPT_VERSION,
        latency_ms: latencyMs,
        comparable_count: comparables.length,
        comparable_ids: comparables.map((row) => row.id),
        match_scope: matchScope,
      },
    })
    .select('*')
    .single();

  if (error?.code === '23505') {
    const raced = await readResult(evaluation.id);
    if (raced) return raced;
  }
  throwIfDbError(error, 'Failed to save the valuation');
  if (!data) throw new HttpError(500, 'Failed to save the valuation');
  return parseResult(data);
}

export async function analyzeEvaluation(userId: string, evaluationId: string): Promise<EvaluationView> {
  const evaluation = await getOwnedEvaluation(userId, evaluationId);

  if (evaluation.status === 'completed') {
    const result = await readResult(evaluation.id);
    if (!result) throw new HttpError(500, 'Completed evaluation is missing its result');
    return toEvaluationView(evaluation, result);
  }

  if (evaluation.status === 'processing') {
    const age = Date.now() - new Date(evaluation.updated_at).getTime();
    if (age < PROCESSING_LOCK_MS) {
      throw new HttpError(409, 'This evaluation is already being analyzed');
    }
  }

  await updateEvaluationStatus(evaluation.id, 'processing', null);
  const started = Date.now();

  try {
    const { comparables, match_scope } = await marketDataProvider.findComparables({
      property_type: evaluation.property_type,
      country: evaluation.country,
      city: evaluation.city,
      location: evaluation.location,
      area_unit: evaluation.area_unit,
      currency: evaluation.currency,
    });
    const market = summarizeComparables(comparables, match_scope);
    const raw = await generateValuation({
      property: {
        property_title: evaluation.property_title,
        property_type: evaluation.property_type,
        country: evaluation.country,
        city: evaluation.city,
        location: evaluation.location,
        property_size: evaluation.property_size,
        area_unit: evaluation.area_unit,
        covered_area: evaluation.covered_area,
        bedrooms: evaluation.bedrooms,
        bathrooms: evaluation.bathrooms,
        property_condition: evaluation.property_condition,
        asking_price: evaluation.asking_price,
        currency: evaluation.currency,
      },
      market,
    });
    const guarded = applyMarketDataPolicy(aiResponseSchema.parse(raw), comparables.length, evaluation.asking_price);
    const saved = await saveResult(evaluation, guarded, comparables, Date.now() - started, match_scope);
    const completed = await updateEvaluationStatus(evaluation.id, 'completed', null);
    return toEvaluationView(completed, saved);
  } catch (error) {
    const httpError = toValuationError(error);
    try {
      await updateEvaluationStatus(evaluation.id, 'failed', httpError.message);
    } catch (statusError) {
      logger.error({ err: statusError, evaluationId }, 'failed to mark evaluation as failed');
    }
    throw httpError;
  }
}
