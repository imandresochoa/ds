'use client';

import { useEffect, useId, useMemo, useRef } from 'react';
import { cn } from '@/lib/utils';

export type PreviewSurface = {
  stylesheets: string[];
  tailwind: string | null;
  tailwindCss: string;
  extraCss: string;
  background: string;
};

/** Documento del iframe: las hojas de estilo de producción y el HTML del ejemplo tal cual. */
export function previewDocument({ html, surface, background, align = 'center', id = '', padding = 32 }: { html: string; surface: PreviewSurface; background?: string; align?: 'center' | 'start'; id?: string; padding?: number }) {
  const links = surface.stylesheets.map((href) => `<link rel="stylesheet" href="${href}">`).join('');
  const tailwind = surface.tailwind
    ? `<script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@${surface.tailwind}"></script><style type="text/tailwindcss">${surface.tailwindCss}</style>`
    : '';
  const bg = background ? `var(--${background})` : surface.background;
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">${links}${tailwind}
<style>${surface.extraCss} html,body{margin:0;min-height:0;background:${bg}} body{padding:${padding}px;display:flex;flex-wrap:wrap;align-items:center;justify-content:${align === 'center' ? 'center' : 'flex-start'};gap:12px} body>section,body>header,body>footer,body>main,body>nav,body>article{flex:1 1 100%;min-width:0}</style></head>
<body>${html}<script>
document.addEventListener('click', function (e) { if (e.target.closest('a,form button[type=submit]')) e.preventDefault(); });
document.addEventListener('submit', function (e) { e.preventDefault(); });
function send() { parent.postMessage({ dsPreview: ${JSON.stringify(id)}, height: document.documentElement.offsetHeight }, '*'); }
new ResizeObserver(send).observe(document.documentElement); window.addEventListener('load', send); if (document.fonts) document.fonts.ready.then(send);
</script></body></html>`;
}

/**
 * Ejemplo en vivo: un iframe que carga las hojas de estilo de producción (instantánea del último sync)
 * y pinta el HTML del ejemplo tal cual. Lo que se ve aquí es lo que hay en producción.
 * La altura se ajusta al contenido; `minHeight` fija un mínimo (las vistas previas de componente usan 18 rem).
 */
export function Preview({ html, surface, background, align = 'center', className, minHeight }: { html: string; surface: PreviewSurface; background?: string; align?: 'center' | 'start'; className?: string; minHeight?: number }) {
  const id = useId();
  const ref = useRef<HTMLIFrameElement>(null);
  const doc = useMemo(() => previewDocument({ html, surface, background, align, id }), [html, surface, background, align, id]);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.data?.dsPreview === id && ref.current) ref.current.style.height = `${Math.ceil(event.data.height)}px`;
    };
    window.addEventListener('message', onMessage);
    // Si el iframe cargó antes de hidratar, su primer mensaje se perdió: se mide ahora.
    const root = ref.current?.contentDocument;
    if (root?.readyState === 'complete' && ref.current) ref.current.style.height = `${Math.ceil(root.documentElement.offsetHeight)}px`;
    return () => window.removeEventListener('message', onMessage);
  }, [id]);

  return (
    <div data-slot="preview" className={cn('flex w-full items-center', className)} style={{ minHeight, background: background ? undefined : surface.background }}>
      <iframe
        ref={ref}
        title="Ejemplo en vivo"
        srcDoc={doc}
        sandbox="allow-scripts allow-same-origin"
        loading="lazy"
        className="block w-full border-0"
        onLoad={(e) => {
          const root = e.currentTarget.contentDocument?.documentElement;
          if (root) e.currentTarget.style.height = `${Math.ceil(root.offsetHeight)}px`;
        }}
      />
    </div>
  );
}
