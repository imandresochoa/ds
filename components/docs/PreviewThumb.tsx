'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { applyMode, previewDocument, type PreviewSurface } from '@/components/Preview';
import { cn } from '@/lib/utils';

/**
 * Lo que cambia del documento del ejemplo en una miniatura: sin barras de desplazamiento y, si va centrado, con el
 * contenido en mitad del marco. `html body` gana a las reglas de `previewDocument`, que van después.
 */
const THUMB_CSS = 'html:root{overflow:hidden} html body{pointer-events:none}';
const CENTER_CSS = 'html body{min-height:100vh;align-content:center}';

/**
 * Ejemplo en vivo reducido para las tarjetas de los índices. El iframe se pinta con un ancho de vista (`viewport`,
 * en px) o a una escala fija (`scale`), y `transform: scale()` lo encoge hasta el ancho de la tarjeta; lo que no
 * cabe en el alto del marco se recorta. Solo se carga cuando la tarjeta se acerca a la pantalla: un índice puede
 * tener treinta.
 */
export function PreviewThumb({ html, surface, background, mode, viewport, scale = 0.75, align = 'center', padding }: {
  html: string;
  surface: PreviewSurface;
  background?: string;
  mode?: string;
  viewport?: number;
  scale?: number;
  align?: 'center' | 'start';
  padding?: number;
}) {
  const box = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [width, setWidth] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (!e?.isIntersecting) return;
      setVisible(true);
      io.disconnect();
    }, { rootMargin: '400px 0px' });
    io.observe(el);
    const ro = new ResizeObserver(([e]) => e && setWidth(e.contentRect.width));
    ro.observe(el);
    return () => {
      io.disconnect();
      ro.disconnect();
    };
  }, []);

  const doc = useMemo(() => {
    if (!visible) return null;
    const extraCss = `${surface.extraCss} ${THUMB_CSS} ${align === 'center' ? CENTER_CSS : ''}`;
    return previewDocument({ html, surface: { ...surface, extraCss }, background, align, id: 'miniatura', padding });
  }, [visible, html, surface, background, align, padding]);

  // Con ancho de vista, la escala sale del ancho de la tarjeta: hasta medirlo no se pinta.
  const s = viewport ? width / viewport : scale;

  return (
    <div ref={box} aria-hidden="true" className="absolute inset-0 overflow-hidden" style={{ background: background ? undefined : surface.background }}>
      {doc && s > 0 && (
        <iframe
          title="Miniatura del ejemplo"
          srcDoc={doc}
          sandbox="allow-scripts allow-same-origin"
          loading="lazy"
          tabIndex={-1}
          onLoad={(e) => {
            if (mode && surface.modos?.[mode]) applyMode(e.currentTarget, surface.modos, mode);
            setLoaded(true);
          }}
          className={cn('pointer-events-none absolute top-0 left-0 block origin-top-left border-0 transition-opacity duration-300', loaded ? 'opacity-100' : 'opacity-0')}
          style={{ width: `${100 / s}%`, height: `${100 / s}%`, transform: `scale(${s})` }}
        />
      )}
    </div>
  );
}
