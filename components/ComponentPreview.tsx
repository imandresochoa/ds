'use client';

import { ChevronRightIcon } from 'lucide-react';
import { useId, useState } from 'react';
import { CopyButton } from './CodeBlock';
import { Preview, PreviewModeToggle, previewModes, type PreviewSurface } from './Preview';

/**
 * Ejemplo de una ficha, como en las páginas de componente de Geist: la tarjeta con el ejemplo en vivo, compacta, y
 * al pie una franja «Ver código» con el código plegado. En la franja van también la superficie, el conmutador de
 * modo y el botón de copiar, para que nada tape el ejemplo.
 */
export function ComponentPreview({ html, surface, surfaceLabel, background, align = 'center', vista, mode: initialMode, code, codeHtml }: {
  html: string;
  surface: PreviewSurface;
  surfaceLabel?: string;
  background?: string;
  align?: 'center' | 'start';
  vista?: number | true;
  mode?: string;
  code: string;
  codeHtml: string | null;
}) {
  // El código va siempre plegado, también el corto: la página se lee de un vistazo.
  const [open, setOpen] = useState(false);
  const codeId = useId();
  // Con más de un modo en la superficie, la franja lleva un conmutador. Empieza en `modo=` del ejemplo o en el modo base.
  const modes = previewModes(surface);
  const [mode, setMode] = useState(initialMode && modes.includes(initialMode) ? initialMode : modes[0]);
  return (
    <div data-slot="component-preview" className="mt-4 flex flex-col overflow-hidden rounded-xl border">
      <Preview html={html} surface={surface} background={background} align={align} minHeight={96} padding={24} vista={vista} mode={mode} />
      <div className="flex h-10 items-center gap-2 border-t bg-muted/40 pr-1.5 text-sm">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={codeId}
          onClick={() => setOpen((o) => !o)}
          className="flex h-full min-w-0 flex-1 cursor-pointer items-center gap-2 rounded-bl-xl pl-3 whitespace-nowrap text-left text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:ring-inset"
        >
          <ChevronRightIcon className="size-4 transition-transform data-[open=true]:rotate-90" data-open={open} aria-hidden="true" />
          {open ? 'Ocultar código' : 'Ver código'}
        </button>
        {surfaceLabel && <span className="hidden font-mono text-xs text-muted-foreground sm:inline">{surfaceLabel}</span>}
        <PreviewModeToggle modes={modes} value={mode} onChange={setMode} className="h-7" />
        <CopyButton value={code} className="static bg-transparent text-muted-foreground" />
      </div>
      <div id={codeId} hidden={!open} data-slot="code" className="no-scrollbar overflow-x-auto border-t bg-code px-4 py-3.5 text-sm text-code-foreground [&_pre]:bg-transparent!">
        {codeHtml ? <div dangerouslySetInnerHTML={{ __html: codeHtml }} /> : <pre><code>{code}</code></pre>}
      </div>
    </div>
  );
}
