import { z } from 'zod';
import type {
  ConfidenceLevel,
  Evaluation,
  EvaluationResult,
  EvaluationSummary,
  InvestmentRecommendation,
  MarketComparable,
  PriceStatus,
  Profile,
  PropertyCondition,
  PropertyType,
  AreaUnit,
} from '../types/domain';
import { HttpError } from '../utils/http-error';
import { logger } from '../config/logger';

const numeric = z.preprocess((value) => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return Number(value);
  return value;
}, z.number().finite());

const nullableNumeric = z.preprocess((value) => {
  if (value == null || value === '') return null;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return Number(value);
  return value;
}, z.number().finite().nullable());

const stringList = z.preprocess((value) => (Array.isArray(value) ? value : []), z.array(z.string()));

export const profileRowSchema = z.object({
  id: z.string().uuid(),
  full_name: z.string(),
  email: z.string(),
  phone: z.string().nullable(),
  role: z.enum(['user', 'admin']),
  status: z.enum(['active', 'inactive']),
  created_at: z.string(),
  updated_at: z.string(),
});

export const evaluationRowSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  property_title: z.string().nullable(),
  property_type: z.enum(['house', 'apartment', 'residential_plot', 'commercial_property']),
  country: z.string(),
  city: z.string(),
  location: z.string(),
  property_size: numeric,
  area_unit: z.enum(['marla', 'kanal', 'square_feet', 'square_yards']),
  covered_area: nullableNumeric,
  bedrooms: nullableNumeric,
  bathrooms: nullableNumeric,
  property_condition: z.enum(['new', 'excellent', 'good', 'average', 'needs_renovation']),
  asking_price: numeric,
  currency: z.string().transform((value) => value.trim().toUpperCase()),
  status: z.enum(['pending', 'processing', 'completed', 'failed']),
  input_fingerprint: z.string(),
  error_message: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const resultRowSchema = z.object({
  id: z.string().uuid(),
  evaluation_id: z.string().uuid(),
  estimated_value: nullableNumeric,
  minimum_value: nullableNumeric,
  maximum_value: nullableNumeric,
  currency: z.string().transform((value) => value.trim().toUpperCase()),
  price_status: z.enum(['underpriced', 'fairly_priced', 'overpriced', 'unknown']),
  investment_recommendation: z.enum([
    'good_investment',
    'consider_carefully',
    'not_recommended',
    'insufficient_data',
  ]),
  confidence_level: z.enum(['low', 'medium', 'high', 'insufficient_data']),
  valuation_explanation: z.string(),
  positive_factors: stringList,
  risk_factors: stringList,
  considerations: stringList,
  investment_analysis: z.string(),
  ai_model: z.string(),
  market_data_available: z.boolean(),
  metadata: z.record(z.unknown()).catch({}),
  created_at: z.string(),
});

export const comparableRowSchema = z.object({
  id: z.string().uuid(),
  property_type: z.enum(['house', 'apartment', 'residential_plot', 'commercial_property']),
  country: z.string(),
  city: z.string(),
  location: z.string(),
  property_size: numeric,
  area_unit: z.enum(['marla', 'kanal', 'square_feet', 'square_yards']),
  covered_area: nullableNumeric,
  sale_price: numeric,
  currency: z.string().transform((value) => value.trim().toUpperCase()),
  transaction_date: z.string(),
  source: z.string(),
});

type QueryError = { message: string; code?: string } | null;

export function throwIfDbError(error: QueryError, publicMessage: string): void {
  if (!error) return;
  logger.error({ err: error }, publicMessage);
  if (error.code === '23505' || error.message.includes('property_evaluations_inflight_fingerprint')) {
    throw new HttpError(409, 'An evaluation for this property is already in progress');
  }
  throw new HttpError(500, publicMessage);
}

export function parseProfile(row: unknown): Profile {
  return profileRowSchema.parse(row);
}

export function parseEvaluation(row: unknown): Evaluation {
  const parsed = evaluationRowSchema.parse(row);
  return {
    ...parsed,
    property_type: parsed.property_type as PropertyType,
    area_unit: parsed.area_unit as AreaUnit,
    property_condition: parsed.property_condition as PropertyCondition,
    bedrooms: parsed.bedrooms === null ? null : Math.trunc(parsed.bedrooms),
    bathrooms: parsed.bathrooms === null ? null : Math.trunc(parsed.bathrooms),
  };
}

export function parseResult(row: unknown): EvaluationResult {
  const parsed = resultRowSchema.parse(row);
  return {
    ...parsed,
    price_status: parsed.price_status as PriceStatus,
    investment_recommendation: parsed.investment_recommendation as InvestmentRecommendation,
    confidence_level: parsed.confidence_level as ConfidenceLevel,
    metadata: parsed.metadata,
  };
}

export function parseComparable(row: unknown): MarketComparable {
  return comparableRowSchema.parse(row);
}

export function embeddedResult(value: unknown): EvaluationResult | null {
  const row = Array.isArray(value) ? value[0] : value;
  if (!row) return null;
  return parseResult(row);
}

export function toSummary(row: unknown): EvaluationSummary {
  const evaluation = parseEvaluation(row);
  const record = row as { evaluation_results?: unknown };
  const result = embeddedResult(record.evaluation_results);
  return {
    id: evaluation.id,
    property_title: evaluation.property_title,
    property_type: evaluation.property_type,
    country: evaluation.country,
    city: evaluation.city,
    location: evaluation.location,
    asking_price: evaluation.asking_price,
    currency: evaluation.currency,
    status: evaluation.status,
    created_at: evaluation.created_at,
    estimated_value: result?.estimated_value ?? null,
    price_status: result?.price_status ?? null,
    investment_recommendation: result?.investment_recommendation ?? null,
    confidence_level: result?.confidence_level ?? null,
  };
}
