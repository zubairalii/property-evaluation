import { describe, expect, it } from 'vitest';
import { createEvaluationSchema } from './evaluation.schema';

const validInput = {
  property_title: 'Corner house',
  property_type: 'house',
  country: 'Pakistan',
  city: 'Lahore',
  location: 'DHA Phase 5',
  property_size: 10,
  area_unit: 'marla',
  covered_area: 2200,
  bedrooms: 4,
  bathrooms: 4,
  property_condition: 'good',
  asking_price: 45000000,
  currency: 'pkr',
};

describe('createEvaluationSchema', () => {
  it('accepts a complete property submission and normalizes currency', () => {
    const parsed = createEvaluationSchema.parse(validInput);
    expect(parsed.currency).toBe('PKR');
    expect(parsed.property_title).toBe('Corner house');
  });

  it('rejects a non-positive asking price', () => {
    const result = createEvaluationSchema.safeParse({ ...validInput, asking_price: 0 });
    expect(result.success).toBe(false);
  });

  it('rejects an unknown property type', () => {
    const result = createEvaluationSchema.safeParse({ ...validInput, property_type: 'villa' });
    expect(result.success).toBe(false);
  });

  it('allows optional details to be omitted', () => {
    const { property_title, covered_area, bedrooms, bathrooms, ...required } = validInput;
    void property_title;
    void covered_area;
    void bedrooms;
    void bathrooms;
    const parsed = createEvaluationSchema.parse(required);
    expect(parsed.bedrooms).toBeNull();
    expect(parsed.property_title).toBeNull();
  });
});
