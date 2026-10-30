import { GeistMono } from 'geist/font/mono';
import { GeistSans } from 'geist/font/sans';
import type { Metadata } from 'next';
import { ThemeProvider } from '@/components/site/ThemeProvider';
import { sitePath } from '@/lib/site';
import { cn } from '@/lib/utils';
import './globals.css';

export const metadata: Metadata = {
  title: { default: 'Sistemas de diseño', template: '%s · Sistemas de diseño' },
  description: 'Sistemas de diseño agentic-first, enlazados 1:1 con producción.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="alternate" type="text/plain" href={sitePath('/llms.txt')} title="llms.txt" />
      </head>
      <body className={cn('group/body overscroll-none antialiased [--footer-height:calc(var(--spacing)*14)] [--header-height:calc(var(--spacing)*14)] lg:[--header-height:calc(var(--spacing)*16)]', GeistSans.variable, GeistMono.variable)}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
