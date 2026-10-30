'use client';

import { useEffect, useId, useMemo, useRef } from 'react';

export type PreviewSurface = {
  stylesheets: string[];
  tailwind: string | null;
  tailwindCss: string;
  extraCss: string;
  background: string;
};

/**
 * Ejemplo en vivo: un iframe que carga las hojas de estilo de producción (instantánea del último sync)
 * y pinta el HTML del ejemplo tal cual. Lo que se ve aquí es lo que hay en producción.
 */
export function Preview({ html, surface, background }: { html: string; surface: PreviewSurface; background?: string }) {
  const id = useId();
  const ref = useRef<HTMLIFrameElement>(null);

  const doc = useMemo(() => {
    const links = surface.stylesheets.map((href) => `<link rel="stylesheet" href="${href}">`).join('');
    const tailwind = surface.tailwind
      ? `<script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@${surface.tailwind}"></script><style type="text/tailwindcss">${surface.tailwindCss}</style>`
      : '';
    const bg = background ? `var(--${background})` : surface.background;
    return `<!doctype html><html lang="es"><head><meta charset="utf-8">${links}${tailwind}
<style>${surface.extraCss} html,body{margin:0;min-height:0;background:${bg}} body{padding:32px;display:flex;flex-wrap:wrap;align-items:center;gap:12px} body>section,body>header,body>footer{flex:1 1 100%;min-width:0}</style></head>
<body>${html}<script>
document.addEventListener('click', function (e) { if (e.target.closest('a,form button[type=submit]')) e.preventDefault(); });
document.addEventListener('submit', function (e) { e.preventDefault(); });
function send() { parent.postMessage({ dsPreview: ${JSON.stringify(id)}, height: document.documentElement.offsetHeight }, '*'); }
new ResizeObserver(send).observe(document.documentElement); window.addEventListener('load', send); if (document.fonts) document.fonts.ready.then(send);
</script></body></html>`;
  }, [html, surface, background, id]);

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
    <div className="ds-preview">
      {/* Además del mensaje del iframe, se mide al cargar: el primer mensaje puede llegar antes de que exista el listener. */}
      <iframe ref={ref} title="Ejemplo en vivo" srcDoc={doc} sandbox="allow-scripts allow-same-origin" loading="lazy" onLoad={(e) => {
        const root = e.currentTarget.contentDocument?.documentElement;
        if (root) e.currentTarget.style.height = `${Math.ceil(root.offsetHeight)}px`;
      }} />
    </div>
  );
}
