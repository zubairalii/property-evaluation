import 'react-native-url-polyfill/auto';
import { supabase } from './supabase';

const apiRoot = (process.env.EXPO_PUBLIC_API_URL ?? 'http://10.0.2.2:5000').replace(/\/$/, '');
const apiBaseUrl = `${apiRoot}/api/v1`;

if (__DEV__) {
  console.log('[api] baseURL', apiBaseUrl);
}

type RequestConfig = {
  params?: Record<string, string | number | boolean | null | undefined>;
  headers?: Record<string, string>;
};

export class ApiError extends Error {
  status?: number;
  code?: string;
  details?: unknown;

  constructor(message: string, init?: { status?: number; code?: string; details?: unknown }) {
    super(message);
    this.name = 'ApiError';
    this.status = init?.status;
    this.code = init?.code;
    this.details = init?.details;
  }
}

function buildUrl(path: string, params?: RequestConfig['params']): string {
  const url = new URL(path.startsWith('http') ? path : `${apiBaseUrl}${path.startsWith('/') ? path : `/${path}`}`);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === null) continue;
      url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

async function request<T>(method: string, path: string, body?: unknown, config?: RequestConfig): Promise<{ data: T }> {
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData.session?.access_token;

  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(config?.headers ?? {}),
  };
  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const url = buildUrl(path, config?.params);
  if (__DEV__) {
    console.log('[api]', method, url);
  }

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Network request failed';
    if (__DEV__) {
      console.log('[api] network failure', method, url, message);
    }
    throw new ApiError(`Cannot reach the server at ${apiRoot}. ${message}`, {
      code: 'NETWORK',
      details: error,
    });
  }

  const text = await response.text();
  let payload: unknown = null;
  if (text) {
    try {
      payload = JSON.parse(text) as unknown;
    } catch {
      payload = text;
    }
  }

  if (response.status === 401) {
    await supabase.auth.signOut().catch(() => undefined);
  }

  if (!response.ok) {
    const message =
      typeof payload === 'object' &&
      payload &&
      'message' in payload &&
      typeof (payload as { message: unknown }).message === 'string'
        ? (payload as { message: string }).message
        : `Request failed (${response.status})`;
    throw new ApiError(message, { status: response.status, details: payload });
  }

  return { data: payload as T };
}

export const api = {
  get: <T>(path: string, config?: RequestConfig) => request<T>('GET', path, undefined, config),
  post: <T>(path: string, body?: unknown, config?: RequestConfig) => request<T>('POST', path, body, config),
  patch: <T>(path: string, body?: unknown, config?: RequestConfig) => request<T>('PATCH', path, body, config),
  delete: <T>(path: string, config?: RequestConfig) => request<T>('DELETE', path, undefined, config),
};

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error && error.message) return error.message;
  return 'Something went wrong. Please try again.';
}
