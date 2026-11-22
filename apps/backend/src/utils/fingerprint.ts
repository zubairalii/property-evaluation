import { createHash } from 'crypto';
import type { PropertyInput } from '../types/domain';

export function buildInputFingerprint(input: PropertyInput): string {
  const normalized = {
    property_type: input.property_type,
    country: input.country.trim().toLowerCase(),
    city: input.city.trim().toLowerCase(),
    location: input.location.trim().toLowerCase(),
    property_size: input.property_size,
    area_unit: input.area_unit,
    covered_area: input.covered_area,
    bedrooms: input.bedrooms,
    bathrooms: input.bathrooms,
    property_condition: input.property_condition,
    asking_price: input.asking_price,
    currency: input.currency.trim().toUpperCase(),
  };
  return createHash('sha256').update(JSON.stringify(normalized)).digest('hex');
}
