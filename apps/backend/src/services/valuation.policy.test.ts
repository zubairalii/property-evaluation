import { describe, expect, it } from 'vitest';
import type { AiValuation } from '../validators/ai-response.schema';
import { derivePriceStatus } from './investment.service';
import { applyMarketDataPolicy } from './valuation.service';

const priced: AiValuation = {
  estimated_value: 25_000_000,
  minimum_value: 23_000_000,
  maximum_value: 27_000_000,
  currency: 'PKR',
  price_status: 'fairly_priced',
  investment_recommendation: 'consider_carefully',
  confidence_level: 'medium',
  valuation_explanation: 'A model estimate.',
  positive_factors: ['Good condition'],
  risk_factors: ['Limited sample'],
  considerations: ['Inspect the structure'],
  investment_analysis: 'Review the price.',
};

describe('valuation policy', () => {
  it('classifies asking price against the estimate', () => {
    expect(derivePriceStatus(20_000_000, 25_000_000)).toBe('underpriced');
    expect(derivePriceStatus(25_000_000, 25_000_000)).toBe('fairly_priced');
    expect(derivePriceStatus(30_000_000, 25_000_000)).toBe('overpriced');
    expect(derivePriceStatus(30_000_000, null)).toBe('unknown');
  });

  it('removes numeric estimates when no verified comparables exist', () => {
    const result = applyMarketDataPolicy(priced, 0, 30_000_000);
    expect(result.estimated_value).toBeNull();
    expect(result.confidence_level).toBe('insufficient_data');
    expect(result.investment_recommendation).toBe('insufficient_data');
    expect(result.price_status).toBe('unknown');
    expect(result.valuation_explanation).toContain('No verified market comparables');
  });

  it('overrides price status from the asking price when comparables exist', () => {
    const result = applyMarketDataPolicy(priced, 4, 30_000_000);
    expect(result.estimated_value).toBe(25_000_000);
    expect(result.price_status).toBe('overpriced');
  });
});
