// Hallazgos en el código de producción: lo que producción podría hacer mejor con su propio sistema. Los calcula
// el sync (van a sync-report.json → hallazgos) y la skill recomendar-produccion los convierte en recomendaciones.
// Solo lee: nunca cambia producción.
//
//   valoresSueltos   un color o un valor compuesto (sombra, pila de fuentes, curva) escrito a mano que ya es un token
//   copiasDeTokens   una propiedad personalizada fuera de :root y de los modos que repite el valor de un token
//   tokensSinUso     tokens que nada referencia (ni el CSS ni el código)
//   hojasSinCargar   hojas del repo que ninguna superficie carga y que nada importa, o que solo importan los tests
import fs from 'node:fs';
import path from 'node:path';
import postcss from 'postcss';
import { isTokenRule } from './css-tokens.mjs';

const SOURCE = /\.(css|html|tsx?|jsx?|mjs|cjs|vue|svelte|astro|mdx?)$/;
const TEST = /(\.(test|spec|stories)\.|(^|\/)(__tests__|tests?|e2e|__mocks__)\/)/;
const SKIP_DIRS = new Set(['node_modules', 'dist', 'build', 'out', 'coverage', 'public', 'vendor']);
const COLOR = /#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})(?![\w-])|\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\([^()]*\)/g;

/** Normaliza un valor para compararlo: minúsculas, espacios simples y hexadecimales largos (#abc → #aabbcc). */
function normalize(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/\s*([(),/])\s*/g, '$1')
    .replace(/#([0-9a-f]{3,4})(?![\w-])/g, (_, h) => '#' + [...h].map((c) => c + c).join(''));
}

/** Un valor que vale la pena buscar: un color o un valor compuesto (con espacios o comas), sin var(). */
function distinctive(value) {
  const v = normalize(value);
  if (!v || v.includes('var(')) return false;
  return new RegExp(`^(?:${COLOR.source})$`).test(v) || /[ ,]/.test(v);
}

/** Archivos del repo que cumplen `test`, relativos y con «/», sin node_modules, carpetas ocultas ni compilados. */
function walk(root, test) {
  const files = [];
  const visit = (dir) => {
    for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
      if (item.name.startsWith('.')) continue;
      const full = path.join(dir, item.name);
      if (item.isDirectory()) {
        if (!SKIP_DIRS.has(item.name)) visit(full);
      } else if (test.test(item.name)) files.push(path.relative(root, full).split(path.sep).join('/'));
    }
  };
  visit(root);
  return files.sort();
}

/** La hoja y sus @import locales, cada una por separado para que la línea de cada hallazgo sea la suya. */
function localSheets(src, rel, seen = new Set()) {
  const file = path.join(src, rel);
  if (seen.has(rel) || !fs.existsSync(file)) return [];
  seen.add(rel);
  let root;
  try {
    root = postcss.parse(fs.readFileSync(file, 'utf8'), { from: file });
  } catch {
    return [];
  }
  const sheets = [{ rel, root }];
  root.walkAtRules('import', (at) => {
    const spec = /^["']([^"']+)["']/.exec(at.params.trim())?.[1];
    if (spec?.startsWith('.')) sheets.push(...localSheets(src, path.posix.join(path.posix.dirname(rel), spec), seen));
  });
  return sheets;
}

/** Valor normalizado → tokens que lo tienen: «nombre», o «nombre (modo)» si solo lo vale en ese modo. */
function tokenIndex(values) {
  const index = new Map();
  for (const [name, value] of Object.entries(values)) {
    const perMode = typeof value === 'string' ? [[null, value]] : Object.entries(value);
    for (const [mode, v] of perMode) {
      if (!distinctive(v)) continue;
      const key = normalize(v);
      index.set(key, [...new Set([...(index.get(key) ?? []), mode ? `${name} (${mode})` : name])]);
    }
  }
  return index;
}

/** Selector de la regla, con la @media o @supports que la envuelve. */
function where(node) {
  const rule = node.parent;
  const context = rule?.parent?.type === 'atrule' ? `@${rule.parent.name} ${rule.parent.params} ` : '';
  return context + (rule?.selector ?? `@${rule?.name} ${rule?.params}`).replace(/\s+/g, ' ');
}

/** ¿Importa `spec`, escrito en `from`, la hoja `sheet`? Relativo, desde la raíz o con un alias (@/, ~/). */
function importsSheet(spec, from, sheet) {
  const clean = spec.split(/[?#]/)[0];
  if (clean.startsWith('.')) return path.posix.normalize(path.posix.join(path.posix.dirname(from), clean)) === sheet;
  if (clean.startsWith('/')) return sheet === clean.slice(1) || sheet.endsWith(clean);
  const rest = clean.replace(/^(@|~|@src|src)\//, '');
  return rest !== clean && (sheet === rest || sheet.endsWith('/' + rest));
}

/**
 * @param {string} src carpeta con el código de producción (la exportación de origin/<rama> o la copia local)
 * @param {Record<string, { estilos: string[], tailwind?: string }>} superficies de system.json
 * @param {Record<string, Record<string, import('./tokens.mjs').TokenValue>>} tokens por superficie, de tokens.produccion.json
 * @param {Record<string, { theme: Record<string, string> }>} tokenInfo por superficie, del informe del sync
 */
export function findHallazgos(src, superficies, tokens, tokenInfo) {
  const sources = walk(src, SOURCE);
  const texts = new Map(sources.map((rel) => [rel, fs.readFileSync(path.join(src, rel), 'utf8')]));
  const loaded = new Set();
  const result = { superficies: {}, hojasSinCargar: [] };

  for (const [surfaceId, surface] of Object.entries(superficies)) {
    const sheets = surface.estilos.flatMap((rel) => localSheets(src, rel));
    for (const { rel } of sheets) loaded.add(rel);
    const values = tokens[surfaceId] ?? {};
    const index = tokenIndex(values);
    const valoresSueltos = [];
    const copiasDeTokens = [];

    for (const { rel, root } of sheets) {
      root.walkDecls((decl) => {
        const line = decl.source?.start?.line ?? null;
        const parentRule = decl.parent?.type === 'rule' ? decl.parent : null;
        const inTokens = parentRule ? isTokenRule(parentRule) : decl.parent?.type === 'atrule' && decl.parent.name === 'theme';
        if (decl.prop.startsWith('--')) {
          const name = decl.prop.slice(2);
          if (inTokens || !distinctive(decl.value)) return;
          const same = (index.get(normalize(decl.value)) ?? []).filter((t) => t.replace(/ \(.*\)$/, '') !== name);
          if (same.length) copiasDeTokens.push({ archivo: rel, linea: line, selector: where(decl), nombre: name, valor: decl.value, tokens: same });
          return;
        }
        if (inTokens) return;
        const found = new Map();
        const whole = index.get(normalize(decl.value));
        if (whole && /[ ,]/.test(normalize(decl.value))) found.set(decl.value.trim(), whole);
        for (const [literal] of decl.value.matchAll(COLOR)) {
          const names = index.get(normalize(literal));
          if (names) found.set(literal, names);
        }
        for (const [valor, names] of found) valoresSueltos.push({ archivo: rel, linea: line, selector: where(decl), propiedad: decl.prop, valor, tokens: names });
      });
    }

    // Un token sin uso: fuera de los tests, nadie escribe --nombre salvo para declararlo (--nombre:). Las variables
    // de @theme de Tailwind se usan como utilidades (bg-primary), así que no se cuentan.
    const theme = tokenInfo[surfaceId]?.theme ?? {};
    const tokensSinUso = Object.keys(values).filter((name) => {
      if (name in theme) return false;
      const pattern = new RegExp(`--${name.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}(?![\\w-])(?!\\s*:)`);
      return ![...texts].some(([rel, text]) => !TEST.test(rel) && pattern.test(text));
    });

    result.superficies[surfaceId] = { valoresSueltos, copiasDeTokens, tokensSinUso };
  }

  // Hojas que ninguna superficie carga: si nadie las importa, o solo los tests, probablemente sobran.
  const specs = [...texts].map(([rel, text]) => [rel, [...text.matchAll(/["'(]([^"'()\s]+\.css(?:\?[^"'()\s]*)?)["')]/g)].map((m) => m[1])]);
  for (const sheet of sources.filter((rel) => rel.endsWith('.css') && !loaded.has(rel))) {
    const referencias = specs.filter(([rel, list]) => rel !== sheet && list.some((spec) => importsSheet(spec, rel, sheet))).map(([rel]) => rel);
    if (referencias.some((rel) => !TEST.test(rel))) continue;
    result.hojasSinCargar.push({ archivo: sheet, referencias, motivo: referencias.length ? 'Solo la importan los tests.' : 'Nada la importa.' });
  }
  return result;
}
