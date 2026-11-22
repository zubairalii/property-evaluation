import type { Request, Response } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../utils/async-handler';
import { sendSuccess } from '../utils/api-response';
import { HttpError } from '../utils/http-error';
import { getValidatedQuery } from '../middleware/validation.middleware';
import {
  createEvaluation,
  deleteEvaluation,
  getEvaluation,
  getEvaluationResult,
  listEvaluations,
} from '../services/property.service';
import { analyzeEvaluation } from '../services/valuation.service';
import type { CreateEvaluationInput } from '../validators/evaluation.schema';

function requireUser(req: Request) {
  if (!req.user) throw new HttpError(401, 'Missing access token');
  return req.user;
}

function evaluationId(req: Request): string {
  const value = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const parsed = z.string().uuid().safeParse(value);
  if (!parsed.success) throw new HttpError(400, 'Invalid evaluation id');
  return parsed.data;
}

export const create = asyncHandler(async (req: Request, res: Response) => {
  const user = requireUser(req);
  const evaluation = await createEvaluation(user.id, req.body as CreateEvaluationInput);
  sendSuccess(res, 'Property evaluation created', evaluation, 201);
});

export const list = asyncHandler(async (req: Request, res: Response) => {
  const user = requireUser(req);
  const query = getValidatedQuery<{ page: number; limit: number }>(req);
  const result = await listEvaluations(user.id, query.page, query.limit);
  sendSuccess(res, 'Evaluations retrieved', result.items, 200, {
    page: query.page,
    limit: query.limit,
    total: result.total,
  });
});

export const getOne = asyncHandler(async (req: Request, res: Response) => {
  const user = requireUser(req);
  const view = await getEvaluation(user.id, evaluationId(req));
  sendSuccess(res, 'Evaluation retrieved', view);
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const user = requireUser(req);
  await deleteEvaluation(user.id, evaluationId(req));
  sendSuccess(res, 'Evaluation deleted', null);
});

export const analyze = asyncHandler(async (req: Request, res: Response) => {
  const user = requireUser(req);
  const view = await analyzeEvaluation(user.id, evaluationId(req));
  sendSuccess(res, 'Property evaluated successfully', view);
});

export const result = asyncHandler(async (req: Request, res: Response) => {
  const user = requireUser(req);
  const view = await getEvaluationResult(user.id, evaluationId(req));
  sendSuccess(res, 'Evaluation result retrieved', view);
});
