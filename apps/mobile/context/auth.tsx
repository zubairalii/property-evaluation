import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import { api } from '@/lib/api';
import { parseAuthParams } from '@/lib/auth-redirect';
import { queryClient } from '@/lib/query-client';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import type { ApiEnvelope, Profile } from '@/lib/types';

interface AuthContextValue {
  ready: boolean;
  configured: boolean;
  session: Session | null;
  profile: Profile | null;
  passwordRecovery: boolean;
  beginPasswordRecovery: () => void;
  clearPasswordRecovery: () => void;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function createSessionFromUrl(url: string): Promise<'recovery' | 'session' | null> {
  const params = parseAuthParams(url);
  if (!params.access_token || !params.refresh_token) return null;
  const { error } = await supabase.auth.setSession({
    access_token: params.access_token,
    refresh_token: params.refresh_token,
  });
  if (error) throw error;
  return params.type === 'recovery' ? 'recovery' : 'session';
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [passwordRecovery, setPasswordRecovery] = useState(false);

  async function refreshProfile() {
    const response = await api.get<ApiEnvelope<Profile>>('/users/me');
    setProfile(response.data.data);
  }

  useEffect(() => {
    let active = true;

    async function bootstrap() {
      try {
        const initialUrl = await Linking.getInitialURL();
        if (initialUrl) {
          const kind = await createSessionFromUrl(initialUrl).catch(() => null);
          if (kind === 'recovery' && active) {
            setPasswordRecovery(true);
            router.replace('/(auth)/reset-password');
          }
        }
      } catch {
        // Ignore malformed deep links and continue with stored session.
      }

      const { data } = await supabase.auth.getSession();
      if (!active) return;
      setSession(data.session);
      setReady(true);
      if (data.session) {
        refreshProfile().catch(() => setProfile(null));
      }
    }

    void bootstrap();

    const { data } = supabase.auth.onAuthStateChange((event, nextSession) => {
      setSession(nextSession);
      if (!nextSession) {
        setProfile(null);
        setPasswordRecovery(false);
        queryClient.clear();
      } else {
        refreshProfile().catch(() => setProfile(null));
      }
      if (event === 'PASSWORD_RECOVERY') {
        setPasswordRecovery(true);
        router.replace('/(auth)/reset-password');
      }
    });

    const linking = Linking.addEventListener('url', ({ url }) => {
      void createSessionFromUrl(url)
        .then((kind) => {
          if (kind === 'recovery') {
            setPasswordRecovery(true);
            router.replace('/(auth)/reset-password');
          }
        })
        .catch(() => undefined);
    });

    return () => {
      active = false;
      data.subscription.unsubscribe();
      linking.remove();
    };
  }, [router]);

  const value = useMemo<AuthContextValue>(
    () => ({
      ready,
      configured: isSupabaseConfigured,
      session,
      profile,
      passwordRecovery,
      beginPasswordRecovery: () => setPasswordRecovery(true),
      clearPasswordRecovery: () => setPasswordRecovery(false),
      refreshProfile,
      signOut: async () => {
        await supabase.auth.signOut();
        setProfile(null);
        setPasswordRecovery(false);
        queryClient.clear();
      },
    }),
    [ready, session, profile, passwordRecovery],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used within AuthProvider');
  return value;
}
