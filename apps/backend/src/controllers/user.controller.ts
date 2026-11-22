import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/async-handler';
import { sendSuccess } from '../utils/api-response';
import { HttpError } from '../utils/http-error';
import { getProfile, updateProfile } from '../services/auth.service';
import type { UpdateProfileInput } from '../validators/profile.schema';

function requireUser(req: Request) {
  if (!req.user) throw new HttpError(401, 'Missing access token');
  return req.user;
}

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const user = requireUser(req);
  const profile = await getProfile(user.id);
  if (!profile) throw new HttpError(404, 'Profile not found');
  sendSuccess(res, 'Profile retrieved', profile);
});

export const patchMe = asyncHandler(async (req: Request, res: Response) => {
  const user = requireUser(req);
  const profile = await updateProfile(user.id, req.body as UpdateProfileInput);
  sendSuccess(res, 'Profile updated', profile);
});
