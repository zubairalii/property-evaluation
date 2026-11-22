import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { analyzeRateLimit } from '../middleware/rate-limit.middleware';
import { validateBody, validateQuery } from '../middleware/validation.middleware';
import { analyze, create, getOne, list, remove, result } from '../controllers/evaluation.controller';
import { createEvaluationSchema, paginationSchema } from '../validators/evaluation.schema';

export const evaluationRouter = Router();

evaluationRouter.use(requireAuth);
evaluationRouter.post('/', validateBody(createEvaluationSchema), create);
evaluationRouter.get('/', validateQuery(paginationSchema), list);
evaluationRouter.get('/:id', getOne);
evaluationRouter.delete('/:id', remove);
evaluationRouter.post('/:id/analyze', analyzeRateLimit, analyze);
evaluationRouter.get('/:id/result', result);
