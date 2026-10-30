// Núcleo compartido por la app (Next) y los scripts de sync y publicación.
// Todo lo que sabe leer un sistema vive aquí: sistemas, secciones, estados y entradas.
import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';
import { cssTokens } from './css-tokens.mjs';
import { presetFromCss } from './lab.mjs';
import { CONTENT_SECTIONS, PLATFORMS, normalizeId } from './meta.mjs';
import { normalizeRoute } from './ruta.mjs';

// ROOT es la carpeta del kit (el CLI ejecuta Next y los scripts desde ella).
export const ROOT = process.cwd();
export const SYSTEMS_DIR = path.join(ROOT, 'systems');
export const DOCS_DIR = path.join(ROOT, 'docs', 'metodologia');
// DS_SISTEMAS: rutas absolutas a sistemas que viven en otros repos (separadas por «:»).
// Sin ella se leen los sistemas de ejemplo del propio kit (systems/<id>).
const EXTERNAL = (process.env.DS_SISTEMAS ?? '').split(path.delimiter).filter(Boolean);

export * from './meta.mjs';
export * from './ruta.mjs';
export * from './tokens.mjs';

/** Separa el frontmatter YAML del cuerpo Markdown. */
export function readMarkdown(file) {
  const src = fs.readFileSync(file, 'utf8');
  const match = /^---\n([\s\S]*?)\n---\n?/.exec(src);
  if (!match) return { data: {}, body: src };
  return { data: YAML.parse(match[1]) ?? {}, body: src.slice(match[0].length) };
}

const readJson = (file, fallback = null) => (fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : fallback);

function systemDirs() {
  if (EXTERNAL.length) return EXTERNAL.map((dir) => path.resolve(dir));
  if (!fs.existsSync(SYSTEMS_DIR)) return [];
  return fs.readdirSync(SYSTEMS_DIR).filter((name) => !name.startsWith('_')).map((name) => path.join(SYSTEMS_DIR, name));
}

/** Lee un sistema desde su carpeta. El id sale de system.json o, si no lo tiene, del nombre de la carpeta. */
function readSystem(dir) {
  const config = readJson(path.join(dir, 'system.json'));
  if (!config) return null;
  return { ...config, id: config.id ?? path.basename(dir), dir };
}

export function listSystems() {
  return systemDirs().map(readSystem).filter((s) => s !== null);
}

export function loadSystem(id) {
  const system = listSystems().find((s) => s.id === id);
  if (!system) throw new Error(`No existe el sistema "${id}"`);
  return system;
}

/**
 * Ruta bajo la que se publica el sitio exportado ('' = la raíz). La variable DS_RUTA gana a
 * system.json → publicacion.ruta («DS_RUTA= ds build» exporta en la raíz). Un sitio tiene una sola
 * ruta: con varios sistemas, los que la declaran tienen que coincidir.
 */
export function publicationRoute() {
  if (process.env.DS_RUTA !== undefined) return normalizeRoute(process.env.DS_RUTA, 'DS_RUTA');
  const routes = [...new Set(listSystems().map((s) => normalizeRoute(s.publicacion?.ruta, `${s.id}: publicacion.ruta`)).filter(Boolean))];
  if (routes.length > 1) throw new Error(`Los sistemas declaran rutas de publicación distintas (${routes.join(', ')}); un sitio solo tiene una.`);
  return routes[0] ?? '';
}

/** Pasa las claves antiguas (`patrones/…`) a los ids actuales (`bloques/…`). */
const normalizeKeys = (data) => {
  if (data?.entradas) data.entradas = Object.fromEntries(Object.entries(data.entradas).map(([id, value]) => [normalizeId(id), value]));
  return data;
};

export const loadSyncReport = (system) => normalizeKeys(readJson(path.join(system.dir, 'sync-report.json')));
export const loadLock = (system) => normalizeKeys(readJson(path.join(system.dir, 'produccion.lock.json'), { entradas: {} }));
export const loadProductionTokens = (system) => readJson(path.join(system.dir, 'tokens.produccion.json'), {});

/**
 * Tokens del CSS de experimental/ con sus modos (`values` e `info`, como los de producción), y el preset del Lab
 * si experimental/tokens.css lo generó `ds preset aplicar`. null si no define ningún token.
 */
export function loadExperimentalTokens(system) {
  const dir = path.join(system.dir, 'experimental');
  if (!fs.existsSync(dir)) return null;
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.css')).sort();
  const { values, info } = cssTokens(files.map((f) => fs.readFileSync(path.join(dir, f), 'utf8')));
  if (!Object.keys(values).length) return null;
  const preset = files.includes('tokens.css') ? presetFromCss(fs.readFileSync(path.join(dir, 'tokens.css'), 'utf8')) : null;
  return { values, info, preset };
}

/**
 * Una entrada es un archivo `slug.md` o una carpeta `slug/` con `index.md`
 * y, opcionalmente, un archivo por plataforma (`web.md`, `ios.md`, `android.md`).
 */
export function loadEntries(system) {
  const entries = [];
  for (const section of CONTENT_SECTIONS) {
    // Una sección puede leer varias carpetas: la actual y su nombre anterior (bloques/ y patrones/).
    const files = (section.carpetas ?? [section.id])
      .map((folder) => path.join(system.dir, 'content', folder))
      .filter((dir) => fs.existsSync(dir))
      .flatMap((dir) => fs.readdirSync(dir).sort().map((name) => ({ dir, name })));
    for (const { dir, name } of files) {
      const full = path.join(dir, name);
      const isFolder = fs.statSync(full).isDirectory();
      if (!isFolder && !name.endsWith('.md')) continue;
      const slug = isFolder ? name : name.replace(/\.md$/, '');
      const indexFile = isFolder ? path.join(full, 'index.md') : full;
      if (!fs.existsSync(indexFile)) continue;
      const { data, body } = readMarkdown(indexFile);
      /** @type {Record<string, { estado: string; superficies: Array<{ id: string; fuente: string; clases?: string[] }>; body: string; file: string | null }>} */
      const platforms = {};
      for (const platform of Object.keys(PLATFORMS)) {
        const file = isFolder ? path.join(full, `${platform}.md`) : null;
        const declared = data.plataformas?.[platform] ?? null;
        platforms[platform] = {
          estado: declared?.estado ?? 'sin-iniciar',
          superficies: declared?.superficies ?? [],
          body: file && fs.existsSync(file) ? readMarkdown(file).body : '',
          file: file && fs.existsSync(file) ? path.relative(system.dir, file) : null,
        };
      }
      entries.push({
        id: `${section.id}/${slug}`,
        section: section.id,
        slug,
        href: `/${system.id}/${section.id}/${slug}`,
        titulo: data.titulo ?? slug,
        resumen: data.resumen ?? '',
        estado: data.estado ?? 'exploracion',
        data: { ...data, relacionados: (data.relacionados ?? []).map(normalizeId), usa: (data.usa ?? []).map(normalizeId) },
        body,
        platforms,
        file: path.relative(system.dir, indexFile),
      });
    }
  }
  return entries;
}

/**
 * Páginas de Docs propias del sistema: `content/docs/*.md`. `index.md` es la Introducción;
 * sin ella, la Introducción es el DESIGN.md del sistema. El orden sale de `content/docs/meta.json`
 * (`{ "paginas": ["primeros-pasos", "voz"] }`) y, si no está, del nombre del archivo.
 */
export function loadPages(system) {
  const dir = path.join(system.dir, 'content', 'docs');
  const pages = [];
  if (fs.existsSync(dir)) {
    for (const name of fs.readdirSync(dir).filter((n) => n.endsWith('.md')).sort()) {
      const { data, body } = readMarkdown(path.join(dir, name));
      const slug = name.replace(/\.md$/, '');
      pages.push({ slug: slug === 'index' ? '' : slug, titulo: data.titulo ?? slug, resumen: data.resumen ?? '', body, file: path.relative(system.dir, path.join(dir, name)) });
    }
  }
  if (!pages.some((p) => p.slug === '')) {
    const design = path.join(system.dir, 'DESIGN.md');
    const body = fs.existsSync(design) ? readMarkdown(design).body.replace(/^#\s.*\n+/, '') : '';
    pages.unshift({ slug: '', titulo: 'Introducción', resumen: system.descripcion ?? '', body, file: fs.existsSync(design) ? 'DESIGN.md' : null });
  }
  const order = readJson(path.join(dir, 'meta.json'), {})?.paginas ?? [];
  const rank = (slug) => (slug === '' ? -1 : order.includes(slug) ? order.indexOf(slug) : order.length);
  return pages.sort((a, b) => rank(a.slug) - rank(b.slug) || a.titulo.localeCompare(b.titulo, 'es'));
}

/** Documentos de metodología (globales, compartidos por todos los sistemas). */
export function loadDocs() {
  if (!fs.existsSync(DOCS_DIR)) return [];
  return fs
    .readdirSync(DOCS_DIR)
    .filter((name) => name.endsWith('.md'))
    .sort()
    .map((name) => {
      const { data, body } = readMarkdown(path.join(DOCS_DIR, name));
      const slug = name.replace(/\.md$/, '').replace(/^\d+-/, '');
      return { slug, file: path.relative(ROOT, path.join(DOCS_DIR, name)), titulo: data.titulo ?? slug, resumen: data.resumen ?? '', grupo: data.grupo ?? 'Metodología', body };
    });
}

/** Lee la línea de info de un bloque de código: ```html preview superficie=portal fondo=night */
export function parseFence(info = '') {
  const [lang = '', ...rest] = info.trim().split(/\s+/);
  /** @type {Record<string, string | boolean>} */
  const meta = {};
  for (const part of rest) {
    const [key, value] = part.split('=');
    meta[key] = value ?? true;
  }
  return { lang, meta };
}

/** Clases usadas en los bloques ```html preview``` (se omiten las superficies con Tailwind). */
export function previewClasses(markdown, skipSurfaces = []) {
  const classes = new Set();
  for (const [, info, code] of markdown.matchAll(/```([^\n]*)\n([\s\S]*?)```/g)) {
    const { lang, meta } = parseFence(info);
    if (lang !== 'html' || !meta.preview || skipSurfaces.includes(meta.superficie)) continue;
    for (const [, list] of code.matchAll(/class="([^"]*)"/g)) list.split(/\s+/).filter(Boolean).forEach((c) => classes.add(c));
  }
  return [...classes];
}
