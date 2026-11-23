import { Suspense } from 'react';
import { UserDetailClient } from './user-detail-client';

export default function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<p>Loading user…</p>}>
      <UserDetail params={params} />
    </Suspense>
  );
}

async function UserDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <UserDetailClient id={id} />;
}
