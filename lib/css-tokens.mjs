// Tokens de una hoja de estilo: propiedades personalizadas de :root y de cada modo (claro, oscuro…) y variables de
// @theme (Tailwind 4). Lo usan el sync, con el CSS de producción, y la interfaz, con el CSS de experimental/.
import postcss from 'postcss';
import { resolveVars, tokenValue } from './tokens.mjs';

// Selectores de modo: [data-theme="dark"] (también data-mode, data-color-scheme, data-scheme), .dark y .light,
// solos o sobre :root, html o body.
const MODE_SELECTOR = /^(?::root|html|body)?(?:\[data-(?:theme|mode|color-scheme|scheme)\s*=\s*(["']?)([\w-]+)\1\s*\]|\.(dark|light))$/;

/**
 * Modo de la @media (prefers-color-scheme: …) que envuelve la regla, '' si no hay ninguna, o null si la regla
 * no cuenta: anidada en otra regla o bajo otra condición (@media de ancho, @container), porque entonces no es
 * el valor del token. @layer y @supports no cambian nada.
 */
function mediaMode(rule) {
  let mode = '';
  for (let node = rule.parent; node && node.type !== 'root'; node = node.parent) {
    if (node.type === 'rule') return null;
    if (node.type !== 'atrule' || node.name === 'layer' || node.name === 'supports') continue;
    const scheme = node.name === 'media' && /^\(\s*prefers-color-scheme\s*:\s*([\w-]+)\s*\)$/.exec(node.params.trim());
    if (!scheme) return null;
    mode = scheme[1];
  }
  return mode;
}

/**
 * Modo que declara un selector de una regla de tokens ('' = :root, el modo base), o null si no es de tokens.
 * `media` es el modo de la @media que envuelve la regla.
 */
function selectorMode(selector, media) {
  const plain = selector.trim().replace(/:not\([^)]*\)/g, '');
  if (plain === ':root') return { mode: media, modeClass: null };
  const match = MODE_SELECTOR.exec(plain);
  return match ? { mode: match[2] ?? match[3], modeClass: match[3] ?? null } : null;
}

/** Propiedades personalizadas de :root ('' = modo base) y de cada modo, con los selectores que lo activan. */
export function readModeTokens(root, found) {
  root.walkRules((rule) => {
    const media = mediaMode(rule);
    if (media === null) return;
    for (const selector of rule.selectors) {
      const declared = selectorMode(selector, media);
      if (!declared) continue;
      if (declared.modeClass) found.modeClasses.add(declared.modeClass);
      const mode = declared.mode;
      if (!found.modes.has(mode)) found.modes.set(mode, { valores: {}, selectores: new Set() });
      const target = found.modes.get(mode);
      target.selectores.add(media ? `@media (prefers-color-scheme: ${media}) ${selector.trim()}` : selector.trim());
      rule.each((node) => {
        if (node.type === 'decl' && node.prop.startsWith('--')) target.valores[node.prop.slice(2)] = node.value;
      });
    }
  });
}

/** Variables de @theme y @theme inline (Tailwind 4): radios, sombras, fuentes, tamaños de texto… */
export function readThemeTokens(root, theme) {
  root.walkAtRules('theme', (at) => at.each((node) => {
    if (node.type === 'decl' && node.prop.startsWith('--') && !node.prop.includes('*')) theme[node.prop.slice(2)] = node.value;
  }));
}

/**
 * Junta los tokens de una superficie. El modo base (:root) se llama «light» si hay modo oscuro, «dark» si solo
 * hay claro y «base» en otro caso. Un token vale un texto si es igual en todos los modos (un modo hereda el
 * valor base que no redefine) y { modo: valor } si cambia. Las variables de @theme que :root no tiene se añaden
 * con sus var() resueltas en cada modo.
 * @param {{ modes: Map<string, { valores: Record<string, string>, selectores: Set<string> }>, theme: Record<string, string> }} found
 * @returns {{ values: Record<string, import('./tokens.mjs').TokenValue>, info: { modos: Record<string, string[]>, theme: Record<string, string> } }}
 */
export function buildTokens({ modes, theme }) {
  const named = [...modes.keys()].filter(Boolean);
  const base = named.includes('dark') ? 'light' : named.includes('light') ? 'dark' : 'base';
  const byMode = new Map();
  const selectors = new Map();
  for (const [mode, { valores, selectores }] of modes) {
    const id = mode || base;
    byMode.set(id, { ...byMode.get(id), ...valores });
    selectors.set(id, [...(selectors.get(id) ?? []), ...selectores]);
  }
  const order = [base, ...byMode.keys()].filter((m, i, all) => byMode.has(m) && all.indexOf(m) === i);
  const collapse = (perMode) => {
    const list = Object.values(perMode);
    return list.length === order.length && list.every((v) => v === list[0]) ? list[0] : perMode;
  };

  const values = {};
  for (const name of new Set(order.flatMap((m) => Object.keys(byMode.get(m))))) {
    const perMode = {};
    for (const mode of order) {
      const value = byMode.get(mode)[name] ?? byMode.get(base)?.[name];
      if (value !== undefined) perMode[mode] = value;
    }
    values[name] = collapse(perMode);
  }

  const lookup = (name, mode) => tokenValue(values[name], mode) ?? theme[name];
  const themeUsed = {};
  for (const [name, raw] of Object.entries(theme)) {
    if (name in values) continue;
    themeUsed[name] = raw;
    values[name] = order.length < 2 ? resolveVars(raw, lookup, order[0]) : collapse(Object.fromEntries(order.map((mode) => [mode, resolveVars(raw, lookup, mode)])));
  }
  return { values, info: { modos: Object.fromEntries(order.map((m) => [m, selectors.get(m)])), theme: themeUsed } };
}

/**
 * Tokens de varias hojas, juntas como una superficie: `{ values, info }` como en tokens.produccion.json y en el
 * informe del sync. Una hoja que no se puede leer se salta.
 * @param {string[]} sheets
 */
export function cssTokens(sheets) {
  const found = { modes: new Map(), theme: {}, modeClasses: new Set() };
  for (const css of sheets) {
    let root;
    try {
      root = postcss.parse(css);
    } catch {
      continue;
    }
    readModeTokens(root, found);
    readThemeTokens(root, found.theme);
  }
  return buildTokens(found);
}

/**
 * Cambia en su sitio el valor de los tokens de una hoja: `ajustes` por modo y nombre, con el modo base con su
 * nombre de buildTokens (`baseMode`, el que se llama «light», «dark» o «base»). Devuelve la hoja y los ajustes
 * que no encontró declarados en ese modo (un modo que hereda el valor de :root).
 * @param {string} css
 * @param {Record<string, Record<string, string>>} ajustes
 * @param {string} baseMode
 */
export function setTokenValues(css, ajustes, baseMode) {
  const root = postcss.parse(css);
  /** @type {Record<string, Record<string, string>>} */
  const pending = structuredClone(ajustes);
  // La primera regla de cada modo fuera de @media: ahí se declara lo que ese modo heredaba de :root.
  const home = new Map();
  root.walkRules((rule) => {
    const media = mediaMode(rule);
    if (media === null) return;
    const modes = rule.selectors.map((s) => selectorMode(s, media)).filter((m) => m !== null).map((m) => m.mode || baseMode);
    if (!media && modes.length && modes.every((m) => m === modes[0]) && !home.has(modes[0])) home.set(modes[0], rule);
    rule.each((node) => {
      if (node.type !== 'decl' || !node.prop.startsWith('--')) return;
      const name = node.prop.slice(2);
      for (const mode of modes) {
        if (ajustes[mode]?.[name] === undefined) continue;
        node.value = ajustes[mode][name];
        delete pending[mode]?.[name];
      }
    });
  });
  for (const [mode, values] of Object.entries(pending)) {
    const rule = home.get(mode);
    if (rule) for (const [name, value] of Object.entries(values)) {
      rule.append({ prop: `--${name}`, value });
      delete values[name];
    }
    if (!Object.keys(values).length) delete pending[mode];
  }
  return { css: root.toString(), pending };
}
