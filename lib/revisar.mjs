// `ds revisar`: comprueba que el código de producción usa bien el sistema. Sin modelo y de solo lectura.
//
// Lo que sabe el sistema (tokens con sus valores, clases que existen en producción y piezas con su estado) sale del
// último sync y se publica en /<sistema>/revisar.json. Así se puede revisar desde el repo de producción con npx, sin
// instalar el kit allí. Se compara con lo que conoce el sistema, no con el CSS local: una variante nueva que el agente
// define en su propio CSS (.boton--xl) sigue siendo una variante fuera del sistema.
//
//   valor-suelto          error  un color o valor compuesto que ya es un token → var(--token)
//   token-inexistente     error  var(--x) que no es un token ni se declara en el repo
//   clase-inventada       error  una clase del bloque de una pieza documentada que no existe en producción
//   pieza-obsoleta        error  clases de una pieza «Obsoleto»
//   pieza-no-en-produccion aviso clases de una pieza en exploración o desarrollo
//   color-fuera-de-paleta aviso  un color que no es ningún token
//
// Una línea con «ds-revisar-ignorar» no se revisa (para excepciones aceptadas en revisión).
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import postcss from 'postcss';

export const REVISAR_VERSION = 1;
const IGNORE = 'ds-revisar-ignorar';
const SOURCE = /\.(css|scss|less|html|tsx?|jsx?|mjs|cjs|vue|svelte|astro)$/;
const TEST = /(\.(test|spec|stories)\.|(^|\/)(__tests__|tests?|e2e|__mocks__)\/)/;
const SKIP_DIRS = new Set(['node_modules', 'dist', 'build', 'out', 'coverage', 'public', 'vendor', '.next', '.git']);
const COLOR = /#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})(?![\w-])|\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch)\([^()]*\)/g;
// Variables que pone el propio Tailwind (--tw-ring-color…) o el navegador: no son del sistema.
const FOREIGN_VAR = /^(tw-|radix-|webkit-)/;

/** Normaliza un valor para compararlo: minúsculas, espacios simples y hexadecimales largos (#abc → #aabbcc). */
export function normalizeValue(value) {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/\s*([(),/])\s*/g, '$1')
    .replace(/#([0-9a-f]{3,4})(?![\w-])/g, (_, h) => '#' + [...h].map((c) => c + c).join(''));
}

/** El bloque de una clase BEM: lo que va antes de «__» o «--» (ejemplo-boton--sec → ejemplo-boton). */
const blockOf = (name) => name.split(/__|--/)[0];

function distance(a, b) {
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const next = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = next;
    }
  }
  return row[b.length];
}
const closest = (name, options) => {
  let best = null;
  for (const o of options) {
    const d = distance(name, o);
    if (d <= Math.max(2, Math.floor(name.length / 3)) && (!best || d < best.d)) best = { o, d };
  }
  return best?.o ?? null;
};

/**
 * Los datos de revisar.json de un sistema: tokens por superficie, clases definidas en la instantánea de producción
 * del último sync y piezas con sus clases y su estado.
 * @param {any} system
 * @param {{ loadEntries: Function, loadProductionTokens: Function, loadSyncReport: Function }} core
 * @param {string} kit versión del kit
 */
export function revisarData(system, core, kit) {
  const tokens = core.loadProductionTokens(system) ?? {};
  const report = core.loadSyncReport(system);
  const superficies = {};
  for (const [id, surface] of Object.entries(system.produccion?.superficies ?? {})) {
    const clases = new Set();
    const dir = path.join(system.dir, 'produccion', id);
    if (fs.existsSync(dir)) {
      for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.css'))) {
        try {
          postcss.parse(fs.readFileSync(path.join(dir, file), 'utf8')).walkRules((rule) => {
            for (const [, name] of rule.selector.matchAll(/\.(-?[_a-zA-Z][\w-]*)/g)) clases.add(name);
          });
        } catch {
          // Una hoja que postcss no entiende no aporta clases; el sync ya avisa de ella.
        }
      }
    }
    superficies[id] = { tailwind: Boolean(surface.tailwind), tokens: tokens[id] ?? {}, clases: [...clases].sort() };
  }
  const piezas = core
    .loadEntries(system)
    .map((e) => ({ id: e.id, estado: e.estado, clases: [...new Set(Object.values(e.platforms).flatMap((p) => p.superficies.flatMap((s) => s.clases ?? [])))] }))
    .filter((p) => p.clases.length);
  return { version: REVISAR_VERSION, kit, sistema: { id: system.id, nombre: system.nombre }, commit: report?.commit ?? null, rama: system.produccion?.rama ?? 'main', superficies, piezas };
}

/** Archivos del repo que se pueden revisar, relativos y con «/». */
function walk(root, base = root) {
  const files = [];
  const stat = fs.statSync(base);
  if (stat.isFile()) return SOURCE.test(base) ? [path.relative(root, base).split(path.sep).join('/')] : [];
  for (const item of fs.readdirSync(base, { withFileTypes: true })) {
    if (item.name.startsWith('.') || SKIP_DIRS.has(item.name)) continue;
    const full = path.join(base, item.name);
    if (item.isDirectory()) files.push(...walk(root, full));
    else if (SOURCE.test(item.name)) files.push(path.relative(root, full).split(path.sep).join('/'));
  }
  return files;
}

const git = (repo, ...args) => execFileSync('git', ['-C', repo, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 64 * 1024 * 1024 });

/**
 * Las líneas añadidas respecto a `base` (lo commiteado en la rama, lo pendiente y los archivos nuevos sin seguimiento).
 * Devuelve Map<archivo, Set<línea>>.
 */
export function changedLines(repo, base) {
  let from;
  try {
    from = git(repo, 'merge-base', 'HEAD', base).trim();
  } catch {
    throw new Error(`no encuentro ${base} en ${repo}. Usa --base <rama> o --todo.`);
  }
  const lines = new Map();
  let file = null;
  for (const line of git(repo, 'diff', '-U0', '--no-color', '--no-ext-diff', from).split('\n')) {
    if (line.startsWith('+++ ')) {
      file = line === '+++ /dev/null' ? null : line.slice(6);
      if (file && !lines.has(file)) lines.set(file, new Set());
    } else if (file && line.startsWith('@@')) {
      const m = /\+(\d+)(?:,(\d+))?/.exec(line);
      const start = Number(m[1]);
      const count = m[2] === undefined ? 1 : Number(m[2]);
      for (let i = 0; i < count; i++) lines.get(file).add(start + i);
    }
  }
  for (const rel of git(repo, 'ls-files', '--others', '--exclude-standard').split('\n').filter(Boolean)) lines.set(rel, null);
  return new Map([...lines].filter(([rel]) => SOURCE.test(rel) && !rel.split('/').some((p) => SKIP_DIRS.has(p))));
}

/** Índices de los datos: token por valor, nombres de tokens, clases definidas, bloques documentados y pieza por clase. */
function indexes(data) {
  const byValue = new Map();
  const tokenNames = new Set();
  const defined = new Set();
  for (const surface of Object.values(data.superficies)) {
    for (const c of surface.clases) defined.add(c);
    for (const [name, value] of Object.entries(surface.tokens)) {
      tokenNames.add(name);
      for (const v of typeof value === 'string' ? [value] : Object.values(value)) {
        const key = normalizeValue(v);
        if (!key || key.includes('var(')) continue;
        if (!/^#|\(/.test(key) && !/[ ,]/.test(key)) continue; // solo colores y valores compuestos
        byValue.set(key, [...new Set([...(byValue.get(key) ?? []), name])]);
      }
    }
  }
  const pieceByClass = new Map();
  const blocks = new Set();
  for (const piece of data.piezas) {
    for (const c of piece.clases) {
      pieceByClass.set(c, piece);
      blocks.add(blockOf(c));
    }
  }
  return { byValue, tokenNames, defined, pieceByClass, blocks };
}

/** Variables que el propio repo declara (--algo: …): no son tokens del sistema, pero existen. */
function declaredVars(root, files) {
  const names = new Set();
  for (const rel of files) {
    const text = fs.readFileSync(path.join(root, rel), 'utf8');
    for (const [, name] of text.matchAll(/--([\w-]+)\s*:/g)) names.add(name);
  }
  return names;
}

/** Clases que aparecen en una línea: selectores en hojas de estilo, class/className en marcado. */
function classesIn(line, isStyle) {
  if (isStyle) {
    // Solo la parte de selector (antes de «{», o la línea entera si acaba en «,» o «{»).
    if (/^\s*[\w-]+\s*:/.test(line) && !/[{,]\s*$/.test(line)) return [];
    const selector = line.split('{')[0];
    return [...selector.matchAll(/\.(-?[_a-zA-Z][\w-]*)/g)].map((m) => m[1]);
  }
  const out = [];
  for (const [, , value] of line.matchAll(/\bclass(Name)?\s*=\s*\{?\s*["'`]([^"'`]*)["'`]/g)) out.push(...value.split(/\s+/).filter(Boolean));
  return out.filter((c) => /^-?[_a-zA-Z][\w-]*$/.test(c));
}

/**
 * Revisa el código. `targets`: Map<archivo, Set<línea> | null> (null = el archivo entero).
 * Devuelve la lista de problemas: { archivo, linea, regla, nivel, mensaje, siguiente }.
 */
export function revisar(data, root, targets, { allFiles } = {}) {
  const ix = indexes(data);
  const vars = declaredVars(root, allFiles ?? [...targets.keys()]);
  const problemas = [];
  const push = (archivo, linea, regla, nivel, mensaje, siguiente) => problemas.push({ archivo, linea, regla, nivel, mensaje, siguiente });

  for (const [rel, only] of targets) {
    const file = path.join(root, rel);
    if (!fs.existsSync(file) || TEST.test(rel)) continue;
    const isStyle = /\.(css|scss|less)$/.test(rel);
    const lines = fs.readFileSync(file, 'utf8').split('\n');
    lines.forEach((text, i) => {
      const n = i + 1;
      if ((only && !only.has(n)) || text.includes(IGNORE)) return;

      // La definición de un token del sistema (--tinta: #111) no se revisa: es su sitio.
      const declared = /^\s*--([\w-]+)\s*:/.exec(text)?.[1];
      if (declared && ix.tokenNames.has(declared)) return;

      // 1. Tokens que no existen.
      for (const [, name] of text.matchAll(/var\(\s*--([\w-]+)/g)) {
        if (ix.tokenNames.has(name) || vars.has(name) || FOREIGN_VAR.test(name)) continue;
        const near = closest(name, ix.tokenNames);
        push(rel, n, 'token-inexistente', 'error', `--${name} no es un token del sistema ni se declara en el repo.`, near ? `¿Quisiste decir var(--${near})?` : 'Usa un token del sistema (design.md → Tokens) o dilo en el PR.');
      }

      // 2. Valores sueltos: el valor entero de una declaración (sombras, pilas de fuentes) o cada color.
      // Cada declaración de la línea (puede haber varias: «color: …; box-shadow: …»).
      const covered = [];
      for (const m of text.matchAll(/([\w-]+)\s*:\s*([^;{}]+)/g)) {
        const decl = m[2].trim();
        // La definición de un token (--tinta: #111), aunque vaya en la misma línea que su selector, no se revisa.
        if (m[1].startsWith('--') && ix.tokenNames.has(m[1].slice(2))) {
          covered.push([m.index, m.index + m[0].length]);
          continue;
        }
        if (!/[ ,]/.test(decl)) continue;
        const names = ix.byValue.get(normalizeValue(decl));
        if (!names) continue;
        covered.push([m.index, m.index + m[0].length]);
        push(rel, n, 'valor-suelto', 'error', `«${decl}» es el valor de ${names.map((t) => `--${t}`).join(', ')}.`, `Usa var(--${names[0]}).`);
      }
      const seen = new Set();
      for (const m of text.matchAll(COLOR)) {
        const literal = m[0];
        const key = normalizeValue(literal);
        if (seen.has(key) || covered.some(([a, b]) => m.index >= a && m.index < b)) continue;
        seen.add(key);
        const names = ix.byValue.get(key);
        if (names) push(rel, n, 'valor-suelto', 'error', `${literal} es el valor de ${names.map((t) => `--${t}`).join(', ')}.`, `Usa var(--${names[0]}).`);
        else if (ix.byValue.size) push(rel, n, 'color-fuera-de-paleta', 'aviso', `${literal} no es ningún token del sistema.`, 'Usa un token de color o, si hace falta uno nuevo, propónlo al sistema.');
      }

      // 3. Clases de piezas documentadas.
      for (const name of classesIn(text, isStyle)) {
        const piece = ix.pieceByClass.get(name);
        if (piece?.estado === 'obsoleto') {
          push(rel, n, 'pieza-obsoleta', 'error', `.${name} es de ${piece.id}, que está obsoleta.`, `Mira en la ficha de ${piece.id} qué la sustituye.`);
          continue;
        }
        if (piece && piece.estado !== 'produccion') {
          push(rel, n, 'pieza-no-en-produccion', 'aviso', `.${name} es de ${piece.id}, en estado «${piece.estado}»: aún no existe en producción.`, 'Úsala solo si te lo han pedido; si no, usa una pieza «En producción».');
          continue;
        }
        if (!piece && ix.blocks.has(blockOf(name)) && !ix.defined.has(name)) {
          const near = closest(name, [...ix.defined].filter((c) => blockOf(c) === blockOf(name)));
          push(rel, n, 'clase-inventada', 'error', `.${name} no existe en producción: es una variante fuera del sistema.`, near ? `¿Quisiste decir .${near}? Si hace falta una variante nueva, propónla como ficha.` : 'Si hace falta una variante nueva, propónla como ficha del sistema.');
        }
      }
    });
  }
  return problemas;
}

/** Los archivos que se revisan y, con --todo o rutas, todas sus líneas. */
export function targetsFor(root, { paths = [], todo = false, base }) {
  if (paths.length) return new Map(paths.flatMap((p) => walk(root, path.resolve(root, p))).map((rel) => [rel, null]));
  if (todo) return new Map(walk(root).map((rel) => [rel, null]));
  return changedLines(root, base);
}

export const sourceFiles = (root) => walk(root);
