'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '@/components/ui/table';
import { apiGet, getErrorMessage } from '@/lib/api';
import { formatMoney, titleCase } from '@/lib/format';
import { labelFor, propertyTypeOptions } from '@/lib/labels';
import type { MarketComparable } from '@/lib/types';

interface MarketMeta {
  cities: Array<{ city: string; count: number }>;
  property_types: Array<{ property_type: string; count: number }>;
  area_units: Array<{ area_unit: string; count: number }>;
}

interface ComparableFilters {
  page: number;
  limit: number;
  city: string;
  propertyType: string;
  location: string;
}

const empty: ComparableFilters = {
  page: 1,
  limit: 20,
  city: '',
  propertyType: '',
  location: '',
};

const selectClassName = 'h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm';

function toParams(filters: ComparableFilters): Record<string, string | number> {
  const params: Record<string, string | number> = {
    page: filters.page,
    limit: filters.limit,
  };
  if (filters.city.trim()) params.city = filters.city.trim();
  if (filters.propertyType) params.property_type = filters.propertyType;
  if (filters.location.trim()) params.location = filters.location.trim();
  return params;
}

export default function ComparablesPage() {
  const [draft, setDraft] = useState(empty);
  const [filters, setFilters] = useState(empty);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionBox = useRef<HTMLDivElement>(null);

  const metaQuery = useQuery({
    queryKey: ['market-meta', draft.city || null],
    queryFn: () =>
      apiGet<MarketMeta>('/market/meta', {
        city: draft.city || undefined,
      }),
  });

  const locationsQuery = useQuery({
    queryKey: ['market-locations', draft.city || null, draft.location.trim()],
    enabled: Boolean(draft.city),
    queryFn: () =>
      apiGet<string[]>('/market/locations', {
        city: draft.city,
        q: draft.location.trim() || undefined,
        limit: 25,
      }),
  });

  const query = useQuery({
    queryKey: ['admin', 'comparables', filters],
    queryFn: () => apiGet<MarketComparable[]>('/admin/comparables', toParams(filters)),
  });

  const cities = metaQuery.data?.data.cities ?? [];
  const typeOptions = useMemo(() => {
    const available = metaQuery.data?.data.property_types ?? [];
    if (!draft.city || available.length === 0) {
      return propertyTypeOptions.map((item) => ({ value: item.value, label: item.label }));
    }
    return available.map((item) => ({
      value: item.property_type,
      label: `${labelFor([...propertyTypeOptions], item.property_type)} (${item.count.toLocaleString()})`,
    }));
  }, [draft.city, metaQuery.data?.data.property_types]);

  const suggestions = locationsQuery.data?.data ?? [];
  const total = query.data?.meta?.total ?? 0;

  useEffect(() => {
    if (!draft.propertyType) return;
    if (!typeOptions.some((option) => option.value === draft.propertyType)) {
      setDraft((current) => ({ ...current, propertyType: '' }));
    }
  }, [draft.propertyType, typeOptions]);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!suggestionBox.current?.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[#172554]">Market comparables</h1>
        <p className="text-sm text-slate-500">
          Choose a city and area the same way as the mobile app, then browse matching sales.
        </p>
      </div>
      <form
        className="grid gap-3 md:grid-cols-4"
        onSubmit={(event) => {
          event.preventDefault();
          setShowSuggestions(false);
          setFilters({ ...draft, page: 1 });
        }}
      >
        <select
          className={selectClassName}
          value={draft.city}
          onChange={(event) => {
            const city = event.target.value;
            setDraft((current) => ({
              ...current,
              city,
              location: '',
              propertyType: '',
            }));
          }}
        >
          <option value="">All cities</option>
          {cities.map((item) => (
            <option key={item.city} value={item.city}>
              {item.city} ({item.count.toLocaleString()})
            </option>
          ))}
        </select>

        <select
          className={selectClassName}
          value={draft.propertyType}
          onChange={(event) => setDraft({ ...draft, propertyType: event.target.value })}
        >
          <option value="">All types</option>
          {typeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <div className="relative" ref={suggestionBox}>
          <Input
            placeholder={draft.city ? 'Start typing an area' : 'Choose a city first'}
            value={draft.location}
            disabled={!draft.city}
            onFocus={() => setShowSuggestions(true)}
            onChange={(event) => {
              setDraft({ ...draft, location: event.target.value });
              setShowSuggestions(true);
            }}
            autoComplete="off"
          />
          {draft.city && showSuggestions && suggestions.length > 0 ? (
            <ul className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-md border border-slate-200 bg-white py-1 shadow-lg">
              {suggestions.map((suggestion) => (
                <li key={suggestion}>
                  <button
                    type="button"
                    className="w-full px-3 py-2 text-left text-sm hover:bg-slate-50"
                    onClick={() => {
                      setDraft({ ...draft, location: suggestion });
                      setShowSuggestions(false);
                    }}
                  >
                    {suggestion}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <Button type="submit">Apply filters</Button>
      </form>

      {metaQuery.isError ? <p className="text-red-600">{getErrorMessage(metaQuery.error)}</p> : null}
      {query.isLoading ? <p>Loading comparables…</p> : null}
      {query.isError ? <p className="text-red-600">{getErrorMessage(query.error)}</p> : null}

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Location</TableHeaderCell>
              <TableHeaderCell>Type</TableHeaderCell>
              <TableHeaderCell>Size</TableHeaderCell>
              <TableHeaderCell>Sale price</TableHeaderCell>
              <TableHeaderCell>Date</TableHeaderCell>
              <TableHeaderCell>Source</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(query.data?.data ?? []).map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <p className="font-medium text-slate-900">{item.location}</p>
                  <p className="text-xs text-slate-500">
                    {item.city}, {item.country}
                  </p>
                </TableCell>
                <TableCell>{labelFor([...propertyTypeOptions], item.property_type)}</TableCell>
                <TableCell>
                  {item.property_size} {titleCase(item.area_unit)}
                </TableCell>
                <TableCell>{formatMoney(item.sale_price, item.currency)}</TableCell>
                <TableCell>{item.transaction_date}</TableCell>
                <TableCell className="max-w-[10rem] truncate" title={item.source}>
                  {item.source}
                </TableCell>
                <TableCell>
                  <Badge>{titleCase(item.verification_status)}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {!query.isLoading && (query.data?.data.length ?? 0) === 0 ? (
          <p className="p-6 text-sm text-slate-500">No comparables match these filters.</p>
        ) : null}
      </div>

      <div className="flex items-center justify-between text-sm text-slate-500">
        <span>
          {total.toLocaleString()} comparables
          {total > 0 ? ` · page ${filters.page} of ${Math.max(1, Math.ceil(total / filters.limit))}` : null}
        </span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            disabled={filters.page === 1}
            onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            disabled={filters.page * filters.limit >= total}
            onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
