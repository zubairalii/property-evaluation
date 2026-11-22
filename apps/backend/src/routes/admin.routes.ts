import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/admin.middleware';
import { validateBody, validateQuery } from '../middleware/validation.middleware';
import {
  analytics,
  dashboard,
  evaluation,
  evaluations,
  user,
  users,
  userStatus,
} from '../controllers/admin.controller';
import {
  accountStatusSchema,
} from '../validators/ai-response.schema';
import {
  adminEvaluationQuerySchema,
  adminListQuerySchema,
  analyticsQuerySchema,
} from '../validators/admin.schema';

export const adminRouter = Router();

adminRouter.use(requireAuth, requireAdmin);
adminRouter.get('/dashboard', dashboard);
adminRouter.get('/analytics', validateQuery(analyticsQuerySchema), analytics);
adminRouter.get('/users', validateQuery(adminListQuerySchema), users);
adminRouter.get('/users/:id', user);
adminRouter.patch('/users/:id/status', validateBody(accountStatusSchema), userStatus);
adminRouter.get('/evaluations', validateQuery(adminEvaluationQuerySchema), evaluations);
adminRouter.get('/evaluations/:id', evaluation);
