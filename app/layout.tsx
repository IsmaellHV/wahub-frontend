import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { ThemeProvider } from '@shared/UI/ThemeProvider';
import { I18nProvider } from '@shared/i18n/I18nProvider';
import '../styles/globals.css';

export const metadata: Metadata = {
  title: 'waHub — WhatsApp + AI for builders',
  description: 'Connect WhatsApp numbers, plug in AI agents, automate replies. Built for agencies and developers.',
  icons: { icon: '/favicon.svg' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body>
        <I18nProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
