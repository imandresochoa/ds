import { GeistMono } from 'geist/font/mono';
import { GeistSans } from 'geist/font/sans';
import type { Metadata } from 'next';
import { ThemeProvider } from '@/components/site/ThemeProvider';
import { messages } from '@/lib/i18n';
import { sitePath } from '@/lib/site';
import { cn } from '@/lib/utils';

/** Título y descripción por defecto del sitio en un idioma. */
export function rootMetadata(lang: string): Metadata {
  const t = messages(lang).site;
  return { title: { default: t.title, template: `%s · ${t.title}` }, description: t.description };
}

/**
 * El documento: <html lang> del idioma, fuentes, tema y avisos. Lo usan los dos layouts raíz, (principal) y (en):
 * cada idioma tiene el suyo para que el HTML exportado ya diga en qué idioma está.
 */
export function RootHtml({ lang, llms = '/llms.txt', children }: { lang: string; llms?: string; children: React.ReactNode }) {
  return (
    <html lang={lang} suppressHydrationWarning>
      <head>
        <link rel="alternate" type="text/plain" href={sitePath(llms)} title="llms.txt" />
      </head>
      <body className={cn('group/body overscroll-none antialiased [--footer-height:calc(var(--spacing)*14)] [--header-height:calc(var(--spacing)*14)] lg:[--header-height:calc(var(--spacing)*16)]', GeistSans.variable, GeistMono.variable)}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
