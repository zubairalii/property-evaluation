'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '@/components/ui/table';
import { apiGet, getErrorMessage } from '@/lib/api';
import { formatDate } from '@/lib/format';
import type { Profile } from '@/lib/types';

export default function UsersPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [submitted, setSubmitted] = useState('');
  const query = useQuery({
    queryKey: ['admin', 'users', submitted, page],
    queryFn: () => apiGet<Array<Profile & { evaluation_count: number }>>('/admin/users', { search: submitted, page, limit: 20 }),
  });
  const total = query.data?.meta?.total ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[#172554]">Users</h1>
        <p className="text-sm text-slate-500">Search registered accounts. Passwords and tokens are never shown.</p>
      </div>
      <form
        className="flex gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          setPage(1);
          setSubmitted(search);
        }}
      >
        <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name or email" />
        <Button type="submit">Search</Button>
      </form>
      {query.isLoading ? <p>Loading users…</p> : null}
      {query.isError ? <p className="text-red-600">{getErrorMessage(query.error)}</p> : null}
      <div className="rounded-xl border border-slate-200 bg-white">
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Name</TableHeaderCell>
              <TableHeaderCell>Email</TableHeaderCell>
              <TableHeaderCell>Role</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell>Evaluations</TableHeaderCell>
              <TableHeaderCell>Joined</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(query.data?.data ?? []).map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <Link className="font-medium text-[#2563EB]" href={`/users/${user.id}`}>
                    {user.full_name || 'Unnamed'}
                  </Link>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>
                  <Badge>{user.status}</Badge>
                </TableCell>
                <TableCell>{user.evaluation_count}</TableCell>
                <TableCell>{formatDate(user.created_at)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {!query.isLoading && (query.data?.data.length ?? 0) === 0 ? <p className="p-6 text-sm text-slate-500">No users match this search.</p> : null}
      </div>
      <div className="flex items-center justify-between text-sm text-slate-500">
        <span>{total} users</span>
        <div className="flex gap-2">
          <Button variant="outline" disabled={page === 1} onClick={() => setPage((current) => current - 1)}>
            Previous
          </Button>
          <Button variant="outline" disabled={page * 20 >= total} onClick={() => setPage((current) => current + 1)}>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
