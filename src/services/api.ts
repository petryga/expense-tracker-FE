import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { isAuthEnabled, supabase } from '../lib/supabaseClient';

const DEFAULT_API_BASE_URL = 'http://localhost:3000';

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '');

export const API_BASE_URL = trimTrailingSlash(
  import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL
);

export const getApiUrl = (path: string) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};

export const getAuthHeader = async (): Promise<Record<string, string>> => {
  if (!isAuthEnabled || !supabase) return {};
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const baseQueryWithAuth = fetchBaseQuery({
  baseUrl: `${API_BASE_URL}/`,
  prepareHeaders: async (headers) => {
    if (!isAuthEnabled || !supabase) return headers;
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});
