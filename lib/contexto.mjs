// Contexto para agentes del repo de producción: un bloque corto para su AGENTS.md (o CLAUDE.md).
//
// Vercel midió que un índice comprimido siempre presente en AGENTS.md acierta más que una skill que el agente
// tiene que decidir cargar. Este bloque es ese índice: la regla de consultar antes de escribir, dónde leer y
// qué piezas y tokens existen en producción. El kit no escribe en producción: el bloque lo genera `ds contexto`
// (y el sitio en /<sistema>/agents.md) y una persona lo lleva a producción con un PR. `ds sync` comprueba,
// leyendo, si la copia de producción está al día.
import crypto from 'node:crypto';
import { CONTENT_SECTIONS, PLATFORM_SECTIONS, documentedTokens, loadEntries, withRoute } from './core.mjs';

/** Tamaño máximo del bloque: el índice de Vercel cabía en 8 KB sin perder aciertos. */
export const CONTEXTO_MAX = 8 * 1024;
const MARK = 'ds:contexto';

const sha = (text) => crypto.createHash('sha256').update(text).digest('hex').slice(0, 12);

/** Base de los enlaces: `publicacion.url` de system.json (o la que se pase) más la ruta de publicación. */
function linker(system, { url, route = '' } = {}) {
  const base = (url ?? system.publicacion?.url ?? '').replace(/\/+$/, '');
  return (href) => base + withRoute(href, route);
}

/**
 * El bloque de contexto de un sistema. Devuelve { texto, huella, bytes, compacto, piezas }.
 */
export function contextoBlock(system, opts = {}) {
  const at = linker(system, opts);
  const entries = loadEntries(system).filter((e) => e.estado === 'produccion');
  const groups = CONTENT_SECTIONS.map((section) => ({ section, list: entries.filter((e) => e.section === section.id) })).filter((g) => g.list.length);

  // Una línea por sección: slug(clases o tokens) | slug(…). Es el formato comprimido del índice de Vercel.
  const detail = (e) => {
    if (e.section === 'fundamentos') return documentedTokens(e).map((t) => `--${t.nombre}`);
    if (!PLATFORM_SECTIONS.includes(e.section)) return [];
    return [...new Set(Object.values(e.platforms).flatMap((p) => p.superficies.flatMap((s) => s.clases ?? [])))].map((c) => `.${c}`);
  };
  const lines = (withDetail) => groups.map(({ section, list }) => `${section.id}: ${list.map((e) => {
    const d = withDetail ? detail(e) : [];
    return d.length ? `${e.slug}(${d.join(',')})` : e.slug;
  }).join(' | ')}`);

  const render = (withDetail) => {
    const body = [
      `## Sistema de diseño: ${system.nombre}`,
      '',
      'Antes de escribir interfaz, consulta el sistema: prefiere lo que lees aquí a lo que recuerdas. Usa solo lo que está en esta lista («En producción»). Lo demás está en exploración o desarrollo y no existe en el código. Si falta una pieza o un token, dilo en el PR; no lo inventes.',
      '',
      `- Criterio, API de clases y tokens con sus valores: ${at(`/${system.id}/design.md`)}`,
      `- Cada ficha en Markdown: ${at(`/${system.id}/<sección>/<slug>.md`)} · sus datos (lo que usa, sync): ${at(`/${system.id}/r/<sección>/<slug>.json`)}`,
      `- Índice de todo: ${at('/llms.txt')}`,
      '',
      `### En producción${withDetail && groups.length ? ' (slug(clases) en piezas; slug(tokens) en fundamentos)' : ''}`,
      '',
      ...(groups.length ? lines(withDetail) : ['Aún no hay piezas «En producción». No uses el sistema como referencia de código todavía.']),
      '',
      '### Antes de terminar',
      '',
      '- Solo piezas y clases de esta lista; ninguna clase ni token inventado.',
      '- Ningún valor suelto (color, radio, sombra, espaciado) donde ya hay un token.',
      '- Las reglas de la ficha de cada pieza que uses, cumplidas; sus antipatrones, evitados.',
      '- Lo que no está en el sistema, señalado en el PR.',
    ].join('\n');
    return body;
  };

  // La huella sale de los datos (nombre, piezas, clases y tokens), no del texto: no cambia con la URL ni con el modo compacto.
  const huella = sha(JSON.stringify([system.nombre, lines(true)]));
  let compacto = false;
  let body = render(true);
  const frame = (b) => `<!-- ${MARK} ${system.id} huella=${huella} -->\n${b}\n<!-- /${MARK} -->\n`;
  if (Buffer.byteLength(frame(body)) > CONTEXTO_MAX) {
    // Sin clases ni tokens: quedan los slugs, y el detalle está en design.md.
    compacto = true;
    body = render(false);
  }
  const texto = frame(body);
  return { texto, huella, bytes: Buffer.byteLength(texto), compacto, piezas: entries.length };
}

/**
 * Busca el bloque de un sistema en los textos de producción (AGENTS.md, CLAUDE.md…) y lo compara con el actual.
 * Devuelve { estado: 'ok' | 'desactualizado' | 'sin-bloque', archivo, huella }.
 */
export function compareContexto(system, files, actual) {
  const pattern = new RegExp(`<!--\\s*${MARK}\\s+${system.id.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}\\s+huella=(\\w+)\\s*-->`);
  for (const [archivo, text] of files) {
    const m = pattern.exec(text);
    if (m) return { estado: m[1] === actual.huella ? 'ok' : 'desactualizado', archivo, huella: m[1] };
  }
  return { estado: 'sin-bloque', archivo: null, huella: null };
}
