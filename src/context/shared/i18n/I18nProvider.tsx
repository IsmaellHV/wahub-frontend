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
  // Opcional: si por algun motivo el caller quiere forzar un locale
  // inicial. En el flujo normal el Provider lee cookie/localStorage en
  // mount — esto permite que el layout sea 100% estatico (cacheable en CDN).
  initialLocale?: Locale;
}

// Detecta locale solo en cliente. Devuelve `null` durante SSR.
const detectClientLocale = (): Locale | null => {
  if (typeof window === 'undefined') return null;
  try {
    const m = document.cookie.match(/(?:^|; )wahub:locale=(es|en)/);
    if (m) return m[1] as Locale;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === 'es' || stored === 'en') return stored;
    const nav = (navigator.language || 'en').toLowerCase();
    return nav.startsWith('es') ? 'es' : 'en';
  } catch {
    return 'en';
  }
};

export const I18nProvider = ({ children, initialLocale }: Props) => {
  // SSR: usa `initialLocale` o `'en'`. Cliente: lee cookie/localStorage/navigator
  // sincronamente en el useState initializer → primer render coincide con la
  // realidad del usuario sin flash.
  const [locale, setLocaleState] = useState<Locale>(() => initialLocale ?? detectClientLocale() ?? 'en');

  // Persiste localStorage en mount si aun no estaba.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) window.localStorage.setItem(STORAGE_KEY, locale);
    else if ((stored === 'en' || stored === 'es') && stored !== locale) setLocaleState(stored);
    // Solo en mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
