'use client';
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

type Theme = 'light' | 'dark';
type Accent = 'green' | 'indigo' | 'violet' | 'blue' | 'teal' | 'orange';

interface ThemeContextValue {
  theme: Theme;
  accent: Accent;
  setTheme: (t: Theme) => void;
  setAccent: (a: Accent) => void;
  toggleTheme: () => void;
}

const Ctx = createContext<ThemeContextValue | null>(null);

const ACCENTS: Record<Accent, { 400: string; 500: string; 600: string; 700: string }> = {
  // WhatsApp-aligned default
  green: { 400: '#4ade80', 500: '#22c55e', 600: '#16a34a', 700: '#15803d' },
  indigo: { 400: '#8085ff', 500: '#5b5cf6', 600: '#4f46e5', 700: '#4338ca' },
  violet: { 400: '#a78bfa', 500: '#8b5cf6', 600: '#7c3aed', 700: '#6d28d9' },
  blue: { 400: '#60a5fa', 500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8' },
  teal: { 400: '#2dd4bf', 500: '#14b8a6', 600: '#0d9488', 700: '#0f766e' },
  orange: { 400: '#fb923c', 500: '#f97316', 600: '#ea580c', 700: '#c2410c' },
};

const STORAGE_THEME = 'wahub_theme';
// v2: brand migrated from indigo → green. Old key ignored to avoid stale color.
const STORAGE_ACCENT = 'wahub_accent_v2';

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  // Default to dark + green to match the landing.
  const [theme, setThemeState] = useState<Theme>('dark');
  const [accent, setAccentState] = useState<Accent>('green');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const storedTheme = (localStorage.getItem(STORAGE_THEME) as Theme | null) ?? null;
      const storedAccent = (localStorage.getItem(STORAGE_ACCENT) as Accent | null) ?? null;
      // Honor stored choice; otherwise stay on dark (matches landing).
      if (storedTheme === 'light' || storedTheme === 'dark') setThemeState(storedTheme);
      if (storedAccent && storedAccent in ACCENTS) setAccentState(storedAccent);
    } catch {
      /* noop */
    }
    setMounted(true);
  }, []);

  // Apply theme attr
  useEffect(() => {
    if (!mounted) return;
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem(STORAGE_THEME, theme);
    } catch {
      /* noop */
    }
  }, [theme, mounted]);

  // Apply accent
  useEffect(() => {
    if (!mounted) return;
    const a = ACCENTS[accent];
    const root = document.documentElement;
    root.style.setProperty('--brand-400', a[400]);
    root.style.setProperty('--brand-500', a[500]);
    root.style.setProperty('--brand-600', a[600]);
    root.style.setProperty('--brand-700', a[700]);
    try {
      localStorage.setItem(STORAGE_ACCENT, accent);
    } catch {
      /* noop */
    }
  }, [accent, mounted]);

  const setTheme = useCallback((t: Theme) => setThemeState(t), []);
  const setAccent = useCallback((a: Accent) => setAccentState(a), []);
  const toggleTheme = useCallback(() => setThemeState((t) => (t === 'dark' ? 'light' : 'dark')), []);

  return <Ctx.Provider value={{ theme, accent, setTheme, setAccent, toggleTheme }}>{children}</Ctx.Provider>;
};

export const useTheme = (): ThemeContextValue => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useTheme must be inside ThemeProvider');
  return ctx;
};
