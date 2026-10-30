'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { CopyButton } from './CodeBlock';
import { Preview, type PreviewSurface } from './Preview';

/**
 * Vista previa con el código debajo, como en las páginas de componente de shadcn: la tarjeta con borde,
 * el ejemplo en vivo arriba y el código plegado con «Ver código».
 */
export function ComponentPreview({ html, surface, surfaceLabel, background, align = 'center', code, codeHtml, priority = false }: {
  html: string;
  surface: PreviewSurface;
  surfaceLabel?: string;
  background?: string;
  align?: 'center' | 'start';
  code: string;
  codeHtml: string | null;
  priority?: boolean;
}) {
  // El código corto se ve entero; el largo se pliega con «Ver código».
  const [open, setOpen] = useState(code.trim().split('\n').length <= 8);
  return (
    <div data-slot="component-preview" className={cn('group relative mt-4 mb-12 flex flex-col overflow-hidden rounded-xl border', priority && 'mt-6')}>
      <Preview html={html} surface={surface} background={background} align={align} minHeight={288} />
      <div data-slot="code" className="relative overflow-hidden border-t bg-code text-sm text-code-foreground">
        {surfaceLabel && <span className="absolute top-3.5 right-11 z-10 font-mono text-xs text-muted-foreground">{surfaceLabel}</span>}
        <CopyButton value={code} />
        <div className={cn('no-scrollbar overflow-x-auto px-4 py-3.5 pr-12 [&_pre]:bg-transparent!', surfaceLabel && 'pt-10', !open && 'max-h-72 overflow-hidden')}>
          {codeHtml ? <div dangerouslySetInnerHTML={{ __html: codeHtml }} /> : <pre><code>{code}</code></pre>}
        </div>
        {!open && (
          <div className="absolute inset-0 flex items-end justify-center pb-4">
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, var(--color-code), color-mix(in oklab, var(--color-code) 60%, transparent), transparent)' }} />
            <Button type="button" size="sm" variant="outline" className="relative z-10 rounded-lg bg-background text-foreground shadow-none hover:bg-muted" onClick={() => setOpen(true)}>
              Ver código
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
