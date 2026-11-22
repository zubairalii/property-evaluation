import { supabaseAdmin } from '../config/supabase';
import type { Evaluation, EvaluationSummary, EvaluationView } from '../types/domain';
import { HttpError } from '../utils/http-error';
import { buildInputFingerprint } from '../utils/fingerprint';
import { embeddedResult, parseEvaluation, throwIfDbError, toSummary } from '../utils/rows';
import { toEvaluationView } from './investment.service';
import type { CreateEvaluationInput } from '../validators/evaluation.schema';

function range(page: number, limit: number): { from: number; to: number } {
  const from = (page - 1) * limit;
  return { from, to: from + limit - 1 };
}

export async function createEvaluation(userId: string, input: CreateEvaluationInput): Promise<Evaluation> {
  const fingerprint = buildInputFingerprint(input);
  const { data: existing, error: existingError } = await supabaseAdmin
    .from('property_evaluations')
    .select('id')
    .eq('user_id', userId)
    .eq('input_fingerprint', fingerprint)
    .in('status', ['pending', 'processing'])
    .maybeSingle();
  throwIfDbError(existingError, 'Failed to check existing evaluations');
  if (existing) {
    throw new HttpError(409, 'An evaluation for this property is already in progress');
  }

  const { data, error } = await supabaseAdmin
    .from('property_evaluations')
    .insert({
      user_id: userId,
      property_title: input.property_title,
      property_type: input.property_type,
      country: input.country,
      city: input.city,
      location: input.location,
      property_size: input.property_size,
      area_unit: input.area_unit,
      covered_area: input.covered_area,
      bedrooms: input.bedrooms,
      bathrooms: input.bathrooms,
      property_condition: input.property_condition,
      asking_price: input.asking_price,
      currency: input.currency,
      input_fingerprint: fingerprint,
      status: 'pending',
    })
    .select('*')
    .single();
  throwIfDbError(error, 'Failed to save the property evaluation');
  if (!data) throw new HttpError(500, 'Failed to save the property evaluation');
  return parseEvaluation(data);
}

export async function listEvaluations(
  userId: string,
  page: number,
  limit: number,
): Promise<{ items: EvaluationSummary[]; total: number }> {
  const { from, to } = range(page, limit);
  const { data, error, count } = await supabaseAdmin
    .from('property_evaluations')
    .select('*, evaluation_results(*)', { count: 'exact' })
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(from, to);
  throwIfDbError(error, 'Failed to load evaluations');
  return {
    items: (data ?? []).map((row) => toSummary(row)),
    total: count ?? 0,
  };
}

export async function getOwnedEvaluation(userId: string, evaluationId: string): Promise<Evaluation> {
  const { data, error } = await supabaseAdmin
    .from('property_evaluations')
    .select('*')
    .eq('id', evaluationId)
    .eq('user_id', userId)
    .maybeSingle();
  throwIfDbError(error, 'Failed to load evaluation');
  if (!data) throw new HttpError(404, 'Evaluation not found');
  return parseEvaluation(data);
}

export async function getEvaluation(userId: string, evaluationId: string): Promise<EvaluationView> {
  const { data, error } = await supabaseAdmin
    .from('property_evaluations')
    .select('*, evaluation_results(*)')
    .eq('id', evaluationId)
    .eq('user_id', userId)
    .maybeSingle();
  throwIfDbError(error, 'Failed to load evaluation');
  if (!data) throw new HttpError(404, 'Evaluation not found');
  return toEvaluationView(parseEvaluation(data), embeddedResult(data.evaluation_results));
}

export async function getEvaluationResult(userId: string, evaluationId: string) {
  const view = await getEvaluation(userId, evaluationId);
  if (!view.result) throw new HttpError(404, 'Evaluation result is not available yet');
  return view;
}

export async function deleteEvaluation(userId: string, evaluationId: string): Promise<void> {
  const { data, error } = await supabaseAdmin
    .from('property_evaluations')
    .delete()
    .eq('id', evaluationId)
    .eq('user_id', userId)
    .select('id');
  throwIfDbError(error, 'Failed to delete evaluation');
  if (!data || data.length === 0) throw new HttpError(404, 'Evaluation not found');
}

export async function updateEvaluationStatus(
  evaluationId: string,
  status: Evaluation['status'],
  errorMessage: string | null,
): Promise<Evaluation> {
  const { data, error } = await supabaseAdmin
    .from('property_evaluations')
    .update({ status, error_message: errorMessage })
    .eq('id', evaluationId)
    .select('*')
    .single();
  throwIfDbError(error, 'Failed to update evaluation status');
  if (!data) throw new HttpError(500, 'Failed to update evaluation status');
  return parseEvaluation(data);
}
