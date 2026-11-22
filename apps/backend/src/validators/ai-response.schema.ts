import { z } from 'zod';
import {
  accountStatuses,
  confidenceLevels,
  investmentRecommendations,
  priceStatuses,
} from '../types/domain';

export const aiResponseSchema = z
  .object({
    estimated_value: z.number().positive().nullable(),
    minimum_value: z.number().positive().nullable(),
    maximum_value: z.number().positive().nullable(),
    currency: z.string().trim().min(3).max(3),
    price_status: z.enum(priceStatuses),
    investment_recommendation: z.enum(investmentRecommendations),
    confidence_level: z.enum(confidenceLevels),
    valuation_explanation: z.string().trim().min(1).max(4000),
    positive_factors: z.array(z.string().trim().min(1).max(300)).max(12),
    risk_factors: z.array(z.string().trim().min(1).max(300)).max(12),
    considerations: z.array(z.string().trim().min(1).max(300)).max(12),
    investment_analysis: z.string().trim().min(1).max(4000),
  })
  .superRefine((value, ctx) => {
    const insufficient =
      value.confidence_level === 'insufficient_data' ||
      value.investment_recommendation === 'insufficient_data' ||
      value.price_status === 'unknown';

    if (insufficient) {
      if (value.estimated_value !== null || value.minimum_value !== null || value.maximum_value !== null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Insufficient-data valuations cannot include price estimates',
          path: ['estimated_value'],
        });
      }
      if (value.confidence_level !== 'insufficient_data') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'confidence_level must be insufficient_data when a price is not supported',
          path: ['confidence_level'],
        });
      }
      if (value.price_status !== 'unknown') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'price_status must be unknown when a price is not supported',
          path: ['price_status'],
        });
      }
      if (value.investment_recommendation !== 'insufficient_data') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'investment_recommendation must be insufficient_data when a price is not supported',
          path: ['investment_recommendation'],
        });
      }
      return;
    }

    if (value.estimated_value === null || value.minimum_value === null || value.maximum_value === null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'A supported valuation requires minimum, estimated, and maximum values',
        path: ['estimated_value'],
      });
      return;
    }

    if (value.minimum_value > value.estimated_value || value.estimated_value > value.maximum_value) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'minimum_value must be <= estimated_value <= maximum_value',
        path: ['minimum_value'],
      });
    }
  });

export type AiValuation = z.infer<typeof aiResponseSchema>;

export const VALUATION_JSON_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: [
    'estimated_value',
    'minimum_value',
    'maximum_value',
    'currency',
    'price_status',
    'investment_recommendation',
    'confidence_level',
    'valuation_explanation',
    'positive_factors',
    'risk_factors',
    'investment_analysis',
    'considerations',
  ],
  properties: {
    estimated_value: { type: ['number', 'null'] },
    minimum_value: { type: ['number', 'null'] },
    maximum_value: { type: ['number', 'null'] },
    currency: { type: 'string' },
    price_status: {
      type: 'string',
      enum: ['underpriced', 'fairly_priced', 'overpriced', 'unknown'],
    },
    investment_recommendation: {
      type: 'string',
      enum: ['good_investment', 'consider_carefully', 'not_recommended', 'insufficient_data'],
    },
    confidence_level: {
      type: 'string',
      enum: ['low', 'medium', 'high', 'insufficient_data'],
    },
    valuation_explanation: { type: 'string' },
    positive_factors: { type: 'array', items: { type: 'string' } },
    risk_factors: { type: 'array', items: { type: 'string' } },
    investment_analysis: { type: 'string' },
    considerations: { type: 'array', items: { type: 'string' } },
  },
} as const;

export const accountStatusSchema = z.object({
  status: z.enum(accountStatuses),
});
