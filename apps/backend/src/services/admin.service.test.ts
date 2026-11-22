import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../config/supabase', () => ({
  supabaseAuth: { auth: { getUser: vi.fn() } },
  supabaseAdmin: { from: vi.fn() },
}));

import { supabaseAdmin } from '../config/supabase';
import { listAdminEvaluations } from './admin.service';

function chain(result: { data: unknown; error: unknown; count?: number | null }) {
  const query = {
    select: vi.fn(() => query),
    eq: vi.fn(() => query),
    in: vi.fn(() => query),
    or: vi.fn(() => query),
    order: vi.fn(() => query),
    range: vi.fn(() => query),
    limit: vi.fn(() => query),
    then: (resolve: (value: unknown) => unknown, reject?: (reason: unknown) => unknown) =>
      Promise.resolve(result).then(resolve, reject),
  };
  return query;
}

describe('admin evaluation filters', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('applies location search, property type, and status filters', async () => {
    const query = chain({ data: [], error: null, count: 0 });
    vi.mocked(supabaseAdmin.from).mockReturnValue(query as never);

    await listAdminEvaluations({
      page: 1,
      limit: 20,
      search: 'Lahore',
      property_type: 'house',
      status: 'failed',
    });

    expect(query.eq).toHaveBeenCalledWith('property_type', 'house');
    expect(query.eq).toHaveBeenCalledWith('status', 'failed');
    expect(query.or).toHaveBeenCalledWith(expect.stringContaining('Lahore'));
  });
});
