import type { NextFunction, Request, Response } from 'express';
import { env } from '../config/env';
import { supabaseAuth } from '../config/supabase';
import { HttpError } from '../utils/http-error';
import { asyncHandler } from '../utils/async-handler';
import { getProfile } from '../services/auth.service';

function readAudience(token: string): string | null {
  const segment = token.split('.')[1];
  if (!segment) return null;
  try {
    const payload = JSON.parse(Buffer.from(segment, 'base64url').toString('utf8')) as {
      aud?: string | string[];
    };
    if (typeof payload.aud === 'string') return payload.aud;
    if (Array.isArray(payload.aud)) return payload.aud[0] ?? null;
    return null;
  } catch {
    return null;
  }
}

export const requireAuth = asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
  const header = req.header('authorization');
  if (!header?.startsWith('Bearer ')) {
    throw new HttpError(401, 'Missing access token');
  }
  const token = header.slice('Bearer '.length).trim();
  if (!token) throw new HttpError(401, 'Missing access token');

  const { data, error } = await supabaseAuth.auth.getUser(token);
  if (error || !data.user) throw new HttpError(401, 'Invalid or expired session');
  if (readAudience(token) !== env.JWT_AUDIENCE) throw new HttpError(401, 'Invalid or expired session');

  const profile = await getProfile(data.user.id);
  if (!profile) throw new HttpError(403, 'Profile not found');
  if (profile.status !== 'active') throw new HttpError(403, 'Account is inactive');

  req.user = {
    id: profile.id,
    email: profile.email,
    role: profile.role,
    profile,
  };
  next();
});
