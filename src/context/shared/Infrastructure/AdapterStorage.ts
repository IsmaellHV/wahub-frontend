'use client';

// Tiny localStorage wrapper that's safe to call during SSR (returns null).
export const AdapterStorage = {
  get(key: string): string | null {
    if (typeof window === 'undefined') return null;
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },

  set(key: string, value: string): void {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(key, value);
    } catch {
      /* quota / private mode — ignore */
    }
  },

  remove(key: string): void {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.removeItem(key);
    } catch {
      /* noop */
    }
  },
};

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'wahub_access_token',
  REFRESH_TOKEN: 'wahub_refresh_token',
  USER: 'wahub_user',
} as const;
