import { z } from 'zod';
import { propertyTypes } from '../types/domain';

export const marketMetaQuerySchema = z.object({
  city: z.string().trim().min(2).max(80).optional(),
  property_type: z.enum(propertyTypes).optional(),
});

export const marketLocationsQuerySchema = z.object({
  city: z.string().trim().min(2).max(80),
  q: z.string().trim().max(80).optional().default(''),
  limit: z.coerce.number().int().min(1).max(50).optional().default(25),
});
