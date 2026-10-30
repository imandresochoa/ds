import type { Metadata } from 'next';
import { sitePath } from '@/lib/site';
import './shell.css';

export const metadata: Metadata = {
  title: { default: 'Sistemas de diseño', template: '%s · Sistemas de diseño' },
  description: 'Sistemas de diseño agentic-first, enlazados 1:1 con producción.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="alternate" type="text/plain" href={sitePath('/llms.txt')} title="llms.txt" />
      </head>
      <body>{children}</body>
    </html>
  );
}
