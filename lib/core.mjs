// Núcleo compartido por la app (Next) y los scripts de sync y publicación.
// Todo lo que sabe leer un sistema vive aquí: sistemas, secciones, estados y entradas.
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';
import { cssTokens } from './css-tokens.mjs';
import { presetFromCss } from './lab.mjs';
import { CONTENT_SECTIONS, IDIOMAS, PLATFORMS, TRADUCCIONES, normalizeId } from './meta.mjs';
import { localizeMarkdown, normalizeRoute } from './ruta.mjs';

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

/**
 * El repo de directorio que sirve juntos varios sistemas (`directorio.json`, que `ds dev` y `ds build` pasan en
 * DS_DIRECTORIO). null en el repo de un sistema y en el kit.
 */
export function loadDirectory() {
  const config = process.env.DS_DIRECTORIO ? readJson(process.env.DS_DIRECTORIO) : null;
  if (!config) return null;
  return { nombre: config.nombre || 'Sistemas de diseño', descripcion: config.descripcion ?? '', publicacion: config.publicacion ?? null };
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
 * Idiomas de un sistema (system.json → `idiomas`, por defecto ["es"]). El primero es el principal: en él se escriben
 * las fichas y se sirve en las URL de siempre. Los demás son traducciones (`boton.en.md` junto a `boton.md`) y se
 * sirven bajo /<idioma>/. Falla si el valor no es válido.
 * @param {{ id: string; idiomas?: unknown }} system
 * @returns {{ principal: string; traducciones: string[]; todos: string[] }}
 */
export function systemLanguages(system) {
  const list = system.idiomas === undefined ? ['es'] : system.idiomas;
  if (!Array.isArray(list) || !list.length || list.some((l) => typeof l !== 'string' || !(l in IDIOMAS)) || new Set(list).size !== list.length) {
    throw new Error(`${system.id}: idiomas tiene que ser una lista sin repetidos de ${Object.keys(IDIOMAS).map((l) => `"${l}"`).join(' o ')}, con el principal primero.`);
  }
  const [principal, ...traducciones] = /** @type {string[]} */ (list);
  const unsupported = traducciones.filter((l) => !TRADUCCIONES.includes(l));
  if (unsupported.length) throw new Error(`${system.id}: el kit aún no sirve traducciones a ${unsupported.join(', ')} (solo ${TRADUCCIONES.join(', ')}).`);
  return { principal, traducciones, todos: list };
}

/**
 * El idioma en que se lee una página: el principal del sistema o la traducción de su ruta.
 * @param {{ id: string; idiomas?: unknown }} system
 * @param {string | null} [traduccion]
 */
export const pageLanguage = (system, traduccion = null) => traduccion ?? systemLanguages(system).principal;

/** Prefijo de las URL de un idioma: '' para el principal, '/en' para una traducción. */
export const languagePrefix = (system, lang) => (lang === systemLanguages(system).principal ? '' : `/${lang}`);

/** Idioma principal del sitio (el del Directorio y la página 404): el del primer sistema, o español. */
export const siteLanguage = () => {
  const [first] = listSystems();
  return first ? systemLanguages(first).principal : 'es';
};

/** Sistemas que tienen una traducción a `lang`. */
export const systemsIn = (lang) => listSystems().filter((s) => systemLanguages(s).traducciones.includes(lang));

/** El sistema con su nombre y su descripción en `lang` (system.json → `"en": { "nombre", "descripcion" }`). */
export function localizeSystem(system, lang) {
  if (lang === systemLanguages(system).principal) return system;
  const own = system[lang] ?? {};
  return { ...system, nombre: own.nombre ?? system.nombre, descripcion: own.descripcion ?? system.descripcion };
}

// --- Traducciones -------------------------------------------------------------------------------------------------
// Una traducción es un archivo hermano: `boton.en.md` junto a `boton.md`, `index.en.md` junto a `index.md`,
// `DESIGN.en.md` junto a `DESIGN.md`. Solo lleva lo que se lee (titulo, resumen, grupo y el cuerpo); lo demás
// (estado, fuentes, plataformas…) sale del original. `origen` guarda la huella del original que se tradujo.

/** Campos del frontmatter que se traducen. */
export const TRANSLATED_FIELDS = ['titulo', 'resumen', 'grupo'];
const TRANSLATION_FILE = new RegExp(`\\.(${Object.keys(IDIOMAS).join('|')})\\.md$`);
/** ¿Es la traducción de otro archivo? (`boton.en.md`) */
export const isTranslationFile = (name) => TRANSLATION_FILE.test(name);
/** `boton.md` → `boton.en.md`. */
export const translationFile = (file, lang) => file.replace(/\.md$/, `.${lang}.md`);

/** Huella de lo que se traduce de un archivo: los campos de TRANSLATED_FIELDS y el cuerpo. */
export function translationHash({ data = {}, body = '' }) {
  const text = JSON.stringify([...TRANSLATED_FIELDS.map((f) => data[f] ?? ''), body.trim()]);
  return crypto.createHash('sha256').update(text).digest('hex').slice(0, 12);
}

/**
 * Lee la traducción de `file` a `lang`. `estado`: 'ok', 'desfasada' (el original cambió después de traducirlo:
 * `origen` no coincide) o 'falta' (no hay archivo; se devuelve el original).
 * @param {string} file
 * @param {string} lang
 * @param {{ data: Record<string, any>; body: string }} [original]
 */
export function readTranslation(file, lang, original = readMarkdown(file)) {
  const target = translationFile(file, lang);
  if (!fs.existsSync(target)) return { ...original, estado: 'falta', file: null };
  const { data, body } = readMarkdown(target);
  const merged = { ...original.data };
  for (const field of TRANSLATED_FIELDS) if (data[field] !== undefined) merged[field] = data[field];
  return { data: merged, body, estado: String(data.origen) === translationHash(original) ? 'ok' : 'desfasada', file: target, origen: data.origen == null ? null : String(data.origen) };
}

/** El peor estado de varias traducciones de una misma página. */
const worst = (states) => (states.includes('falta') ? 'falta' : states.includes('desfasada') ? 'desfasada' : 'ok');

/** Ids de los sistemas con traducción a `lang`: sus enlaces internos (`/<id>/…`) llevan el prefijo del idioma. */
const linkRoots = (lang) => systemsIn(lang).map((s) => s.id);

/**
 * Ruta bajo la que se publica el sitio exportado ('' = la raíz). La variable DS_RUTA gana a
 * directorio.json → publicacion.ruta y esta, a system.json → publicacion.ruta («DS_RUTA= ds build» exporta en la raíz). Un sitio tiene una sola
 * ruta: con varios sistemas, los que la declaran tienen que coincidir.
 */
export function publicationRoute() {
  if (process.env.DS_RUTA !== undefined) return normalizeRoute(process.env.DS_RUTA, 'DS_RUTA');
  // En un directorio, la ruta es la del directorio: los sistemas se publican todos bajo ella.
  const directory = loadDirectory();
  if (directory) return normalizeRoute(directory.publicacion?.ruta, 'directorio.json: publicacion.ruta');
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
export function loadEntries(system, lang = systemLanguages(system).principal) {
  const translated = lang !== systemLanguages(system).principal;
  const prefix = languagePrefix(system, lang);
  const roots = translated ? linkRoots(lang) : [];
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
      if (!isFolder && (!name.endsWith('.md') || isTranslationFile(name))) continue;
      const slug = isFolder ? name : name.replace(/\.md$/, '');
      const indexFile = isFolder ? path.join(full, 'index.md') : full;
      if (!fs.existsSync(indexFile)) continue;
      const index = translated ? readTranslation(indexFile, lang) : { ...readMarkdown(indexFile), estado: 'ok' };
      const { data, body } = index;
      const states = [index.estado];
      /** @type {Record<string, { estado: string; superficies: Array<{ id: string; fuente: string; clases?: string[] }>; body: string; file: string | null }>} */
      const platforms = {};
      for (const platform of Object.keys(PLATFORMS)) {
        const file = isFolder ? path.join(full, `${platform}.md`) : null;
        const declared = data.plataformas?.[platform] ?? null;
        const own = file && fs.existsSync(file) ? (translated ? readTranslation(file, lang) : { ...readMarkdown(file), estado: 'ok' }) : null;
        if (own) states.push(own.estado);
        platforms[platform] = {
          estado: declared?.estado ?? 'sin-iniciar',
          superficies: declared?.superficies ?? [],
          body: own ? localizeMarkdown(own.body, prefix, roots) : '',
          file: file && fs.existsSync(file) ? path.relative(system.dir, file) : null,
        };
      }
      entries.push({
        id: `${section.id}/${slug}`,
        section: section.id,
        slug,
        href: `${prefix}/${system.id}/${section.id}/${slug}`,
        titulo: data.titulo ?? slug,
        resumen: data.resumen ?? '',
        estado: data.estado ?? 'exploracion',
        data: { ...data, relacionados: (data.relacionados ?? []).map(normalizeId), usa: (data.usa ?? []).map(normalizeId) },
        body: localizeMarkdown(body, prefix, roots),
        /** Con una traducción: 'ok', 'desfasada' o 'falta' (se lee el original). En el idioma principal, null. */
        traduccion: translated ? worst(states) : null,
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
export function loadPages(system, lang = systemLanguages(system).principal) {
  const translated = lang !== systemLanguages(system).principal;
  const prefix = languagePrefix(system, lang);
  const roots = translated ? linkRoots(lang) : [];
  const read = (file) => (translated ? readTranslation(file, lang) : { ...readMarkdown(file), estado: 'ok' });
  const dir = path.join(system.dir, 'content', 'docs');
  const pages = [];
  if (fs.existsSync(dir)) {
    for (const name of fs.readdirSync(dir).filter((n) => n.endsWith('.md') && !isTranslationFile(n)).sort()) {
      const { data, body, estado } = read(path.join(dir, name));
      const slug = name.replace(/\.md$/, '');
      pages.push({ slug: slug === 'index' ? '' : slug, titulo: data.titulo ?? slug, resumen: data.resumen ?? '', body: localizeMarkdown(body, prefix, roots), file: path.relative(system.dir, path.join(dir, name)), traduccion: translated ? estado : null });
    }
  }
  if (!pages.some((p) => p.slug === '')) {
    const design = path.join(system.dir, 'DESIGN.md');
    const own = fs.existsSync(design) ? read(design) : null;
    const body = own ? own.body.replace(/^#\s.*\n+/, '') : '';
    const titulo = lang === 'en' ? 'Introduction' : 'Introducción';
    pages.unshift({ slug: '', titulo, resumen: localizeSystem(system, lang).descripcion ?? '', body: localizeMarkdown(body, prefix, roots), file: own ? 'DESIGN.md' : null, traduccion: translated && own ? own.estado : null });
  }
  const order = readJson(path.join(dir, 'meta.json'), {})?.paginas ?? [];
  const rank = (slug) => (slug === '' ? -1 : order.includes(slug) ? order.indexOf(slug) : order.length);
  return pages.sort((a, b) => rank(a.slug) - rank(b.slug) || a.titulo.localeCompare(b.titulo, lang));
}

/**
 * Documentos de metodología (globales, compartidos por todos los sistemas). Se escriben en español; con `lang`,
 * se lee su traducción (`00-principios.en.md`) si la hay.
 */
export function loadDocs(lang = 'es') {
  if (!fs.existsSync(DOCS_DIR)) return [];
  const translated = lang !== 'es';
  const prefix = translated ? `/${lang}` : '';
  const roots = translated ? linkRoots(lang) : [];
  return fs
    .readdirSync(DOCS_DIR)
    .filter((name) => name.endsWith('.md') && !isTranslationFile(name))
    .sort()
    .map((name) => {
      const file = path.join(DOCS_DIR, name);
      const { data, body, estado } = translated ? readTranslation(file, lang) : { ...readMarkdown(file), estado: 'ok' };
      const slug = name.replace(/\.md$/, '').replace(/^\d+-/, '');
      return { slug, file: path.relative(ROOT, file), titulo: data.titulo ?? slug, resumen: data.resumen ?? '', grupo: data.grupo ?? 'Metodología', body: localizeMarkdown(body, prefix, roots), traduccion: translated ? estado : null };
    });
}

/**
 * Todas las traducciones de un sistema, por archivo: el original, su traducción, el estado y la huella que tendría
 * que llevar en `origen`. Las páginas de metodología, con `metodologia: true`, solo si se piden (en el kit).
 */
export function listTranslations(system, { metodologia = false } = {}) {
  const { traducciones } = systemLanguages(system);
  const originals = [];
  const walk = (dir) => {
    if (!fs.existsSync(dir)) return;
    for (const name of fs.readdirSync(dir).sort()) {
      const full = path.join(dir, name);
      if (fs.statSync(full).isDirectory()) walk(full);
      else if (name.endsWith('.md') && !isTranslationFile(name)) originals.push(full);
    }
  };
  walk(path.join(system.dir, 'content'));
  if (fs.existsSync(path.join(system.dir, 'DESIGN.md'))) originals.push(path.join(system.dir, 'DESIGN.md'));
  if (metodologia && fs.existsSync(DOCS_DIR)) originals.push(...fs.readdirSync(DOCS_DIR).filter((n) => n.endsWith('.md') && !isTranslationFile(n)).sort().map((n) => path.join(DOCS_DIR, n)));
  return traducciones.flatMap((lang) =>
    originals.map((file) => {
      const original = readMarkdown(file);
      const t = readTranslation(file, lang, original);
      return { lang, original: file, traduccion: translationFile(file, lang), estado: t.estado, origen: t.origen ?? null, huella: translationHash(original) };
    }),
  );
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
