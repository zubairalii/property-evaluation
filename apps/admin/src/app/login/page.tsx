'use client';

import { useRouter } from 'next/navigation';
import { isSupabaseConfigured, createClient } from '@/lib/supabase/client';
import { apiGet } from '@/lib/api';
import type { Profile } from '@/lib/types';
import { LoginForm, type LoginValues } from '@/components/login-form';

export default function LoginPage() {
  const router = useRouter();

  async function onSubmit(values: LoginValues): Promise<string | null> {
    if (!isSupabaseConfigured()) {
      return 'Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY before signing in.';
    }
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword(values);
    if (error) return error.message;
    try {
      const profile = await apiGet<Profile>('/users/me');
      if (profile.data.role !== 'admin' || profile.data.status !== 'active') {
        await supabase.auth.signOut();
        return 'This account does not have administrator access.';
      }
    } catch (error) {
      await supabase.auth.signOut();
      return error instanceof Error ? error.message : 'Could not verify administrator access.';
    }
    router.replace('/');
    router.refresh();
    return null;
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#172554] px-4">
      <section className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <p className="text-sm font-medium text-[#2563EB]">Smart Property Evaluator</p>
        <h1 className="mt-2 text-2xl font-semibold text-[#172554]">Admin sign in</h1>
        <p className="mt-2 mb-6 text-sm text-slate-500">Only active administrator accounts can open this dashboard.</p>
        <LoginForm onSubmit={onSubmit} />
      </section>
    </main>
  );
}
