'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '@/components/ui/table';
import { apiGet, getErrorMessage } from '@/lib/api';
import { formatDate, formatMoney, titleCase, toEvaluationParams, type EvaluationFilters } from '@/lib/format';
import type { EvaluationSummary } from '@/lib/types';

const empty: EvaluationFilters = { page: 1, limit: 20, search: '', propertyType: '', status: '' };

export default function EvaluationsPage() {
  const [draft, setDraft] = useState(empty);
  const [filters, setFilters] = useState(empty);
  const query = useQuery({
    queryKey: ['admin', 'evaluations', filters],
    queryFn: () => apiGet<EvaluationSummary[]>('/admin/evaluations', toEvaluationParams(filters)),
  });
  const total = query.data?.meta?.total ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[#172554]">Property evaluations</h1>
        <p className="text-sm text-slate-500">Search by location and filter by type or status.</p>
      </div>
      <form
        className="grid gap-3 md:grid-cols-4"
        onSubmit={(event) => {
          event.preventDefault();
          setFilters({ ...draft, page: 1 });
        }}
      >
        <Input placeholder="City, area, or country" value={draft.search} onChange={(event) => setDraft({ ...draft, search: event.target.value })} />
        <select className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm" value={draft.propertyType} onChange={(event) => setDraft({ ...draft, propertyType: event.target.value })}>
          <option value="">All types</option>
          <option value="house">House</option>
          <option value="apartment">Apartment</option>
          <option value="residential_plot">Residential plot</option>
          <option value="commercial_property">Commercial property</option>
        </select>
        <select className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm" value={draft.status} onChange={(event) => setDraft({ ...draft, status: event.target.value })}>
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
        </select>
        <Button type="submit">Apply filters</Button>
      </form>
      {query.isLoading ? <p>Loading evaluations…</p> : null}
      {query.isError ? <p className="text-red-600">{getErrorMessage(query.error)}</p> : null}
      <div className="rounded-xl border border-slate-200 bg-white">
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Property</TableHeaderCell>
              <TableHeaderCell>User</TableHeaderCell>
              <TableHeaderCell>Type</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell>Asking</TableHeaderCell>
              <TableHeaderCell>Date</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(query.data?.data ?? []).map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <Link className="font-medium text-[#2563EB]" href={`/evaluations/${item.id}`}>
                    {item.property_title || `${titleCase(item.property_type)} in ${item.city}`}
                  </Link>
                  <p className="text-xs text-slate-500">
                    {item.location}, {item.city}
                  </p>
                </TableCell>
                <TableCell>{item.user?.email ?? 'Unknown'}</TableCell>
                <TableCell>{titleCase(item.property_type)}</TableCell>
                <TableCell>
                  <Badge>{titleCase(item.status)}</Badge>
                </TableCell>
                <TableCell>{formatMoney(item.asking_price, item.currency)}</TableCell>
                <TableCell>{formatDate(item.created_at)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {!query.isLoading && (query.data?.data.length ?? 0) === 0 ? <p className="p-6 text-sm text-slate-500">No evaluations match these filters.</p> : null}
      </div>
      <div className="flex items-center justify-between text-sm text-slate-500">
        <span>{total} evaluations</span>
        <div className="flex gap-2">
          <Button variant="outline" disabled={filters.page === 1} onClick={() => setFilters({ ...filters, page: filters.page - 1 })}>
            Previous
          </Button>
          <Button variant="outline" disabled={filters.page * filters.limit >= total} onClick={() => setFilters({ ...filters, page: filters.page + 1 })}>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
