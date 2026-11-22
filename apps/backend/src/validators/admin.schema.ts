import { z } from 'zod';
import { evaluationStatuses, propertyTypes, verificationStatuses } from '../types/domain';

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

export const adminComparablesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  city: z
    .string()
    .trim()
    .max(80)
    .optional()
    .transform((value) => (value && value.length > 0 ? value : undefined)),
  property_type: z.enum(propertyTypes).optional(),
  location: z
    .string()
    .trim()
    .max(120)
    .optional()
    .transform((value) => (value && value.length > 0 ? value : undefined)),
  verification_status: z.enum(verificationStatuses).optional(),
});

export const analyticsQuerySchema = z.object({
  days: z.coerce.number().int().min(7).max(365).default(30),
});

export type AdminListQuery = z.infer<typeof adminListQuerySchema>;
export type AdminEvaluationQuery = z.infer<typeof adminEvaluationQuerySchema>;
export type AdminComparablesQuery = z.infer<typeof adminComparablesQuerySchema>;

export function sanitizeSearch(value: string): string {
  return value.replace(/[%_,()]/g, ' ').replace(/\s+/g, ' ').trim();
}
