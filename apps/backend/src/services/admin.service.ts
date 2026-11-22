import { z } from 'zod';
import { logger } from '../config/logger';
import { supabaseAdmin } from '../config/supabase';
import type { AccountStatus, AdminMarketComparable, EvaluationView, Profile } from '../types/domain';
import { HttpError } from '../utils/http-error';
import {
  embeddedResult,
  parseAdminComparable,
  parseEvaluation,
  parseProfile,
  throwIfDbError,
  toSummary,
} from '../utils/rows';
import {
  sanitizeSearch,
  type AdminComparablesQuery,
  type AdminEvaluationQuery,
  type AdminListQuery,
} from '../validators/admin.schema';
import { toEvaluationView } from './investment.service';

function range(page: number, limit: number): { from: number; to: number } {
  const from = (page - 1) * limit;
  return { from, to: from + limit - 1 };
}

async function countRows(
  table: 'profiles' | 'property_evaluations',
  status?: string,
): Promise<number> {
  let query = supabaseAdmin.from(table).select('id', { count: 'exact', head: true });
  if (status) query = query.eq('status', status);
  const { count, error } = await query;
  throwIfDbError(error, 'Failed to load dashboard counts');
  return count ?? 0;
}

const seriesSchema = z.array(z.object({ date: z.string(), count: z.number() }));
const analyticsSchema = z.object({
  evaluations_over_time: seriesSchema,
  registrations_over_time: seriesSchema,
  by_property_type: z.array(z.object({ property_type: z.string(), count: z.number() })),
  by_city: z.array(z.object({ city: z.string(), count: z.number() })),
});

export function fillDailySeries(rows: Array<{ date: string; count: number }>, days: number): Array<{ date: string; count: number }> {
  const counts = new Map(rows.map((row) => [row.date, row.count]));
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const filled: Array<{ date: string; count: number }> = [];
  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const day = new Date(today);
    day.setUTCDate(today.getUTCDate() - offset);
    const date = day.toISOString().slice(0, 10);
    filled.push({ date, count: counts.get(date) ?? 0 });
  }
  return filled;
}

export async function getDashboard() {
  const [totalUsers, totalEvaluations, evaluationsCompleted, evaluationsFailed] = await Promise.all([
    countRows('profiles'),
    countRows('property_evaluations'),
    countRows('property_evaluations', 'completed'),
    countRows('property_evaluations', 'failed'),
  ]);

  const { data: recentUsers, error: usersError } = await supabaseAdmin
    .from('profiles')
    .select('id, full_name, email, role, status, created_at')
    .order('created_at', { ascending: false })
    .limit(5);
  throwIfDbError(usersError, 'Failed to load recent users');

  const { data: recentEvaluations, error: evaluationsError } = await supabaseAdmin
    .from('property_evaluations')
    .select('id, property_title, property_type, city, country, status, asking_price, currency, created_at, profiles(full_name, email)')
    .order('created_at', { ascending: false })
    .limit(5);
  throwIfDbError(evaluationsError, 'Failed to load recent evaluations');

  return {
    total_users: totalUsers,
    total_evaluations: totalEvaluations,
    evaluations_completed: evaluationsCompleted,
    evaluations_failed: evaluationsFailed,
    recent_users: recentUsers ?? [],
    recent_evaluations: (recentEvaluations ?? []).map((row) => {
      const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
      return {
        id: row.id,
        property_title: row.property_title,
        property_type: row.property_type,
        city: row.city,
        country: row.country,
        status: row.status,
        asking_price: row.asking_price,
        currency: typeof row.currency === 'string' ? row.currency.trim() : row.currency,
        created_at: row.created_at,
        user: profile ?? null,
      };
    }),
  };
}

export async function getAnalytics(days: number) {
  const { data, error } = await supabaseAdmin.rpc('admin_analytics', { p_days: days });
  throwIfDbError(error, 'Failed to load analytics');
  const parsed = analyticsSchema.parse(data ?? {});
  return {
    ...parsed,
    evaluations_over_time: fillDailySeries(parsed.evaluations_over_time, days),
    registrations_over_time: fillDailySeries(parsed.registrations_over_time, days),
  };
}

async function evaluationCounts(userIds: string[]): Promise<Map<string, number>> {
  const counts = new Map<string, number>();
  if (userIds.length === 0) return counts;
  const { data, error } = await supabaseAdmin
    .from('property_evaluations')
    .select('user_id')
    .in('user_id', userIds);
  throwIfDbError(error, 'Failed to load evaluation counts');
  for (const row of data ?? []) {
    const userId = String(row.user_id);
    counts.set(userId, (counts.get(userId) ?? 0) + 1);
  }
  return counts;
}

export async function listUsers(filters: AdminListQuery) {
  const { from, to } = range(filters.page, filters.limit);
  let query = supabaseAdmin
    .from('profiles')
    .select('id, full_name, email, phone, role, status, created_at, updated_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (filters.search) {
    const safe = sanitizeSearch(filters.search);
    if (safe) query = query.or(`full_name.ilike.%${safe}%,email.ilike.%${safe}%`);
  }

  const { data, error, count } = await query;
  throwIfDbError(error, 'Failed to load users');
  const profiles = (data ?? []).map((row) => parseProfile(row));
  const counts = await evaluationCounts(profiles.map((profile) => profile.id));
  return {
    items: profiles.map((profile) => ({
      ...profile,
      evaluation_count: counts.get(profile.id) ?? 0,
    })),
    total: count ?? 0,
  };
}

export async function getUser(userId: string) {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('id, full_name, email, phone, role, status, created_at, updated_at')
    .eq('id', userId)
    .maybeSingle();
  throwIfDbError(error, 'Failed to load user');
  if (!data) throw new HttpError(404, 'User not found');
  const profile = parseProfile(data);
  const counts = await evaluationCounts([profile.id]);

  const { data: evaluations, error: evaluationsError } = await supabaseAdmin
    .from('property_evaluations')
    .select('*, evaluation_results(*)')
    .eq('user_id', profile.id)
    .order('created_at', { ascending: false })
    .limit(10);
  throwIfDbError(evaluationsError, 'Failed to load user evaluations');

  return {
    ...profile,
    evaluation_count: counts.get(profile.id) ?? 0,
    recent_evaluations: (evaluations ?? []).map((row) => toSummary(row)),
  };
}

export async function updateUserStatus(
  actorId: string,
  userId: string,
  status: AccountStatus,
): Promise<Profile & { evaluation_count: number }> {
  if (actorId === userId) {
    throw new HttpError(400, 'You cannot change your own account status');
  }

  const existing = await getUser(userId);
  if (existing.status === status) {
    return existing;
  }

  const banDuration = status === 'inactive' ? '876000h' : 'none';
  const { error: banError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    ban_duration: banDuration,
  });
  if (banError) {
    logger.error({ err: banError, userId }, 'failed to update auth ban');
    throw new HttpError(502, 'Failed to update the account sign-in status');
  }

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .update({ status })
    .eq('id', userId)
    .select('id, full_name, email, phone, role, status, created_at, updated_at')
    .single();

  if (error || !data) {
    logger.error({ err: error, userId }, 'failed to update profile status');
    const revert = status === 'inactive' ? 'none' : '876000h';
    await supabaseAdmin.auth.admin.updateUserById(userId, { ban_duration: revert });
    throw new HttpError(500, 'Failed to update the user status');
  }

  const profile = parseProfile(data);
  return { ...profile, evaluation_count: existing.evaluation_count };
}

export async function listAdminEvaluations(filters: AdminEvaluationQuery) {
  const { from, to } = range(filters.page, filters.limit);
  let query = supabaseAdmin
    .from('property_evaluations')
    .select('*, profiles(full_name, email), evaluation_results(*)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (filters.property_type) query = query.eq('property_type', filters.property_type);
  if (filters.status) query = query.eq('status', filters.status);
  if (filters.search) {
    const safe = sanitizeSearch(filters.search);
    if (safe) {
      query = query.or(`city.ilike.%${safe}%,location.ilike.%${safe}%,country.ilike.%${safe}%`);
    }
  }

  const { data, error, count } = await query;
  throwIfDbError(error, 'Failed to load evaluations');

  return {
    items: (data ?? []).map((row) => {
      const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
      return {
        ...toSummary(row),
        error_message: row.error_message,
        user: profile ?? null,
      };
    }),
    total: count ?? 0,
  };
}

export async function getAdminEvaluation(evaluationId: string): Promise<EvaluationView & {
  user: { full_name: string; email: string } | null;
}> {
  const { data, error } = await supabaseAdmin
    .from('property_evaluations')
    .select('*, profiles(full_name, email), evaluation_results(*)')
    .eq('id', evaluationId)
    .maybeSingle();
  throwIfDbError(error, 'Failed to load evaluation');
  if (!data) throw new HttpError(404, 'Evaluation not found');
  const profile = Array.isArray(data.profiles) ? data.profiles[0] : data.profiles;
  const view = toEvaluationView(parseEvaluation(data), embeddedResult(data.evaluation_results));
  return {
    ...view,
    user: profile ? { full_name: String(profile.full_name), email: String(profile.email) } : null,
  };
}

export async function listComparables(
  filters: AdminComparablesQuery,
): Promise<{ items: AdminMarketComparable[]; total: number }> {
  const { from, to } = range(filters.page, filters.limit);
  let query = supabaseAdmin
    .from('market_comparables')
    .select(
      'id, property_type, country, city, location, property_size, area_unit, covered_area, sale_price, currency, transaction_date, source, verification_status, created_at',
      { count: 'exact' },
    )
    .order('transaction_date', { ascending: false })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (filters.property_type) query = query.eq('property_type', filters.property_type);
  if (filters.verification_status) query = query.eq('verification_status', filters.verification_status);
  if (filters.city) {
    const safeCity = sanitizeSearch(filters.city);
    if (safeCity) query = query.ilike('city', safeCity);
  }
  if (filters.location) {
    const safeLocation = sanitizeSearch(filters.location);
    if (safeLocation) query = query.ilike('location', `%${safeLocation}%`);
  }

  const { data, error, count } = await query;
  throwIfDbError(error, 'Failed to load market comparables');

  return {
    items: (data ?? []).map((row) => parseAdminComparable(row)),
    total: count ?? 0,
  };
}
