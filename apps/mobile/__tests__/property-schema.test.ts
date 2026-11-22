import { propertyFormSchema, toPropertyPayload } from '../lib/validation/property';

describe('property submission', () => {
  const valid = {
    property_title: 'Corner house',
    property_type: 'house' as const,
    country: 'Pakistan',
    city: 'Lahore',
    location: 'DHA Phase 5',
    property_size: '10',
    area_unit: 'marla' as const,
    covered_area: '',
    bedrooms: '4',
    bathrooms: '',
    property_condition: 'good' as const,
    asking_price: '45000000',
    currency: 'PKR',
  };

  it('accepts a complete property form', () => {
    const parsed = propertyFormSchema.parse(valid);
    const payload = toPropertyPayload(parsed);
    expect(payload.asking_price).toBe(45000000);
    expect(payload.covered_area).toBeNull();
    expect(payload.bathrooms).toBeNull();
    expect(payload.bedrooms).toBe(4);
  });

  it('rejects a missing asking price', () => {
    const result = propertyFormSchema.safeParse({ ...valid, asking_price: '' });
    expect(result.success).toBe(false);
  });
});
