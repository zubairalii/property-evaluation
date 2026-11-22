import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import { secureStoreAdapter } from './secure-store';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

export const isSupabaseConfigured = url.length > 0 && anonKey.length > 0;

export const supabase = createClient(url || 'http://127.0.0.1:54321', anonKey || 'missing-anon-key', {
  auth: {
    storage: secureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
