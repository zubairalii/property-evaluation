import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { validateQuery } from '../middleware/validation.middleware';
import { locations, meta } from '../controllers/market.controller';
import { marketLocationsQuerySchema, marketMetaQuerySchema } from '../validators/market.schema';

export const marketRouter = Router();

marketRouter.use(requireAuth);
marketRouter.get('/meta', validateQuery(marketMetaQuerySchema), meta);
marketRouter.get('/locations', validateQuery(marketLocationsQuerySchema), locations);
