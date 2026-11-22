import type { Evaluation, EvaluationResult, EvaluationView, PriceStatus } from '../types/domain';

export const VALUATION_DISCLAIMER =
  'AI valuations are estimates based on the details you submit and any verified market records on file. They are not certified professional property valuations.';

export const INVESTMENT_DISCLAIMER =
  'Investment recommendations are informational only and are not guaranteed financial, legal, or real estate advice.';

export const NO_MARKET_DATA_NOTE =
  'No verified market comparables were available, so a numeric valuation was not produced.';

export function priceDifference(askingPrice: number, estimatedValue: number | null): number | null {
  if (estimatedValue == null) return null;
  return Math.round((askingPrice - estimatedValue) * 100) / 100;
}

export function derivePriceStatus(askingPrice: number, estimatedValue: number | null): PriceStatus {
  if (estimatedValue == null || estimatedValue <= 0) return 'unknown';
  const ratio = askingPrice / estimatedValue;
  if (ratio < 0.95) return 'underpriced';
  if (ratio > 1.05) return 'overpriced';
  return 'fairly_priced';
}

export function toEvaluationView(evaluation: Evaluation, result: EvaluationResult | null): EvaluationView {
  return {
    evaluation,
    result,
    price_difference: result ? priceDifference(evaluation.asking_price, result.estimated_value) : null,
    disclaimers: {
      valuation: VALUATION_DISCLAIMER,
      investment: INVESTMENT_DISCLAIMER,
    },
  };
}

export function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const left = sorted[mid - 1];
  const right = sorted[mid];
  if (sorted.length % 2 === 0) {
    if (left === undefined || right === undefined) return null;
    return (left + right) / 2;
  }
  return right ?? null;
}
