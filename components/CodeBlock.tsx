'use client';

import { CheckIcon, CopyIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCopy } from '@/lib/use-copy';
import { Button } from '@/components/ui/button';
import { useT } from '@/components/site/I18nProvider';

export function CopyButton({ value, className, label }: { value: string; className?: string; label?: string }) {
  const { copy, copied } = useCopy();
  const t = useT();
  return (
    <Button
      data-slot="copy-button"
      size="icon"
      variant="ghost"
      className={cn('absolute top-3 right-2 z-10 size-7 bg-code text-code-foreground opacity-70 hover:opacity-100 focus-visible:opacity-100', className)}
      onClick={() => copy(value)}
    >
      <span className="sr-only">{label ?? t.code.copy}</span>
      {copied ? <CheckIcon /> : <CopyIcon />}
    </Button>
  );
}

/**
 * Bloque de código con el estilo de shadcn: fondo `code`, radio grande, sin borde y botón de copiar.
 * `html` es el código ya resaltado en el servidor; si no hay, se pinta el texto.
 */
export function CodeBlock({ code, html, lang, title, className }: { code: string; html?: string | null; lang?: string; title?: string; className?: string }) {
  const wrap = lang === 'prompt' || lang === 'text' || !lang;
  return (
    <figure data-slot="code-block" className={cn('relative -mx-1 mt-6 overflow-hidden rounded-2xl bg-code text-sm text-code-foreground', className)}>
      {title && <figcaption className="border-b border-border/30 px-4 py-2.5 font-mono text-sm text-code-foreground">{title}</figcaption>}
      <CopyButton value={code} className={title ? 'top-1.5' : undefined} />
      {html ? (
        <div className="no-scrollbar overflow-x-auto px-4 py-3.5 pr-12 [&_pre]:bg-transparent!" dangerouslySetInnerHTML={{ __html: html }} />
      ) : (
        <pre className={cn('no-scrollbar overflow-x-auto px-4 py-3.5 pr-12', wrap && 'whitespace-pre-wrap')}>
          <code>{code}</code>
        </pre>
      )}
    </figure>
  );
}
