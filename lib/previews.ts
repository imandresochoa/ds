// Ejemplos en vivo de una ficha, para la home y las tarjetas de los índices.
import type { PreviewSurface } from '@/components/Preview';
import { parseFence } from './core.mjs';
import type { Entry } from './nav';

export type EntryPreview = { html: string; superficie: string | null; fondo: string | null; vista?: number | true; modo?: string };

/** `vista` de un bloque ```html preview```: `vista` sola (el alto de vista de la superficie) o `vista=720` (px). */
export function fenceViewport(value: string | boolean | undefined): number | true | undefined {
  if (value === true) return true;
  const px = typeof value === 'string' ? Number.parseInt(value, 10) : Number.NaN;
  return px > 0 ? px : undefined;
}

/** Bloques ```html preview``` de la ficha: primero los de la versión web, después los del cuerpo común. */
export function entryPreviews(entry: Entry): EntryPreview[] {
  const sources = [entry.platforms.web?.body ?? '', entry.body];
  const out: EntryPreview[] = [];
  for (const source of sources) {
    for (const [, info, code] of source.matchAll(/```([^\n]*)\n([\s\S]*?)```/g)) {
      const { lang, meta } = parseFence(info);
      if (lang !== 'html' || !meta.preview) continue;
      out.push({ html: code, superficie: typeof meta.superficie === 'string' ? meta.superficie : null, fondo: typeof meta.fondo === 'string' ? meta.fondo : null, vista: fenceViewport(meta.vista), modo: typeof meta.modo === 'string' ? meta.modo : undefined });
    }
  }
  return out;
}

/** Primer ejemplo de una ficha con la superficie que lo pinta (la suya o la primera), o null si no tiene. */
export function firstPreview(entry: Entry, surfaces: Record<string, PreviewSurface>) {
  const preview = entryPreviews(entry)[0];
  const surface = preview && (surfaces[preview.superficie ?? ''] ?? Object.values(surfaces)[0]);
  return preview && surface ? { preview, surface } : null;
}
