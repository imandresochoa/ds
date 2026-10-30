// Ejemplos en vivo de una ficha, para la home y las galerías (Bloques, Gráficos).
import { parseFence } from './core.mjs';
import type { Entry } from './nav';

export type EntryPreview = { html: string; superficie: string | null; fondo: string | null };

/** Bloques ```html preview``` de la ficha: primero los de la versión web, después los del cuerpo común. */
export function entryPreviews(entry: Entry): EntryPreview[] {
  const sources = [entry.platforms.web?.body ?? '', entry.body];
  const out: EntryPreview[] = [];
  for (const source of sources) {
    for (const [, info, code] of source.matchAll(/```([^\n]*)\n([\s\S]*?)```/g)) {
      const { lang, meta } = parseFence(info);
      if (lang !== 'html' || !meta.preview) continue;
      out.push({ html: code, superficie: typeof meta.superficie === 'string' ? meta.superficie : null, fondo: typeof meta.fondo === 'string' ? meta.fondo : null });
    }
  }
  return out;
}
