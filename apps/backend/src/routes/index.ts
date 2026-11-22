import { Router } from 'express';
import { adminRouter } from './admin.routes';
import { evaluationRouter } from './evaluations.routes';
import { marketRouter } from './market.routes';
import { userRouter } from './users.routes';

export const apiRouter = Router();

apiRouter.get('/health', (_req, res) => {
  res.json({ success: true, message: 'ok', data: { service: 'smart-property-evaluator' } });
});

apiRouter.use('/users', userRouter);
apiRouter.use('/market', marketRouter);
apiRouter.use('/evaluations', evaluationRouter);
apiRouter.use('/admin', adminRouter);
