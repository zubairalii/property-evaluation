import { z } from 'zod';
import { areaUnits, propertyConditions, propertyTypes } from '../types/domain';

const optionalText = z
  .string()
  .trim()
  .max(120)
  .optional()
  .nullable()
  .transform((value) => (value && value.length > 0 ? value : null));

const optionalPositive = z
  .number()
  .positive()
  .optional()
  .nullable()
  .transform((value) => value ?? null);

const optionalCount = z
  .number()
  .int()
  .min(0)
  .max(50)
  .optional()
  .nullable()
  .transform((value) => value ?? null);

export const createEvaluationSchema = z.object({
  property_title: optionalText,
  property_type: z.enum(propertyTypes),
  country: z
    .string()
    .trim()
    .max(80)
    .optional()
    .transform((value) => (value && value.length >= 2 ? value : 'Pakistan')),
  city: z.string().trim().min(2).max(80),
  location: z.string().trim().min(2).max(120),
  property_size: z.number().positive().max(1_000_000_000),
  area_unit: z.enum(areaUnits),
  covered_area: optionalPositive,
  bedrooms: optionalCount,
  bathrooms: optionalCount,
  property_condition: z.enum(propertyConditions),
  asking_price: z.number().positive().max(1_000_000_000_000),
  currency: z
    .string()
    .trim()
    .regex(/^[A-Za-z]{3}$/, 'Currency must be a 3-letter code')
    .transform((value) => value.toUpperCase()),
});

export const evaluationIdSchema = z.object({
  id: z.string().uuid(),
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type CreateEvaluationInput = z.infer<typeof createEvaluationSchema>;
