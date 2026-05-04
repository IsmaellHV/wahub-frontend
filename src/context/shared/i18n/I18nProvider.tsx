'use client';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { en, type Dict } from './locales/en';
import { es } from './locales/es';

export type Locale = 'en' | 'es';
const DICTS: Record<Locale, Dict> = { en, es };
const STORAGE_KEY = 'wahub:locale';
const COOKIE_KEY = 'wahub:locale';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

const writeCookie = (l: Locale): void => {
  if (typeof document === 'undefined') return;
  document.cookie = `${COOKIE_KEY}=${l}; path=/; max-age=${COOKIE_MAX_AGE}; samesite=lax`;
};

interface Ctx {
  locale: Locale;
  setLocale: (l: Locale) => void;
  // dot-path lookup; falls back to key when missing
  t: (key: string, vars?: Record<string, string | number>) => string;
  dict: Dict;
}

const I18nCtx = createContext<Ctx | null>(null);

const lookup = (dict: unknown, path: string): string => {
  const parts = path.split('.');
  let cur: unknown = dict;
  for (const p of parts) {
    if (cur && typeof cur === 'object' && p in (cur as Record<string, unknown>)) {
      cur = (cur as Record<string, unknown>)[p];
    } else {
      return path;
    }
  }
  return typeof cur === 'string' ? cur : path;
};

const interpolate = (s: string, vars?: Record<string, string | number>): string => {
  if (!vars) return s;
  return s.replace(/\{(\w+)\}/g, (_, k: string) => (k in vars ? String(vars[k]) : `{${k}}`));
};

interface Props {
  children: React.ReactNode;
  // Resolved by the server (middleware + cookie) so SSR and the first client
  // render agree — kills the EN → ES content flash on hydration.
  initialLocale?: Locale;
}

export const I18nProvider = ({ children, initialLocale = 'en' }: Props) => {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  // Sync localStorage so the toggle persists across explicit user changes
  // and stays consistent with the cookie set by the middleware.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored !== initialLocale && (stored === 'en' || stored === 'es')) {
      // User picked a locale in another tab — honor it.
      setLocaleState(stored);
    } else if (!stored) {
      window.localStorage.setItem(STORAGE_KEY, initialLocale);
    }
  }, [initialLocale]);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    if (typeof window !== 'undefined') window.localStorage.setItem(STORAGE_KEY, l);
    writeCookie(l);
  }, []);

  const dict = DICTS[locale];

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => interpolate(lookup(dict, key), vars),
    [dict],
  );

  const value = useMemo<Ctx>(() => ({ locale, setLocale, t, dict }), [locale, setLocale, t, dict]);

  return <I18nCtx.Provider value={value}>{children}</I18nCtx.Provider>;
};

export const useI18n = (): Ctx => {
  const ctx = useContext(I18nCtx);
  if (!ctx) throw new Error('useI18n outside I18nProvider');
  return ctx;
};
