import { describe, expect, it } from 'vitest';
import type { MarketComparable } from '../types/domain';
import { preferLocationMatches } from './market-data.service';

function row(location: string): MarketComparable {
  return {
    id: location,
    property_type: 'house',
    country: 'Pakistan',
    city: 'Karachi',
    location,
    property_size: 120,
    area_unit: 'square_yards',
    covered_area: null,
    sale_price: 7_000_000,
    currency: 'PKR',
    transaction_date: '2025-01-01',
    source: 'test',
    verification_status: 'verified',
  };
}

describe('preferLocationMatches', () => {
  const rows = [row('PECHS Block 6'), row('DHA Phase 6'), row('North Nazimabad Block A')];

  it('prefers direct area matches first', () => {
    const result = preferLocationMatches(rows, 'PECHS Block 6');
    expect(result.scope).toBe('location');
    expect(result.rows.map((item) => item.location)).toEqual(['PECHS Block 6']);
  });

  it('falls back to nearby token matches', () => {
    const result = preferLocationMatches(rows, 'PECHS');
    expect(result.scope).toBe('location');
    expect(result.rows[0]?.location).toContain('PECHS');
  });

  it('uses city-wide rows when no area match exists', () => {
    const result = preferLocationMatches(rows, 'Gulshan Iqbal');
    expect(result.scope).toBe('city');
    expect(result.rows).toHaveLength(3);
  });
});
