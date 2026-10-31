'use client';

import { useCallback, useEffect, useId, useMemo, useRef } from 'react';
import { modeLabel } from '@/lib/tokens.mjs';
import { cn } from '@/lib/utils';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

export type PreviewSurface = {
  stylesheets: string[];
  tailwind: string | null;
  tailwindCss: string;
  extraCss: string;
  background: string;
  /** Modos de la superficie con los selectores que los activan (informe del sync, `tokens.<superficie>.modos`). */
  modos: Record<string, string[]> | null;
  /** Alto de la vista de los ejemplos (`altoVista` de la superficie), en px. */
  altoVista: number | null;
};

/** Alto de la vista de un ejemplo cuando ni el ejemplo ni la superficie dicen otro: lo que vale `100vh` dentro del marco. */
export const ALTO_VISTA = 640;

/** Modos de una superficie entre los que se puede cambiar en un ejemplo: [] si tiene uno o ninguno. */
export const previewModes = (surface: PreviewSurface) => Object.keys(surface.modos ?? {}).length > 1 ? Object.keys(surface.modos!) : [];

/** Documento del iframe: las hojas de estilo de producción y el HTML del ejemplo tal cual. */
export function previewDocument({ html, surface, background, align = 'center', id = '', padding = 32 }: { html: string; surface: PreviewSurface; background?: string; align?: 'center' | 'start'; id?: string; padding?: number }) {
  const links = surface.stylesheets.map((href) => `<link rel="stylesheet" href="${href}">`).join('');
  const tailwind = surface.tailwind
    ? `<script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@${surface.tailwind}"></script><style type="text/tailwindcss">${surface.tailwindCss}</style>`
    : '';
  const bg = background ? `var(--${background})` : surface.background;
  // align-content: flex-start deja el contenido arriba aunque la hoja del producto fije html, body { height: 100% }:
  // así se mide lo que ocupa y no el alto del marco. Con data-ds-vista (alto de vista fijo) el ejemplo va sin margen,
  // para que una sección de 100vh llene la vista.
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">${links}${tailwind}
<style>${surface.extraCss} html,body{margin:0;min-height:0;background:${bg}} body{box-sizing:border-box;padding:${padding}px;display:flex;flex-wrap:wrap;align-items:center;align-content:flex-start;justify-content:${align === 'center' ? 'center' : 'flex-start'};gap:12px} html[data-ds-vista] body{padding:0} body>section,body>header,body>footer,body>main,body>nav,body>article{flex:1 1 100%;min-width:0}</style></head>
<body>${html}<script>
document.addEventListener('click', function (e) { if (e.target.closest('a,form button[type=submit]')) e.preventDefault(); });
document.addEventListener('submit', function (e) { e.preventDefault(); });
// Alto del contenido: hasta dónde llega lo último del body, sin contar el alto del body (que la hoja puede fijar al 100%).
window.__dsAltura = function () {
  var b = document.body, r = document.createRange(), bottom = 0;
  r.selectNodeContents(b); bottom = r.getBoundingClientRect().bottom;
  for (var i = 0; i < b.children.length; i++) {
    var el = b.children[i], s = getComputedStyle(el);
    if (s.display === 'none' || s.position === 'fixed') continue;
    bottom = Math.max(bottom, el.getBoundingClientRect().bottom + (parseFloat(s.marginBottom) || 0));
  }
  var cs = getComputedStyle(b);
  return Math.ceil(bottom + window.scrollY + (parseFloat(cs.paddingBottom) || 0) + (parseFloat(cs.borderBottomWidth) || 0));
};
function send() { parent.postMessage({ dsPreview: ${JSON.stringify(id)} }, '*'); }
var ro = new ResizeObserver(send); ro.observe(document.documentElement); ro.observe(document.body);
for (var i = 0; i < document.body.children.length; i++) ro.observe(document.body.children[i]);
window.addEventListener('load', send); document.addEventListener('load', send, true); if (document.fonts) document.fonts.ready.then(send);
</script></body></html>`;
}

type Frame = HTMLIFrameElement & { contentWindow: (Window & { __dsAltura?: () => number }) | null };

/**
 * Ajusta el alto del marco. Sin alto de vista fijo, el marco mide lo que ocupa el contenido; pero si el contenido
 * depende del alto de la vista (100vh, 100dvh, height: 100% encadenado desde html), crecería sin fin con el marco:
 * se mide con dos altos de vista y, si cambia, el marco se queda con el alto de vista y el contenido se desplaza dentro.
 */
function fit(frame: Frame, vista: number, fixed: boolean) {
  const win = frame.contentWindow;
  const root = frame.contentDocument?.documentElement;
  if (!win?.__dsAltura || !root || !frame.offsetWidth) return;
  const setHeight = (px: number) => {
    frame.style.height = `${px}px`;
    void frame.offsetHeight; // fuerza el layout para que el iframe mida con su nuevo alto de vista
  };
  if (fixed) {
    root.setAttribute('data-ds-vista', '');
    setHeight(vista);
    return;
  }
  root.removeAttribute('data-ds-vista');
  setHeight(vista);
  const a = win.__dsAltura();
  setHeight(vista + 120);
  const b = win.__dsAltura();
  if (Math.abs(b - a) > 1) {
    root.setAttribute('data-ds-vista', '');
    setHeight(vista);
  } else setHeight(a);
}

type Target = { media: string | null; on: 'html' | 'body'; attr: [string, string] | null; cls: string | null };

/** Lee un selector de modo del informe del sync: `.dark`, `:root[data-theme='light']`, `@media (prefers-color-scheme: dark) :root`… */
function parseModeSelector(selector: string): Target | null {
  const media = /^@media\s*\(\s*prefers-color-scheme\s*:\s*([\w-]+)\s*\)\s*(.*)$/.exec(selector.trim());
  const rest = (media ? media[2] : selector).trim().replace(/:not\([^)]*\)/g, '');
  const m = /^(:root|html|body)?(?:\[([\w-]+)\s*=\s*(["']?)([\w-]+)\3\s*\]|\.([\w-]+))?$/.exec(rest);
  if (!m) return null;
  return { media: media ? media[1] : null, on: m[1] === 'body' ? 'body' : 'html', attr: m[2] ? [m[2], m[4]] : null, cls: m[5] ?? null };
}

const SCHEME = /\(\s*prefers-color-scheme\s*:\s*([\w-]+)\s*\)/g;
type MediaWindow = Window & { __dsMedia?: Map<CSSMediaRule, string> };

/**
 * Emula `prefers-color-scheme` dentro del marco: el navegador no deja fijarla para un iframe, así que se reescriben
 * las condiciones de las @media de sus hojas (siempre cierta para el esquema elegido, nunca para el otro). Con
 * `scheme` null se dejan como estaban. Las hojas de producción se sirven desde el mismo origen, así que se pueden leer.
 */
function emulateScheme(win: MediaWindow, doc: Document, scheme: string | null) {
  const original = (win.__dsMedia ??= new Map());
  const visit = (rules: CSSRuleList) => {
    for (const rule of Array.from(rules)) {
      if ('media' in rule && 'conditionText' in rule) {
        const media = (rule as CSSMediaRule).media;
        const text = original.get(rule as CSSMediaRule) ?? media.mediaText;
        if (/prefers-color-scheme/.test(text)) {
          original.set(rule as CSSMediaRule, text);
          const next = scheme ? text.replace(SCHEME, (_: string, value: string) => (value === scheme ? '(min-width: 0px)' : '(max-width: 0px) and (min-width: 1px)')) : text;
          if (media.mediaText !== next) media.mediaText = next;
        }
      }
      if ('cssRules' in rule && (rule as CSSGroupingRule).cssRules) visit((rule as CSSGroupingRule).cssRules);
    }
  };
  for (const sheet of Array.from(doc.styleSheets)) {
    try {
      visit(sheet.cssRules);
    } catch {
      // Una hoja de otro origen no se puede leer: se queda como está.
    }
  }
}

/**
 * Pone el modo en el documento del marco: quita los atributos y clases de los demás modos y aplica los del elegido,
 * en html (o en body, si el selector es de body). Si algún modo de la superficie es una @media (prefers-color-scheme),
 * se emula el esquema del modo elegido (ver emulateScheme). Solo toca lo que cambia, para no disparar observadores.
 */
function applyMode(frame: HTMLIFrameElement, modos: Record<string, string[]>, mode: string) {
  const doc = frame.contentDocument;
  const win = frame.contentWindow as MediaWindow | null;
  if (!doc?.body || !win) return;
  const el = (on: 'html' | 'body') => (on === 'body' ? doc.body : doc.documentElement);
  const all = Object.values(modos).flat().map(parseModeSelector).filter((t): t is Target => t !== null);
  const targets = (modos[mode] ?? []).map(parseModeSelector).filter((t): t is Target => t !== null);
  const own = targets.find((t) => !t.media) ?? targets[0];
  for (const t of all) {
    if (t.attr && !(own?.attr && own.on === t.on && own.attr[0] === t.attr[0])) el(t.on).removeAttribute(t.attr[0]);
    if (t.cls && !(own?.cls === t.cls && own.on === t.on) && el(t.on).classList.contains(t.cls)) el(t.on).classList.remove(t.cls);
  }
  if (own?.attr && el(own.on).getAttribute(own.attr[0]) !== own.attr[1]) el(own.on).setAttribute(own.attr[0], own.attr[1]);
  if (own?.cls && !el(own.on).classList.contains(own.cls)) el(own.on).classList.add(own.cls);
  if (all.some((t) => t.media)) emulateScheme(win, doc, targets.find((t) => t.media)?.media ?? (mode === 'light' || mode === 'dark' ? mode : null));
}

/**
 * Ejemplo en vivo: un iframe que carga las hojas de estilo de producción (instantánea del último sync)
 * y pinta el HTML del ejemplo tal cual. Lo que se ve aquí es lo que hay en producción.
 * La altura se ajusta al contenido; `minHeight` fija un mínimo (las vistas previas de componente usan 18 rem).
 * `vista` fija el alto de la vista (lo que vale 100vh): `true` usa el de la superficie. Sin ella, el marco crece con
 * el contenido salvo que el contenido dependa del alto de la vista. `mode` es el modo de la superficie que se ve.
 */
export function Preview({ html, surface, background, align = 'center', className, minHeight, vista, mode }: { html: string; surface: PreviewSurface; background?: string; align?: 'center' | 'start'; className?: string; minHeight?: number; vista?: number | boolean; mode?: string }) {
  const id = useId();
  const ref = useRef<Frame>(null);
  const doc = useMemo(() => previewDocument({ html, surface, background, align, id }), [html, surface, background, align, id]);
  const height = typeof vista === 'number' ? vista : surface.altoVista ?? ALTO_VISTA;
  const fixed = vista !== undefined && vista !== false;
  const modos = surface.modos;

  const update = useCallback(() => {
    const frame = ref.current;
    if (!frame) return;
    if (mode && modos?.[mode]) applyMode(frame, modos, mode);
    fit(frame, height, fixed);
  }, [height, fixed, mode, modos]);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.data?.dsPreview === id) update();
    };
    window.addEventListener('message', onMessage);
    // Si el iframe cargó antes de hidratar, su primer mensaje se perdió: se ajusta ahora (también al cambiar de modo).
    if (ref.current?.contentDocument?.readyState === 'complete') update();
    return () => window.removeEventListener('message', onMessage);
  }, [id, update]);

  return (
    <div data-slot="preview" className={cn('flex w-full items-center', className)} style={{ minHeight, background: background ? undefined : surface.background }}>
      <iframe
        ref={ref}
        title="Ejemplo en vivo"
        srcDoc={doc}
        sandbox="allow-scripts allow-same-origin"
        loading="lazy"
        className="block w-full border-0"
        onLoad={update}
      />
    </div>
  );
}

/** Conmutador de modo (claro, oscuro…) del marco de un ejemplo. Solo se pinta si la superficie tiene más de un modo. */
export function PreviewModeToggle({ modes, value, onChange, className }: { modes: string[]; value: string; onChange: (mode: string) => void; className?: string }) {
  if (modes.length < 2) return null;
  return (
    <div className={cn('flex h-8 items-center rounded-md border bg-background p-[2px] shadow-none', className)}>
      <ToggleGroup type="single" value={value} onValueChange={(next) => next && onChange(next)} aria-label="Modo del ejemplo" className="gap-1 *:data-[slot=toggle-group-item]:h-6! *:data-[slot=toggle-group-item]:rounded-sm! *:data-[slot=toggle-group-item]:px-2! *:data-[slot=toggle-group-item]:text-xs">
        {modes.map((m) => <ToggleGroupItem key={m} value={m} title={`Ver el ejemplo en modo ${modeLabel(m).toLowerCase()}`}>{modeLabel(m)}</ToggleGroupItem>)}
      </ToggleGroup>
    </div>
  );
}
