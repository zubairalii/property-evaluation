'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { UserStatusButton } from '@/components/user-status-button';
import { Badge } from '@/components/ui/badge';
import { api, apiGet, getErrorMessage } from '@/lib/api';
import { formatDate, formatMoney, titleCase } from '@/lib/format';
import type { AdminUser } from '@/lib/types';

export default function UserDetailPage() {
  const params = useParams<{ id: string }>();
  const client = useQueryClient();
  const query = useQuery({
    queryKey: ['admin', 'users', params.id],
    queryFn: () => apiGet<AdminUser>(`/admin/users/${params.id}`),
  });
  const mutation = useMutation({
    mutationFn: async (status: 'active' | 'inactive') => {
      await api.patch(`/admin/users/${params.id}/status`, { status });
    },
    onSuccess: async () => {
      toast.success('User status updated');
      await client.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  if (query.isLoading) return <p>Loading user…</p>;
  if (query.isError || !query.data) return <p className="text-red-600">{getErrorMessage(query.error)}</p>;
  const user = query.data.data;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#172554]">{user.full_name || 'Unnamed user'}</h1>
          <p className="text-sm text-slate-500">{user.email}</p>
        </div>
        <UserStatusButton status={user.status} disabled={mutation.isPending} onChange={(status) => mutation.mutate(status)} />
      </div>
      <dl className="grid gap-4 rounded-xl border border-slate-200 bg-white p-5 sm:grid-cols-3">
        <div>
          <dt className="text-xs uppercase text-slate-500">Role</dt>
          <dd>{user.role}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase text-slate-500">Status</dt>
          <dd>
            <Badge>{user.status}</Badge>
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase text-slate-500">Phone</dt>
          <dd>{user.phone || 'Not provided'}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase text-slate-500">Evaluations</dt>
          <dd>{user.evaluation_count}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase text-slate-500">Joined</dt>
          <dd>{formatDate(user.created_at)}</dd>
        </div>
      </dl>
      <div className="rounded-xl border border-slate-200 bg-white">
        <h2 className="px-5 pt-5 text-sm font-medium text-slate-500">Recent evaluations</h2>
        <ul className="divide-y divide-slate-100">
          {user.recent_evaluations.length === 0 ? <li className="p-5 text-sm text-slate-500">This user has no evaluations.</li> : null}
          {user.recent_evaluations.map((item) => (
            <li key={item.id} className="flex items-center justify-between px-5 py-3 text-sm">
              <Link className="text-[#2563EB]" href={`/evaluations/${item.id}`}>
                {item.property_title || titleCase(item.property_type)} · {item.city}
              </Link>
              <span>
                {titleCase(item.status)} · {formatMoney(item.asking_price, item.currency)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
