import { z } from 'zod';
import { evaluationStatuses, propertyTypes } from '../types/domain';

export const adminListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z
    .string()
    .trim()
    .max(120)
    .optional()
    .transform((value) => (value && value.length > 0 ? value : undefined)),
});

export const adminEvaluationQuerySchema = adminListQuerySchema.extend({
  property_type: z.enum(propertyTypes).optional(),
  status: z.enum(evaluationStatuses).optional(),
});

export const analyticsQuerySchema = z.object({
  days: z.coerce.number().int().min(7).max(365).default(30),
});

export type AdminListQuery = z.infer<typeof adminListQuerySchema>;
export type AdminEvaluationQuery = z.infer<typeof adminEvaluationQuerySchema>;

export function sanitizeSearch(value: string): string {
  return value.replace(/[%_,()]/g, ' ').replace(/\s+/g, ' ').trim();
}
