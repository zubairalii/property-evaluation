import { supabaseAdmin } from '../config/supabase';
import type { Profile } from '../types/domain';
import { HttpError } from '../utils/http-error';
import { parseProfile, throwIfDbError } from '../utils/rows';
import type { UpdateProfileInput } from '../validators/profile.schema';

const profileColumns = 'id, full_name, email, phone, role, status, created_at, updated_at';

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select(profileColumns)
    .eq('id', userId)
    .maybeSingle();
  throwIfDbError(error, 'Failed to load profile');
  return data ? parseProfile(data) : null;
}

export async function updateProfile(userId: string, input: UpdateProfileInput): Promise<Profile> {
  const patch: { full_name?: string; phone?: string | null } = {};
  if (input.full_name !== undefined) patch.full_name = input.full_name;
  if (input.phone !== undefined) patch.phone = input.phone;

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .update(patch)
    .eq('id', userId)
    .select(profileColumns)
    .single();
  throwIfDbError(error, 'Failed to update profile');
  if (!data) throw new HttpError(404, 'Profile not found');
  return parseProfile(data);
}
