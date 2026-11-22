import axios from 'axios';
import { createClient } from './supabase/client';

export const api = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000'}/api/v1`,
  timeout: 30_000,
});

api.interceptors.request.use(async (config) => {
  const { data } = await createClient().auth.getSession();
  const token = data.session?.access_token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: { page: number; limit: number; total: number };
}

export async function apiGet<T>(path: string, params?: Record<string, string | number | undefined>) {
  const response = await api.get<ApiEnvelope<T>>(path, { params });
  return response.data;
}

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;
    if (typeof message === 'string' && message.length > 0) return message;
    if (!error.response) return 'Cannot reach the API. Start the backend and check NEXT_PUBLIC_API_URL.';
  }
  if (error instanceof Error) return error.message;
  return 'Something went wrong.';
}
