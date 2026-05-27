import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { ThemeProvider } from '@shared/UI/ThemeProvider';
import { I18nProvider } from '@shared/i18n/I18nProvider';
import '../styles/globals.css';

export const metadata: Metadata = {
  title: 'waHub — WhatsApp + AI for builders',
  description: 'Connect WhatsApp numbers, plug in AI agents, automate replies. Built for agencies and developers.',
};

// Inline boot script — corre ANTES de hydrate React. Lee cookie + localStorage
// para fijar tema, accent y locale en `<html>` sin server roundtrip. Asi
// el layout queda 100% estatico (cacheable en CDN), eliminando el SSR por
// request que imponia el viejo `await cookies()`.
const bootstrapScript = `
(function(){
  var d = document.documentElement;
  try {
    // ---------- locale ----------
    var locale = 'en';
    var m = document.cookie.match(/(?:^|; )wahub:locale=(es|en)/);
    if (m) {
      locale = m[1];
    } else {
      try {
        var stored = localStorage.getItem('wahub:locale');
        if (stored === 'es' || stored === 'en') locale = stored;
      } catch(_) {}
      // Fallback: Accept-Language del navegador (solo si no hay cookie ni storage).
      if (!m) {
        var nav = (navigator.language || 'en').toLowerCase();
        if (nav.indexOf('es') === 0) locale = 'es';
      }
    }
    d.setAttribute('lang', locale);

    // ---------- theme ----------
    var t = localStorage.getItem('wahub_theme');
    d.setAttribute('data-theme', t === 'light' ? 'light' : 'dark');

    // ---------- accent ----------
    var a = localStorage.getItem('wahub_accent_v2');
    var palettes = {
      green:  ['#4ade80','#22c55e','#16a34a','#15803d'],
      indigo: ['#8085ff','#5b5cf6','#4f46e5','#4338ca'],
      violet: ['#a78bfa','#8b5cf6','#7c3aed','#6d28d9'],
      blue:   ['#60a5fa','#3b82f6','#2563eb','#1d4ed8'],
      teal:   ['#2dd4bf','#14b8a6','#0d9488','#0f766e'],
      orange: ['#fb923c','#f97316','#ea580c','#c2410c'],
    };
    var p = palettes[a] || palettes.green;
    var s = d.style;
    s.setProperty('--brand-400', p[0]);
    s.setProperty('--brand-500', p[1]);
    s.setProperty('--brand-600', p[2]);
    s.setProperty('--brand-700', p[3]);
  } catch(e) {
    d.setAttribute('data-theme','dark');
    d.setAttribute('lang','en');
  }
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${GeistSans.variable} ${GeistMono.variable}`} data-theme="dark">
      <body>
        <script dangerouslySetInnerHTML={{ __html: bootstrapScript }} />
        <I18nProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
