import { supabaseAdmin } from '../config/supabase';
import type { AreaUnit, MarketComparable, PropertyType } from '../types/domain';
import { areaUnits, propertyTypes } from '../types/domain';
import { parseComparable, throwIfDbError } from '../utils/rows';
import { median } from './investment.service';

export interface ComparableQuery {
  property_type: MarketComparable['property_type'];
  country: string;
  city: string;
  location?: string;
  area_unit: MarketComparable['area_unit'];
  currency: string;
}

export type ComparableMatchScope = 'location' | 'nearby' | 'city' | 'city_any_unit' | 'none';

export interface ComparableSearchResult {
  comparables: MarketComparable[];
  match_scope: ComparableMatchScope;
}

export interface MarketDataProvider {
  findComparables(input: ComparableQuery): Promise<ComparableSearchResult>;
}

export interface MarketContext {
  market_data_available: boolean;
  comparable_count: number;
  match_scope: ComparableMatchScope;
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

export interface MarketCityOption {
  city: string;
  count: number;
}

export interface MarketTypeOption {
  property_type: PropertyType;
  count: number;
}

export interface MarketUnitOption {
  area_unit: AreaUnit;
  count: number;
}

const SELECT_FIELDS =
  'id, property_type, country, city, location, property_size, area_unit, covered_area, sale_price, currency, transaction_date, source, verification_status';

const KNOWN_CITIES = ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad'] as const;

function normalizeCurrency(value: string): string {
  return value.trim().toUpperCase();
}

function locationTokens(location: string): string[] {
  return location
    .trim()
    .split(/[\s,/_-]+/)
    .map((token) => token.trim())
    .filter((token) => token.length >= 3)
    .slice(0, 6);
}

function matchesLocationToken(location: string, tokens: string[]): boolean {
  const haystack = location.toLowerCase();
  return tokens.some((token) => haystack.includes(token.toLowerCase()));
}

export function preferLocationMatches(
  rows: MarketComparable[],
  location: string | undefined,
): { rows: MarketComparable[]; scope: ComparableMatchScope } {
  if (!location?.trim()) {
    return { rows, scope: rows.length > 0 ? 'city' : 'none' };
  }

  const needle = location.trim().toLowerCase();
  const exactish = rows.filter((row) => row.location.toLowerCase().includes(needle));
  if (exactish.length > 0) {
    return { rows: exactish, scope: 'location' };
  }

  const tokens = locationTokens(location);
  if (tokens.length === 0) {
    return { rows, scope: rows.length > 0 ? 'city' : 'none' };
  }

  const nearby = rows.filter((row) => matchesLocationToken(row.location, tokens));
  if (nearby.length > 0) {
    return { rows: nearby, scope: 'nearby' };
  }

  return { rows, scope: rows.length > 0 ? 'city' : 'none' };
}

async function queryComparables(input: {
  property_type: PropertyType;
  city: string;
  area_unit?: AreaUnit;
  locationContains?: string;
  limit: number;
}): Promise<MarketComparable[]> {
  let query = supabaseAdmin
    .from('market_comparables')
    .select(SELECT_FIELDS)
    .eq('verification_status', 'verified')
    .eq('property_type', input.property_type)
    .ilike('city', input.city.trim())
    .order('transaction_date', { ascending: false })
    .limit(input.limit);

  if (input.area_unit) {
    query = query.eq('area_unit', input.area_unit);
  }
  if (input.locationContains?.trim()) {
    query = query.ilike('location', `%${input.locationContains.trim()}%`);
  }

  const { data, error } = await query;
  throwIfDbError(error, 'Failed to load market comparables');
  return (data ?? []).map((row) => parseComparable(row));
}

export class SupabaseComparablesProvider implements MarketDataProvider {
  async findComparables(input: ComparableQuery): Promise<ComparableSearchResult> {
    const currency = normalizeCurrency(input.currency);
    const location = input.location?.trim() || undefined;

    const filterCurrency = (rows: MarketComparable[]) =>
      rows.filter((row) => row.currency === currency);

    if (location) {
      const areaRows = filterCurrency(
        await queryComparables({
          property_type: input.property_type,
          city: input.city,
          area_unit: input.area_unit,
          locationContains: location,
          limit: 20,
        }),
      );
      if (areaRows.length > 0) {
        return { comparables: areaRows.slice(0, 20), match_scope: 'location' };
      }
    }

    const cityUnitRows = filterCurrency(
      await queryComparables({
        property_type: input.property_type,
        city: input.city,
        area_unit: input.area_unit,
        limit: 80,
      }),
    );
    const preferred = preferLocationMatches(cityUnitRows, location);
    if (preferred.rows.length > 0) {
      return {
        comparables: preferred.rows.slice(0, 20),
        match_scope: preferred.scope === 'none' ? 'city' : preferred.scope,
      };
    }

    const cityAnyUnit = filterCurrency(
      await queryComparables({
        property_type: input.property_type,
        city: input.city,
        limit: 80,
      }),
    );
    const preferredAny = preferLocationMatches(cityAnyUnit, location);
    if (preferredAny.rows.length > 0) {
      return {
        comparables: preferredAny.rows.slice(0, 20),
        match_scope: preferredAny.scope === 'location' || preferredAny.scope === 'nearby'
          ? preferredAny.scope
          : 'city_any_unit',
      };
    }

    return { comparables: [], match_scope: 'none' };
  }
}

export const marketDataProvider: MarketDataProvider = new SupabaseComparablesProvider();

export function summarizeComparables(
  comparables: MarketComparable[],
  matchScope: ComparableMatchScope = comparables.length > 0 ? 'city' : 'none',
): MarketContext {
  if (comparables.length === 0) {
    return {
      market_data_available: false,
      comparable_count: 0,
      match_scope: 'none',
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
    match_scope: matchScope,
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

async function countVerified(filters: {
  city?: string;
  property_type?: PropertyType;
  area_unit?: AreaUnit;
}): Promise<number> {
  let query = supabaseAdmin
    .from('market_comparables')
    .select('id', { count: 'exact', head: true })
    .eq('verification_status', 'verified');
  if (filters.city?.trim()) query = query.ilike('city', filters.city.trim());
  if (filters.property_type) query = query.eq('property_type', filters.property_type);
  if (filters.area_unit) query = query.eq('area_unit', filters.area_unit);
  const { count, error } = await query;
  throwIfDbError(error, 'Failed to aggregate market comparables');
  return count ?? 0;
}

export async function listMarketCities(): Promise<MarketCityOption[]> {
  const results: MarketCityOption[] = [];
  for (const city of KNOWN_CITIES) {
    const count = await countVerified({ city });
    if (count > 0) results.push({ city, count });
  }
  return results.sort((a, b) => b.count - a.count || a.city.localeCompare(b.city));
}

export async function listMarketPropertyTypes(city?: string): Promise<MarketTypeOption[]> {
  const results: MarketTypeOption[] = [];
  for (const property_type of propertyTypes) {
    const count = await countVerified({ city, property_type });
    if (count > 0) results.push({ property_type, count });
  }
  return results.sort((a, b) => b.count - a.count);
}

export async function listMarketAreaUnits(city?: string, propertyType?: PropertyType): Promise<MarketUnitOption[]> {
  const results: MarketUnitOption[] = [];
  for (const area_unit of areaUnits) {
    const count = await countVerified({
      city,
      property_type: propertyType,
      area_unit,
    });
    if (count > 0) results.push({ area_unit, count });
  }
  return results.sort((a, b) => b.count - a.count);
}

export async function listMarketLocations(city: string, queryText = '', limit = 25): Promise<string[]> {
  const trimmedCity = city.trim();
  if (!trimmedCity) return [];

  let query = supabaseAdmin
    .from('market_comparables')
    .select('location')
    .eq('verification_status', 'verified')
    .ilike('city', trimmedCity)
    .order('location', { ascending: true })
    .limit(Math.min(Math.max(limit * 6, 60), 240));

  if (queryText.trim()) {
    query = query.ilike('location', `%${queryText.trim()}%`);
  }

  const { data, error } = await query;
  throwIfDbError(error, 'Failed to load market locations');

  const unique: string[] = [];
  const seen = new Set<string>();
  for (const row of data ?? []) {
    const location = typeof row.location === 'string' ? row.location.trim() : '';
    if (!location) continue;
    const key = location.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(location);
    if (unique.length >= limit) break;
  }
  return unique;
}
