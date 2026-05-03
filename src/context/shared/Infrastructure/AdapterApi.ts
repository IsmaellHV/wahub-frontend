'use client';
import { AdapterStorage, STORAGE_KEYS } from './AdapterStorage';

export interface ApiError {
  message: string;
  status: number;
  details?: unknown;
}

interface ApiOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  auth?: boolean;       // attach Bearer access token (default true)
  _retry?: boolean;     // internal: marks a request that already passed through refresh once
}

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7001/api/wahub').replace(/\/$/, '');

const REFRESH_PATH = '/acceso/token/refresh';

// Custom event broadcast on refresh failure / forced logout. Listened to by a small
// AuthGate component which clears storage and routes the user to /login.
export const AUTH_LOGOUT_EVENT = 'wahub:auth-logout';

const dispatchLogout = (reason: 'refresh-failed' | 'no-refresh-token' | 'manual'): void => {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(AUTH_LOGOUT_EVENT, { detail: { reason } }));
};

const buildHeaders = (auth: boolean, init?: HeadersInit): Headers => {
  const headers = new Headers(init);
  if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  if (auth) {
    const token = AdapterStorage.get(STORAGE_KEYS.ACCESS_TOKEN);
    if (token) headers.set('Authorization', `Bearer ${token}`);
  }
  return headers;
};

// Single in-flight refresh promise. All requests that hit 401 simultaneously wait
// on this same promise instead of each firing their own refresh.
let refreshInFlight: Promise<boolean> | null = null;

const refreshAccessToken = async (): Promise<boolean> => {
  if (refreshInFlight) return refreshInFlight;

  const refreshToken = AdapterStorage.get(STORAGE_KEYS.REFRESH_TOKEN);
  if (!refreshToken) {
    dispatchLogout('no-refresh-token');
    return false;
  }

  refreshInFlight = (async () => {
    try {
      const res = await fetch(`${API_URL}${REFRESH_PATH}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
      if (!res.ok) {
        dispatchLogout('refresh-failed');
        return false;
      }
      const data = (await res.json()) as { accessToken?: string; refreshToken?: string };
      if (!data.accessToken || !data.refreshToken) {
        dispatchLogout('refresh-failed');
        return false;
      }
      AdapterStorage.set(STORAGE_KEYS.ACCESS_TOKEN, data.accessToken);
      AdapterStorage.set(STORAGE_KEYS.REFRESH_TOKEN, data.refreshToken);
      return true;
    } catch {
      dispatchLogout('refresh-failed');
      return false;
    } finally {
      // Reset so the NEXT 401 (long after this one) can refresh again.
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
};

// Lightweight fetch wrapper — JSON in/out, attaches JWT, auto-refreshes on 401, throws ApiError otherwise.
export const AdapterApi = {
  async request<T>(path: string, opts: ApiOptions = {}): Promise<T> {
    const { body, auth = true, headers, _retry = false, ...rest } = opts;
    const url = path.startsWith('http') ? path : `${API_URL}${path.startsWith('/') ? path : '/' + path}`;
    const res = await fetch(url, {
      ...rest,
      headers: buildHeaders(auth, headers),
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    let json: unknown = null;
    const text = await res.text();
    if (text) {
      try {
        json = JSON.parse(text);
      } catch {
        json = text;
      }
    }

    // 401: try one refresh + retry. Skip when:
    //   - the original call was unauthenticated (auth=false)
    //   - we already retried this request (avoid infinite loop)
    //   - the failing call IS the refresh endpoint itself
    if (res.status === 401 && auth && !_retry && !path.endsWith(REFRESH_PATH)) {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        return this.request<T>(path, { ...opts, _retry: true });
      }
      // Refresh failed → fall through, throw ApiError below; AuthGate already kicked in.
    }

    if (!res.ok) {
      // Backend DomainExceptionFilter shape: { error, errorClient, errorCode, message, cause }
      const obj = (json && typeof json === 'object' ? (json as Record<string, unknown>) : {}) as Record<string, unknown>;
      const pick = (k: string): string | null => (typeof obj[k] === 'string' ? (obj[k] as string) : null);
      const message = pick('errorClient') || pick('message') || res.statusText || 'Request failed';
      const err: ApiError = { message, status: res.status, details: json };
      throw err;
    }

    return json as T;
  },

  get<T>(path: string, opts: ApiOptions = {}) {
    return this.request<T>(path, { ...opts, method: 'GET' });
  },

  post<T>(path: string, body?: unknown, opts: ApiOptions = {}) {
    return this.request<T>(path, { ...opts, method: 'POST', body });
  },

  put<T>(path: string, body?: unknown, opts: ApiOptions = {}) {
    return this.request<T>(path, { ...opts, method: 'PUT', body });
  },

  delete<T>(path: string, opts: ApiOptions = {}) {
    return this.request<T>(path, { ...opts, method: 'DELETE' });
  },

  // Manual logout broadcast — useful for the user-initiated logout button.
  triggerLogout() {
    dispatchLogout('manual');
  },
};
