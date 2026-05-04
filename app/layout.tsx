import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { ThemeProvider } from '@shared/UI/ThemeProvider';
import { I18nProvider, type Locale } from '@shared/i18n/I18nProvider';
import '../styles/globals.css';

export const metadata: Metadata = {
  title: 'waHub — WhatsApp + AI for builders',
  description: 'Connect WhatsApp numbers, plug in AI agents, automate replies. Built for agencies and developers.',
};

const themeBootstrap = `
(function(){
  try {
    var t = localStorage.getItem('wahub_theme');
    var a = localStorage.getItem('wahub_accent_v2');
    document.documentElement.setAttribute('data-theme', t === 'light' ? 'light' : 'dark');
    var palettes = {
      green:  ['#4ade80','#22c55e','#16a34a','#15803d'],
      indigo: ['#8085ff','#5b5cf6','#4f46e5','#4338ca'],
      violet: ['#a78bfa','#8b5cf6','#7c3aed','#6d28d9'],
      blue:   ['#60a5fa','#3b82f6','#2563eb','#1d4ed8'],
      teal:   ['#2dd4bf','#14b8a6','#0d9488','#0f766e'],
      orange: ['#fb923c','#f97316','#ea580c','#c2410c'],
    };
    var p = palettes[a] || palettes.green;
    var s = document.documentElement.style;
    s.setProperty('--brand-400', p[0]);
    s.setProperty('--brand-500', p[1]);
    s.setProperty('--brand-600', p[2]);
    s.setProperty('--brand-700', p[3]);
  } catch(e) {
    document.documentElement.setAttribute('data-theme','dark');
  }
})();
`;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get('wahub:locale')?.value;
  const locale: Locale = cookieLocale === 'es' ? 'es' : 'en';

  return (
    <html lang={locale} suppressHydrationWarning className={`${GeistSans.variable} ${GeistMono.variable}`} data-theme="dark">
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
        <I18nProvider initialLocale={locale}>
          <ThemeProvider>{children}</ThemeProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
