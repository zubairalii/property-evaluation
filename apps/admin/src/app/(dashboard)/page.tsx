'use client';

import { useQuery } from '@tanstack/react-query';
import { AnalyticsCharts } from '@/components/analytics-charts';
import { DashboardOverview } from '@/components/dashboard-overview';
import { apiGet, getErrorMessage } from '@/lib/api';
import type { AnalyticsData, DashboardData } from '@/lib/types';

export default function OverviewPage() {
  const dashboard = useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: () => apiGet<DashboardData>('/admin/dashboard'),
  });
  const analytics = useQuery({
    queryKey: ['admin', 'analytics', 30],
    queryFn: () => apiGet<AnalyticsData>('/admin/analytics', { days: 30 }),
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-[#172554]">Overview</h1>
        <p className="text-sm text-slate-500">Users, evaluations, and the last 30 days of activity.</p>
      </div>
      <DashboardOverview
        loading={dashboard.isLoading}
        error={dashboard.isError ? getErrorMessage(dashboard.error) : null}
        data={dashboard.data?.data ?? null}
      />
      {analytics.data ? <AnalyticsCharts data={analytics.data.data} /> : null}
      {analytics.isError ? <p className="text-sm text-red-600">{getErrorMessage(analytics.error)}</p> : null}
    </div>
  );
}
