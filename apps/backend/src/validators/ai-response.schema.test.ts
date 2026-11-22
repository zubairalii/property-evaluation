import { describe, expect, it } from 'vitest';
import { aiResponseSchema } from './ai-response.schema';

const priced = {
  estimated_value: 25_000_000,
  minimum_value: 23_000_000,
  maximum_value: 27_000_000,
  currency: 'PKR',
  price_status: 'overpriced',
  investment_recommendation: 'consider_carefully',
  confidence_level: 'medium',
  valuation_explanation: 'Based on the verified comparables supplied with this request.',
  positive_factors: ['Suitable property size'],
  risk_factors: ['Asking price is above the estimated value'],
  considerations: ['Confirm the title documents'],
  investment_analysis: 'Negotiate before purchase.',
};

describe('aiResponseSchema', () => {
  it('accepts a priced valuation', () => {
    expect(aiResponseSchema.parse(priced).estimated_value).toBe(25_000_000);
  });

  it('accepts an insufficient-data response with null prices', () => {
    const parsed = aiResponseSchema.parse({
      ...priced,
      estimated_value: null,
      minimum_value: null,
      maximum_value: null,
      price_status: 'unknown',
      investment_recommendation: 'insufficient_data',
      confidence_level: 'insufficient_data',
    });
    expect(parsed.estimated_value).toBeNull();
  });

  it('rejects a priced result marked as insufficient data', () => {
    const result = aiResponseSchema.safeParse({
      ...priced,
      confidence_level: 'insufficient_data',
      investment_recommendation: 'insufficient_data',
      price_status: 'unknown',
    });
    expect(result.success).toBe(false);
  });

  it('rejects a range where the minimum exceeds the estimate', () => {
    const result = aiResponseSchema.safeParse({
      ...priced,
      minimum_value: 26_000_000,
    });
    expect(result.success).toBe(false);
  });

  it('rejects an unknown price status', () => {
    const result = aiResponseSchema.safeParse({ ...priced, price_status: 'cheap' });
    expect(result.success).toBe(false);
  });
});
