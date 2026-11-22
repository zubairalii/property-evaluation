'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '@/components/ui/table';
import { formatDate, formatMoney, titleCase } from '@/lib/format';
import type { DashboardData } from '@/lib/types';

export function DashboardOverview({
  loading,
  error,
  data,
}: {
  loading: boolean;
  error: string | null;
  data: DashboardData | null;
}) {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-28" />
        ))}
      </div>
    );
  }

  if (error) {
    return <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">Unable to load the dashboard. {error}</div>;
  }

  if (!data || data.total_evaluations === 0) {
    return (
      <div className="space-y-4">
        <StatGrid data={data} />
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-slate-600">
          No evaluations yet. They will appear here after users submit properties.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <StatGrid data={data} />
      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent registrations</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>Name</TableHeaderCell>
                  <TableHeaderCell>Email</TableHeaderCell>
                  <TableHeaderCell>Joined</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.recent_users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.full_name || 'Unnamed'}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{formatDate(user.created_at)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent evaluations</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>Property</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                  <TableHeaderCell>Asking</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.recent_evaluations.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      {item.property_title || titleCase(item.property_type)} · {item.city}
                    </TableCell>
                    <TableCell>{titleCase(item.status)}</TableCell>
                    <TableCell>{formatMoney(item.asking_price, item.currency)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatGrid({ data }: { data: DashboardData | null }) {
  const stats = [
    ['Registered users', data?.total_users ?? 0],
    ['Property evaluations', data?.total_evaluations ?? 0],
    ['Completed', data?.evaluations_completed ?? 0],
    ['Failed', data?.evaluations_failed ?? 0],
  ];
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {stats.map(([label, value]) => (
        <Card key={String(label)}>
          <CardHeader>
            <CardTitle>{label}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-[#172554]">{value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
