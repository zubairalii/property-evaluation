import * as Linking from 'expo-linking';

/** Deep link used for password recovery and auth callbacks. */
export function getAuthRedirectUrl(path = 'reset-password'): string {
  const configured = process.env.EXPO_PUBLIC_AUTH_REDIRECT_URL?.trim();
  if (configured) return configured;
  // Prefer the custom scheme so Supabase does not fall back to the admin Site URL.
  return Linking.createURL(path, { scheme: 'smartpropertyevaluator' });
}

export function parseAuthParams(url: string): {
  access_token?: string;
  refresh_token?: string;
  type?: string;
} {
  const parsed = Linking.parse(url);
  const query = parsed.queryParams ?? {};
  const hash = url.includes('#') ? url.split('#')[1] : '';
  const hashParams = Object.fromEntries(new URLSearchParams(hash));

  const read = (key: string) => {
    const fromQuery = query[key];
    if (typeof fromQuery === 'string' && fromQuery.length > 0) return fromQuery;
    const fromHash = hashParams[key];
    return typeof fromHash === 'string' && fromHash.length > 0 ? fromHash : undefined;
  };

  return {
    access_token: read('access_token'),
    refresh_token: read('refresh_token'),
    type: read('type'),
  };
}
