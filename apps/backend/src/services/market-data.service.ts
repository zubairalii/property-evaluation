import { supabaseAdmin } from '../config/supabase';
import type { MarketComparable } from '../types/domain';
import { parseComparable, throwIfDbError } from '../utils/rows';
import { median } from './investment.service';

export interface ComparableQuery {
  property_type: MarketComparable['property_type'];
  country: string;
  city: string;
  area_unit: MarketComparable['area_unit'];
  currency: string;
}

export interface MarketDataProvider {
  findComparables(input: ComparableQuery): Promise<MarketComparable[]>;
}

export interface MarketContext {
  market_data_available: boolean;
  comparable_count: number;
  summary: {
    min_sale_price: number;
    max_sale_price: number;
    median_sale_price: number;
    sources: string[];
  } | null;
  comparables: Array<{
    id: string;
    location: string;
    property_size: number;
    covered_area: number | null;
    sale_price: number;
    currency: string;
    transaction_date: string;
    source: string;
  }>;
}

export class SupabaseComparablesProvider implements MarketDataProvider {
  async findComparables(input: ComparableQuery): Promise<MarketComparable[]> {
    const { data, error } = await supabaseAdmin
      .from('market_comparables')
      .select(
        'id, property_type, country, city, location, property_size, area_unit, covered_area, sale_price, currency, transaction_date, source, verification_status',
      )
      .eq('verification_status', 'verified')
      .eq('property_type', input.property_type)
      .eq('area_unit', input.area_unit)
      .ilike('country', input.country.trim())
      .ilike('city', input.city.trim())
      .order('transaction_date', { ascending: false })
      .limit(20);

    throwIfDbError(error, 'Failed to load market comparables');
    const currency = input.currency.trim().toUpperCase();
    return (data ?? [])
      .map((row) => parseComparable(row))
      .filter((row) => row.currency === currency);
  }
}

export const marketDataProvider: MarketDataProvider = new SupabaseComparablesProvider();

export function summarizeComparables(comparables: MarketComparable[]): MarketContext {
  if (comparables.length === 0) {
    return {
      market_data_available: false,
      comparable_count: 0,
      summary: null,
      comparables: [],
    };
  }

  const prices = comparables.map((row) => row.sale_price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const mid = median(prices);
  return {
    market_data_available: true,
    comparable_count: comparables.length,
    summary:
      mid == null
        ? null
        : {
            min_sale_price: min,
            max_sale_price: max,
            median_sale_price: mid,
            sources: [...new Set(comparables.map((row) => row.source))],
          },
    comparables: comparables.map((row) => ({
      id: row.id,
      location: row.location,
      property_size: row.property_size,
      covered_area: row.covered_area,
      sale_price: row.sale_price,
      currency: row.currency,
      transaction_date: row.transaction_date,
      source: row.source,
    })),
  };
}
