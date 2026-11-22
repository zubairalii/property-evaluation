'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api, apiGet, getErrorMessage } from '@/lib/api';
import { createClient } from '@/lib/supabase/client';
import type { Profile } from '@/lib/types';

export default function ProfilePage() {
  const me = useQuery({ queryKey: ['me'], queryFn: () => apiGet<Profile>('/users/me') });
  if (me.isLoading) return <p>Loading profile…</p>;
  if (me.isError || !me.data) return <p className="text-red-600">{getErrorMessage(me.error)}</p>;
  return <ProfileEditor key={me.data.data.updated_at} profile={me.data.data} />;
}

function ProfileEditor({ profile }: { profile: Profile }) {
  const router = useRouter();
  const client = useQueryClient();
  const [name, setName] = useState(profile.full_name);
  const [phone, setPhone] = useState(profile.phone ?? '');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  const save = useMutation({
    mutationFn: async () => {
      await api.patch('/users/me', { full_name: name, phone: phone.trim() ? phone.trim() : null });
    },
    onSuccess: async () => {
      toast.success('Profile updated');
      await client.invalidateQueries({ queryKey: ['me'] });
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  async function changePassword() {
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    if (password !== confirm) {
      toast.error('Passwords do not match');
      return;
    }
    const { error } = await createClient().auth.updateUser({ password });
    if (error) {
      toast.error(error.message);
      return;
    }
    setPassword('');
    setConfirm('');
    toast.success('Password updated');
  }

  async function logout() {
    await createClient().auth.signOut();
    router.replace('/login');
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-[#172554]">Admin profile</h1>
        <p className="text-sm text-slate-500">{profile.email}</p>
      </div>
      <form
        className="space-y-4 rounded-xl border border-slate-200 bg-white p-5"
        onSubmit={(event) => {
          event.preventDefault();
          save.mutate();
        }}
      >
        <label className="block text-sm font-medium">
          Full name
          <Input className="mt-1" value={name} onChange={(event) => setName(event.target.value)} />
        </label>
        <label className="block text-sm font-medium">
          Phone
          <Input className="mt-1" value={phone} onChange={(event) => setPhone(event.target.value)} />
        </label>
        <Button type="submit" disabled={save.isPending}>
          Save profile
        </Button>
      </form>
      <form
        className="space-y-4 rounded-xl border border-slate-200 bg-white p-5"
        onSubmit={(event) => {
          event.preventDefault();
          void changePassword();
        }}
      >
        <h2 className="font-medium text-[#172554]">Change password</h2>
        <Input type="password" placeholder="New password" value={password} onChange={(event) => setPassword(event.target.value)} />
        <Input type="password" placeholder="Confirm password" value={confirm} onChange={(event) => setConfirm(event.target.value)} />
        <Button type="submit" variant="outline">
          Update password
        </Button>
      </form>
      <Button variant="ghost" onClick={logout}>
        Log out
      </Button>
    </div>
  );
}
