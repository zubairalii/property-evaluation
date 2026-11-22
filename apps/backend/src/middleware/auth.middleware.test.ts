import type { NextFunction, Request, Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../config/supabase', () => ({
  supabaseAuth: { auth: { getUser: vi.fn() } },
  supabaseAdmin: { from: vi.fn() },
}));

import { supabaseAdmin, supabaseAuth } from '../config/supabase';
import { requireAdmin } from './admin.middleware';
import { requireAuth } from './auth.middleware';

const userId = '11111111-1111-4111-8111-111111111111';

const profile = {
  id: userId,
  full_name: 'Ayesha Khan',
  email: 'ayesha@example.com',
  phone: null,
  role: 'user',
  status: 'active',
  created_at: '2026-11-22T00:00:00.000Z',
  updated_at: '2026-11-22T00:00:00.000Z',
};

function bearer(aud: string): string {
  const payload = Buffer.from(JSON.stringify({ aud, sub: userId })).toString('base64url');
  return `Bearer header.${payload}.signature`;
}

function mockProfile(row: typeof profile | null) {
  vi.mocked(supabaseAdmin.from).mockReturnValue({
    select: () => ({
      eq: () => ({
        maybeSingle: async () => ({ data: row, error: null }),
      }),
    }),
  } as never);
}

async function runAuth(authorization?: string) {
  const req = {
    header: (name: string) => (name.toLowerCase() === 'authorization' ? authorization : undefined),
  } as Request;
  const next = vi.fn() as NextFunction;
  await requireAuth(req, {} as Response, next);
  return { req, next };
}

describe('requireAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejects a missing access token', async () => {
    const { next } = await runAuth();
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ status: 401 }));
  });

  it('rejects a token whose audience does not match', async () => {
    vi.mocked(supabaseAuth.auth.getUser).mockResolvedValue({
      data: { user: { id: userId } },
      error: null,
    } as never);
    const { next } = await runAuth(bearer('anon'));
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ status: 401 }));
  });

  it('rejects an inactive account', async () => {
    vi.mocked(supabaseAuth.auth.getUser).mockResolvedValue({
      data: { user: { id: userId } },
      error: null,
    } as never);
    mockProfile({ ...profile, status: 'inactive' });
    const { next, req } = await runAuth(bearer('authenticated'));
    expect(req.user).toBeUndefined();
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ status: 403, message: 'Account is inactive' }));
  });

  it('attaches the profile from the verified token', async () => {
    vi.mocked(supabaseAuth.auth.getUser).mockResolvedValue({
      data: { user: { id: userId } },
      error: null,
    } as never);
    mockProfile(profile);
    const { next, req } = await runAuth(bearer('authenticated'));
    expect(next).toHaveBeenCalledWith();
    expect(req.user?.id).toBe(userId);
    expect(req.user?.role).toBe('user');
  });
});

describe('requireAdmin', () => {
  it('rejects a signed-in user who is not an administrator', () => {
    const next = vi.fn();
    const req = { user: { id: userId, email: profile.email, role: 'user', profile } } as Request;
    requireAdmin(req, {} as Response, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ status: 403 }));
  });

  it('allows an active administrator', () => {
    const next = vi.fn();
    const adminProfile = { ...profile, role: 'admin' as const };
    const req = {
      user: { id: userId, email: profile.email, role: 'admin' as const, profile: adminProfile },
    } as Request;
    requireAdmin(req, {} as Response, next);
    expect(next).toHaveBeenCalledWith();
  });
});
