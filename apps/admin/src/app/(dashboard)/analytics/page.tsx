'use client';

import { useQuery } from '@tanstack/react-query';
import { AnalyticsCharts } from '@/components/analytics-charts';
import { apiGet, getErrorMessage } from '@/lib/api';
import type { AnalyticsData } from '@/lib/types';

export default function AnalyticsPage() {
  const query = useQuery({
    queryKey: ['admin', 'analytics', 90],
    queryFn: () => apiGet<AnalyticsData>('/admin/analytics', { days: 90 }),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[#172554]">Analytics</h1>
        <p className="text-sm text-slate-500">Evaluations and registrations for the last 90 days. Days are grouped in UTC.</p>
      </div>
      {query.isLoading ? <p>Loading analytics…</p> : null}
      {query.isError ? <p className="text-red-600">{getErrorMessage(query.error)}</p> : null}
      {query.data ? <AnalyticsCharts data={query.data.data} /> : null}
    </div>
  );
}
