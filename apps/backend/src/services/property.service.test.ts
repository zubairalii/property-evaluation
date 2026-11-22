import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../config/supabase', () => ({
  supabaseAuth: { auth: { getUser: vi.fn() } },
  supabaseAdmin: { from: vi.fn() },
}));

import { supabaseAdmin } from '../config/supabase';
import { createEvaluation, getEvaluation } from './property.service';
import type { CreateEvaluationInput } from '../validators/evaluation.schema';

const userId = '11111111-1111-4111-8111-111111111111';
const evaluationId = '22222222-2222-4222-8222-222222222222';

const input: CreateEvaluationInput = {
  property_title: 'House',
  property_type: 'house',
  country: 'Pakistan',
  city: 'Lahore',
  location: 'DHA Phase 5',
  property_size: 10,
  area_unit: 'marla',
  covered_area: null,
  bedrooms: 3,
  bathrooms: 2,
  property_condition: 'good',
  asking_price: 45000000,
  currency: 'PKR',
};

function chain(result: { data: unknown; error: unknown; count?: number | null }) {
  const query = {
    select: vi.fn(() => query),
    insert: vi.fn(() => query),
    update: vi.fn(() => query),
    delete: vi.fn(() => query),
    eq: vi.fn(() => query),
    in: vi.fn(() => query),
    or: vi.fn(() => query),
    order: vi.fn(() => query),
    range: vi.fn(() => query),
    limit: vi.fn(() => query),
    maybeSingle: vi.fn(async () => result),
    single: vi.fn(async () => result),
    then: (resolve: (value: unknown) => unknown, reject?: (reason: unknown) => unknown) =>
      Promise.resolve(result).then(resolve, reject),
  };
  return query;
}

describe('evaluation ownership and duplicates', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 409 when the same property is already in progress', async () => {
    const existing = chain({ data: { id: evaluationId }, error: null });
    vi.mocked(supabaseAdmin.from).mockReturnValue({ select: () => existing } as never);

    await expect(createEvaluation(userId, input)).rejects.toMatchObject({ status: 409 });
    expect(existing.insert).not.toHaveBeenCalled();
  });

  it('returns 404 for an evaluation the user does not own', async () => {
    const query = chain({ data: null, error: null });
    vi.mocked(supabaseAdmin.from).mockReturnValue({ select: () => query } as never);

    await expect(getEvaluation(userId, evaluationId)).rejects.toMatchObject({
      status: 404,
      message: 'Evaluation not found',
    });
    expect(query.eq).toHaveBeenCalledWith('user_id', userId);
    expect(query.eq).toHaveBeenCalledWith('id', evaluationId);
  });
});
