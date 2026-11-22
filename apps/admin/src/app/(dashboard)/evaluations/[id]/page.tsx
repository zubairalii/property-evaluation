'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { apiGet, getErrorMessage } from '@/lib/api';
import { formatDate, formatMoney, titleCase } from '@/lib/format';
import type { EvaluationView } from '@/lib/types';

export default function EvaluationDetailPage() {
  const params = useParams<{ id: string }>();
  const query = useQuery({
    queryKey: ['admin', 'evaluations', params.id],
    queryFn: () => apiGet<EvaluationView>(`/admin/evaluations/${params.id}`),
  });

  if (query.isLoading) return <p>Loading evaluation…</p>;
  if (query.isError || !query.data) return <p className="text-red-600">{getErrorMessage(query.error)}</p>;
  const view = query.data.data;
  const { evaluation, result } = view;
  const limited = !result || result.estimated_value == null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[#172554]">
          {evaluation.property_title || `${titleCase(evaluation.property_type)} in ${evaluation.city}`}
        </h1>
        <p className="text-sm text-slate-500">
          {view.user?.full_name} · {view.user?.email} · {formatDate(evaluation.created_at)}
        </p>
      </div>
      <section className="grid gap-3 rounded-xl border border-slate-200 bg-white p-5 sm:grid-cols-2">
        <Fact label="Status" value={titleCase(evaluation.status)} />
        <Fact label="Type" value={titleCase(evaluation.property_type)} />
        <Fact label="Location" value={`${evaluation.location}, ${evaluation.city}, ${evaluation.country}`} />
        <Fact label="Size" value={`${evaluation.property_size} ${titleCase(evaluation.area_unit)}`} />
        <Fact label="Covered area" value={evaluation.covered_area == null ? 'Not provided' : String(evaluation.covered_area)} />
        <Fact label="Bedrooms / bathrooms" value={`${evaluation.bedrooms ?? '—'} / ${evaluation.bathrooms ?? '—'}`} />
        <Fact label="Condition" value={titleCase(evaluation.property_condition)} />
        <Fact label="Asking price" value={formatMoney(evaluation.asking_price, evaluation.currency)} />
      </section>
      {evaluation.status === 'failed' ? (
        <section className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-800">
          <h2 className="font-medium">Failure</h2>
          <p className="mt-2 text-sm">{evaluation.error_message || 'The evaluation failed without a stored error message.'}</p>
        </section>
      ) : null}
      {result ? (
        <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex flex-wrap gap-2">
            <Badge>{titleCase(result.price_status)}</Badge>
            <Badge>{titleCase(result.investment_recommendation)}</Badge>
            <Badge>Confidence {titleCase(result.confidence_level)}</Badge>
            <Badge>{result.market_data_available ? 'Verified market data used' : 'No verified market data'}</Badge>
          </div>
          {limited ? (
            <p className="text-sm text-slate-600">A numeric valuation was not produced because reliable market data was not available.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-3">
              <Fact label="Estimated value" value={formatMoney(result.estimated_value, result.currency)} />
              <Fact label="Minimum" value={formatMoney(result.minimum_value, result.currency)} />
              <Fact label="Maximum" value={formatMoney(result.maximum_value, result.currency)} />
              <Fact label="Difference from asking price" value={view.price_difference == null ? 'Not available' : formatMoney(view.price_difference, result.currency)} />
            </div>
          )}
          <p className="text-sm leading-6 text-slate-700">{result.valuation_explanation}</p>
          <p className="text-sm leading-6 text-slate-700">{result.investment_analysis}</p>
          <List title="Advantages" items={result.positive_factors} />
          <List title="Risks" items={result.risk_factors} />
          <List title="Considerations" items={result.considerations} />
          <p className="text-xs text-slate-500">Model {result.ai_model}. {view.disclaimers.valuation} {view.disclaimers.investment}</p>
        </section>
      ) : null}
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase text-slate-500">{label}</p>
      <p className="text-sm font-medium text-slate-900">{value}</p>
    </div>
  );
}

function List({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div>
      <h2 className="text-sm font-medium text-slate-500">{title}</h2>
      <ul className="mt-1 list-disc pl-5 text-sm text-slate-700">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
