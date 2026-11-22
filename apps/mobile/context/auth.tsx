import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { useRouter } from 'expo-router';
import { api } from '@/lib/api';
import { queryClient } from '@/lib/query-client';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import type { ApiEnvelope, Profile } from '@/lib/types';

interface AuthContextValue {
  ready: boolean;
  configured: boolean;
  session: Session | null;
  profile: Profile | null;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  async function refreshProfile() {
    const response = await api.get<ApiEnvelope<Profile>>('/users/me');
    setProfile(response.data.data);
  }

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      setReady(true);
      if (data.session) {
        refreshProfile().catch(() => setProfile(null));
      }
    });

    const { data } = supabase.auth.onAuthStateChange((event, nextSession) => {
      setSession(nextSession);
      if (!nextSession) {
        setProfile(null);
        queryClient.clear();
      } else {
        refreshProfile().catch(() => setProfile(null));
      }
      if (event === 'PASSWORD_RECOVERY') {
        router.push('/(auth)/reset-password');
      }
    });

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, [router]);

  const value = useMemo<AuthContextValue>(
    () => ({
      ready,
      configured: isSupabaseConfigured,
      session,
      profile,
      refreshProfile,
      signOut: async () => {
        await supabase.auth.signOut();
        setProfile(null);
        queryClient.clear();
      },
    }),
    [ready, session, profile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used within AuthProvider');
  return value;
}
