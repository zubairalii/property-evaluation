import type { Request, Response } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../utils/async-handler';
import { sendSuccess } from '../utils/api-response';
import { HttpError } from '../utils/http-error';
import { getValidatedQuery } from '../middleware/validation.middleware';
import {
  getAdminEvaluation,
  getAnalytics,
  getDashboard,
  getUser,
  listAdminEvaluations,
  listUsers,
  updateUserStatus,
} from '../services/admin.service';
import type { AdminEvaluationQuery, AdminListQuery } from '../validators/admin.schema';
import type { AccountStatus } from '../types/domain';

function requireUser(req: Request) {
  if (!req.user) throw new HttpError(401, 'Missing access token');
  return req.user;
}

function resourceId(req: Request, label: string): string {
  const value = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const parsed = z.string().uuid().safeParse(value);
  if (!parsed.success) throw new HttpError(400, `Invalid ${label}`);
  return parsed.data;
}

export const dashboard = asyncHandler(async (_req: Request, res: Response) => {
  sendSuccess(res, 'Dashboard retrieved', await getDashboard());
});

export const analytics = asyncHandler(async (req: Request, res: Response) => {
  const query = getValidatedQuery<{ days: number }>(req);
  sendSuccess(res, 'Analytics retrieved', await getAnalytics(query.days));
});

export const users = asyncHandler(async (req: Request, res: Response) => {
  const query = getValidatedQuery<AdminListQuery>(req);
  const result = await listUsers(query);
  sendSuccess(res, 'Users retrieved', result.items, 200, {
    page: query.page,
    limit: query.limit,
    total: result.total,
  });
});

export const user = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, 'User retrieved', await getUser(resourceId(req, 'user id')));
});

export const userStatus = asyncHandler(async (req: Request, res: Response) => {
  const actor = requireUser(req);
  const body = req.body as { status: AccountStatus };
  const profile = await updateUserStatus(actor.id, resourceId(req, 'user id'), body.status);
  sendSuccess(res, 'User status updated', profile);
});

export const evaluations = asyncHandler(async (req: Request, res: Response) => {
  const query = getValidatedQuery<AdminEvaluationQuery>(req);
  const result = await listAdminEvaluations(query);
  sendSuccess(res, 'Evaluations retrieved', result.items, 200, {
    page: query.page,
    limit: query.limit,
    total: result.total,
  });
});

export const evaluation = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, 'Evaluation retrieved', await getAdminEvaluation(resourceId(req, 'evaluation id')));
});
