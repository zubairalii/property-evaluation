import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validation.middleware';
import { getMe, patchMe } from '../controllers/user.controller';
import { updateProfileSchema } from '../validators/profile.schema';

export const userRouter = Router();

userRouter.use(requireAuth);
userRouter.get('/me', getMe);
userRouter.patch('/me', validateBody(updateProfileSchema), patchMe);
