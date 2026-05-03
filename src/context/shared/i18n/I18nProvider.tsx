'use client';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { en, type Dict } from './locales/en';
import { es } from './locales/es';

export type Locale = 'en' | 'es';
const DICTS: Record<Locale, Dict> = { en, es };
const STORAGE_KEY = 'wahub:locale';

const detectInitial = (): Locale => {
  if (typeof window === 'undefined') return 'en';
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === 'es' || stored === 'en') return stored;
  const nav = window.navigator.language?.toLowerCase() ?? '';
  return nav.startsWith('es') ? 'es' : 'en';
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

export const I18nProvider = ({ children }: { children: React.ReactNode }) => {
  // Always start with 'en' on server. Hydrate to actual on mount.
  const [locale, setLocaleState] = useState<Locale>('en');

  useEffect(() => {
    setLocaleState(detectInitial());
  }, []);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    if (typeof window !== 'undefined') window.localStorage.setItem(STORAGE_KEY, l);
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
