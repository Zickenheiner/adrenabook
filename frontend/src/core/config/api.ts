import endpoints from '../constants/endpoints';
import { ApiError } from '../errors/api.error';
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
} from '../local/storage';
import type { QueryParams } from '../types/query.type';

interface Config {
  url: string;
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  headers?: HeadersInit;
  query?: QueryParams;
  data?: unknown;
}

const buildUrl = (url: string, query?: QueryParams) => {
  const fullUrl = `${import.meta.env.VITE_API_URL}${url}`;
  if (!query) return fullUrl;

  const searchParams = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    searchParams.append(key, String(value));
  });
  return `${fullUrl}?${searchParams.toString()}`;
};

const buildHeaders = (
  token?: string | null,
  extra?: HeadersInit,
  isFormData = false,
): HeadersInit => ({
  // Sur un envoi multipart, on laisse le navigateur poser lui-meme
  // Content-Type : il doit y inscrire le « boundary », que nous ne
  // connaissons pas. Le forcer casserait la requete.
  ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
  ...extra,
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
});

const buildBody = (data: unknown): BodyInit | undefined => {
  if (data === undefined) return undefined;
  if (data instanceof FormData) return data;
  return JSON.stringify(data);
};

let isRefreshing = false;

const tryRefresh = async (): Promise<string | null> => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  try {
    const response = await fetch(buildUrl(endpoints.auth.refresh), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) return null;

    const json = await response.json();
    setAccessToken(json.accessToken);
    if (json.refreshToken) setRefreshToken(json.refreshToken);
    return json.accessToken as string;
  } catch {
    return null;
  }
};

const request = async <T = unknown>(config: Config): Promise<T> => {
  const token = getAccessToken();

  const isFormData = config.data instanceof FormData;

  const init: RequestInit = {
    method: config.method,
    headers: buildHeaders(token as string | null, config.headers, isFormData),
    body: buildBody(config.data),
  };

  const response = await fetch(buildUrl(config.url, config.query), init);

  if (response.status === 401 && !isRefreshing) {
    isRefreshing = true;
    const newToken = await tryRefresh();
    isRefreshing = false;

    if (!newToken) {
      clearTokens();
      window.location.href = '/login';
      throw new ApiError('Session expirée', 401);
    }

    const retryResponse = await fetch(buildUrl(config.url, config.query), {
      ...init,
      headers: buildHeaders(newToken, config.headers, isFormData),
    });

    if (!retryResponse.ok) {
      const json = await retryResponse.json().catch(() => null);
      throw new ApiError(
        json?.message ?? 'Erreur inconnue',
        retryResponse.status,
      );
    }

    return retryResponse.json() as Promise<T>;
  }

  if (!response.ok) {
    const json = await response.json().catch(() => null);
    throw new ApiError(json?.message ?? 'Erreur inconnue', response.status);
  }

  return response.json() as Promise<T>;
};

export default request;
