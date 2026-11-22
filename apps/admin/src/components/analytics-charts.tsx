'use client';

import type { ReactElement } from 'react';
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { titleCase } from '@/lib/format';
import type { AnalyticsData } from '@/lib/types';

export function AnalyticsCharts({ data }: { data: AnalyticsData }) {
  const types = data.by_property_type.map((row) => ({ ...row, label: titleCase(row.property_type) }));
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <ChartCard title="Evaluations over time">
        <LineChart data={data.evaluations_over_time}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" minTickGap={24} />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Line type="monotone" dataKey="count" stroke="#2563EB" strokeWidth={2} dot={false} />
        </LineChart>
      </ChartCard>
      <ChartCard title="User registrations over time">
        <LineChart data={data.registrations_over_time}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" minTickGap={24} />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Line type="monotone" dataKey="count" stroke="#172554" strokeWidth={2} dot={false} />
        </LineChart>
      </ChartCard>
      <ChartCard title="Evaluations by property type">
        <BarChart data={types}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="label" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="count" fill="#2563EB" radius={4} />
        </BarChart>
      </ChartCard>
      <ChartCard title="Evaluations by city">
        <BarChart data={data.by_city}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="city" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="count" fill="#172554" radius={4} />
        </BarChart>
      </ChartCard>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: ReactElement }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
