import { Suspense } from 'react';
import { EvaluationDetailClient } from './evaluation-detail-client';

export default function EvaluationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<p>Loading evaluation…</p>}>
      <EvaluationDetail params={params} />
    </Suspense>
  );
}

async function EvaluationDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EvaluationDetailClient id={id} />;
}
