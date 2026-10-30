// Lab de primitivos: preset, tokens derivados y contraste. Sin dependencias ni APIs de Node: lo usan la página
// /<sistema>/lab en el navegador y `ds preset` en la terminal, así que los dos calculan exactamente lo mismo.
//
// Un preset tiene dos formas:
//   generar  colores (neutro, marca, error), texto, espaciado, radios y sombras, de los que salen los tokens con
//            los nombres de shadcn (--background, --primary, --radius…) en claro y oscuro.
//   ajustar  cambios sobre los tokens que ya tiene el sistema (de producción o de experimental/), por modo.
// En los dos, `ajustes` guarda los valores cambiados a mano, por modo y por nombre de token.
import { resolveVars, tokenValue } from './tokens.mjs';

/** @typedef {{ l: number, c: number, h: number, alpha: number }} Oklch */
/** @typedef {Record<string, Record<string, string>>} Ajustes */
/**
 * @typedef {{
 *   v: 1, modo: 'generar' | 'ajustar', base: string | null,
 *   color: { neutro: string, marca: string, error: string },
 *   texto: { sans: string, serif: string, mono: string, base: number, escala: number, interlineado: number },
 *   espaciado: number, radio: number, sombra: { opacidad: number, difuminado: number },
 *   ajustes: Ajustes,
 * }} Preset
 */

export const PRESET_VERSION = 1;

/** @type {Preset} */
export const DEFAULT_PRESET = {
  v: 1,
  modo: 'generar',
  base: null,
  color: { neutro: '#71717a', marca: '#2563eb', error: '#dc2626' },
  texto: { sans: 'ui-sans-serif, system-ui, sans-serif', serif: '', mono: 'ui-monospace, SFMono-Regular, Menlo, monospace', base: 16, escala: 1.25, interlineado: 1.5 },
  espaciado: 4,
  radio: 10,
  sombra: { opacidad: 0.1, difuminado: 1 },
  ajustes: {},
};

/** Proporciones de la escala tipográfica, con su nombre musical. */
export const ESCALAS = { '1.125': 'Segunda mayor', '1.2': 'Tercera menor', '1.25': 'Tercera mayor', '1.333': 'Cuarta justa', '1.5': 'Quinta justa' };

/** Pasos de la escala de texto (nombres de Tailwind) y su exponente sobre el tamaño base. */
export const TEXT_STEPS = { xs: -2, sm: -1, base: 0, lg: 1, xl: 2, '2xl': 3, '3xl': 4, '4xl': 5 };

/** Pasos del espaciado que enseña el Lab, en múltiplos de --spacing (como p-1, p-2… de Tailwind). */
export const SPACING_STEPS = [1, 2, 3, 4, 6, 8, 12, 16];

/** Grupos que `ds preset aplicar --solo` puede aplicar por separado. */
export const GRUPOS = ['color', 'texto', 'espaciado', 'radios', 'sombras'];

// Rangos de los controles del Lab. Un preset fuera de rango se recorta.
const LIMITES = { 'texto.base': [12, 22], 'texto.escala': [1.05, 1.618], 'texto.interlineado': [1, 2], espaciado: [2, 8], radio: [0, 24], 'sombra.opacidad': [0, 0.4], 'sombra.difuminado': [0.25, 3] };

// ─── Color ──────────────────────────────────────────────────────────────────

const clamp = (x, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, x));
const fixed = (x, digits = 3) => String(Number(x.toFixed(digits)));

const toLinear = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const fromLinear = (c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);

// OKLab de Björn Ottosson (https://bottosson.github.io/posts/oklab/), el espacio de oklch() en CSS.
function rgbToOklch([r, g, b], alpha = 1) {
  const [lr, lg, lb] = [r, g, b].map(toLinear);
  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  const c = Math.hypot(A, B);
  return { l: L, c, h: c < 1e-4 ? 0 : (Math.atan2(B, A) * 180 / Math.PI + 360) % 360, alpha };
}

/** sRGB (0–1) de un color oklch, recortado a la gama como hacen los navegadores. @param {Oklch} color */
function oklchToRgb({ l, c, h }) {
  const A = c * Math.cos(h * Math.PI / 180);
  const B = c * Math.sin(h * Math.PI / 180);
  const lc = (l + 0.3963377774 * A + 0.2158037573 * B) ** 3;
  const mc = (l - 0.1055613458 * A - 0.0638541728 * B) ** 3;
  const sc = (l - 0.0894841775 * A - 1.291485548 * B) ** 3;
  return [
    4.0767416621 * lc - 3.3077115913 * mc + 0.2309699292 * sc,
    -1.2684380046 * lc + 2.6097574011 * mc - 0.3413193965 * sc,
    -0.0041960863 * lc - 0.7034186147 * mc + 1.707614701 * sc,
  ].map((x) => clamp(fromLinear(x)));
}

const NAMED = { white: '#ffffff', black: '#000000' };
const num = (text, scale = 1) => (text.endsWith('%') ? (parseFloat(text) / 100) * scale : parseFloat(text));

/**
 * Lee un color de CSS: hex, rgb(), hsl(), oklch(), white o black. Lo demás (var(), color-mix(), nombres) da null:
 * el Lab no calcula el contraste de lo que no puede leer.
 * @param {string | undefined | null} text
 * @returns {Oklch | null}
 */
export function parseColor(text) {
  if (!text) return null;
  const value = String(text).trim().toLowerCase();
  if (value === 'transparent') return { l: 0, c: 0, h: 0, alpha: 0 };
  const hex = /^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/.exec(NAMED[value] ?? value);
  if (hex) {
    const digits = hex[1].length <= 4 ? [...hex[1]].map((d) => d + d) : hex[1].match(/../g);
    const [r, g, b, a = 'ff'] = digits;
    return rgbToOklch([r, g, b].map((d) => parseInt(d, 16) / 255), parseInt(a, 16) / 255);
  }
  // Los temas de shadcn anteriores a Tailwind 4 guardan el HSL sin hsl(): `--primary: 222 47% 11%`.
  const bare = /^-?[\d.]+(?:deg)?\s+[\d.]+%\s+[\d.]+%$/.test(value) ? `hsl(${value})` : value;
  const fn = /^(rgba?|hsla?|oklch)\(\s*([^()]*)\)$/.exec(bare);
  if (!fn) return null;
  const [main, alphaText] = fn[2].split('/').map((p) => p.trim());
  const parts = main.split(/[\s,]+/).filter(Boolean);
  if (parts.length < 3 || parts.length > 4) return null;
  const alpha = clamp(alphaText !== undefined ? num(alphaText) : parts[3] !== undefined ? num(parts[3]) : 1);
  if (fn[1] === 'oklch') {
    const [l, c, h] = parts.map((p) => (p === 'none' ? '0' : p));
    const color = { l: clamp(num(l)), c: Math.max(0, num(c, 0.4)), h: parseFloat(h) || 0, alpha };
    return Number.isFinite(color.l + color.c + color.h) ? color : null;
  }
  if (fn[1].startsWith('rgb')) {
    const rgb = parts.slice(0, 3).map((p) => clamp(num(p, 255) / 255));
    return rgb.every(Number.isFinite) ? rgbToOklch(rgb, alpha) : null;
  }
  const h = parseFloat(parts[0]);
  const s = clamp(num(parts[1]));
  const l = clamp(num(parts[2]));
  if (![h, s, l].every(Number.isFinite)) return null;
  const k = (n) => (n + h / 30) % 12;
  const f = (n) => l - s * Math.min(l, 1 - l) * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
  return rgbToOklch([f(0), f(8), f(4)], alpha);
}

/** oklch(L C H) con tres decimales, como los temas de shadcn. @param {Oklch} color */
export function formatColor({ l, c, h, alpha = 1 }) {
  const body = c < 5e-4 ? `${fixed(l)} 0 0` : `${fixed(l)} ${fixed(c)} ${fixed(h)}`;
  return alpha < 1 ? `oklch(${body} / ${fixed(alpha, 2)})` : `oklch(${body})`;
}

/** #rrggbb de un color (para los selectores de color del navegador). @param {string} text */
export function toHex(text) {
  const color = parseColor(text);
  if (!color) return null;
  return '#' + oklchToRgb(color).map((x) => Math.round(x * 255).toString(16).padStart(2, '0')).join('');
}

/** Luminancia relativa de WCAG 2. @param {Oklch} color */
function luminance(color) {
  const [r, g, b] = oklchToRgb(color).map(toLinear);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Un color semitransparente sobre su fondo, mezclado en sRGB como lo pinta el navegador. */
function over(fg, bg) {
  if (fg.alpha >= 1) return fg;
  const top = oklchToRgb(fg);
  const bottom = oklchToRgb(bg);
  return rgbToOklch(top.map((x, i) => x * fg.alpha + bottom[i] * (1 - fg.alpha)));
}

/**
 * Ratio de contraste WCAG 2 entre un texto y su fondo (de 1 a 21), o null si alguno no se puede leer.
 * @param {string} fgText
 * @param {string} bgText
 */
export function contrast(fgText, bgText) {
  const fg = parseColor(fgText);
  const bg = parseColor(bgText);
  if (!fg || !bg || bg.alpha < 1) return null;
  return ratio(over(fg, bg), bg);
}

function ratio(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/**
 * El color más cercano a `text` (misma tonalidad y croma, otra luminosidad) que llega a `min` sobre `against`.
 * Oscurece sobre fondos claros y aclara sobre oscuros. null si ni el extremo llega.
 * @param {string} text
 * @param {string} against
 * @param {number} min
 */
export function nearestPassing(text, against, min) {
  const color = parseColor(text);
  const bg = parseColor(against);
  if (!color || !bg) return null;
  const solid = { ...color, alpha: 1 };
  if (ratio(solid, bg) >= min) return formatColor(solid);
  const target = ratio({ ...solid, l: 0 }, bg) >= ratio({ ...solid, l: 1 }, bg) ? 0 : 1;
  if (ratio({ ...solid, l: target }, bg) < min) return null;
  let [fails, passes] = [solid.l, target];
  for (let i = 0; i < 24; i++) {
    const mid = (fails + passes) / 2;
    if (ratio({ ...solid, l: mid }, bg) >= min) passes = mid;
    else fails = mid;
  }
  // Se redondea hacia el lado que cumple: el valor escrito (tres decimales) también tiene que llegar.
  const l = target === 0 ? Math.floor(passes * 1000) / 1000 : Math.ceil(passes * 1000) / 1000;
  return formatColor({ ...solid, l });
}

// ─── Pares y comprobación ───────────────────────────────────────────────────

/**
 * Pares de texto y fondo de una lista de tokens: cada `x-foreground` con su `x`, `foreground` con `background`,
 * `muted-foreground` también sobre `background` (es el texto secundario de la página) y `ring` sobre
 * `background` a 3:1, porque el foco tiene que verse (WCAG 1.4.11).
 * @param {string[]} names
 * @returns {{ texto: string, fondo: string, minimo: number }[]}
 */
export function findPairs(names) {
  const has = new Set(names);
  const pairs = [];
  if (has.has('foreground') && has.has('background')) pairs.push({ texto: 'foreground', fondo: 'background', minimo: 4.5 });
  for (const name of names) {
    if (!name.endsWith('-foreground')) continue;
    const base = name.slice(0, -'-foreground'.length);
    if (has.has(base)) pairs.push({ texto: name, fondo: base, minimo: 4.5 });
  }
  if (has.has('muted-foreground') && has.has('background')) pairs.push({ texto: 'muted-foreground', fondo: 'background', minimo: 4.5 });
  if (has.has('ring') && has.has('background')) pairs.push({ texto: 'ring', fondo: 'background', minimo: 3 });
  return pairs;
}

/**
 * Contraste de cada par en cada modo. Los valores pueden llevar var(): se resuelven contra los demás tokens.
 * Un par que no llega trae `sugerencia`: el token que conviene cambiar (el texto o, si no basta, el fondo) y su
 * valor más cercano que cumple.
 * @param {Record<string, Record<string, string>>} byMode valores por modo y por token
 */
export function checkContrast(byMode) {
  const results = [];
  for (const [mode, values] of Object.entries(byMode)) {
    const resolve = (name) => {
      const raw = values[name];
      return raw === undefined ? undefined : resolveVars(raw, (other) => values[other], undefined, new Set([name]));
    };
    for (const pair of findPairs(Object.keys(values))) {
      const fg = resolve(pair.texto);
      const bg = resolve(pair.fondo);
      const value = fg && bg ? contrast(fg, bg) : null;
      const ok = value === null ? null : value >= pair.minimo - 1e-9;
      let sugerencia = null;
      if (ok === false) {
        const fix = nearestPassing(fg, bg, pair.minimo);
        const bgFix = fix ? null : nearestPassing(bg, fg, pair.minimo);
        sugerencia = fix ? { token: pair.texto, valor: fix } : bgFix ? { token: pair.fondo, valor: bgFix } : null;
      }
      results.push({ modo: mode, ...pair, ratio: value === null ? null : Number(value.toFixed(2)), ok, sugerencia });
    }
  }
  return results;
}

// ─── Tokens derivados ───────────────────────────────────────────────────────

// Luminosidad de la escala neutra (la de Tailwind 4) y cuánto del croma del neutro lleva cada paso: el tinte se
// nota en los medios y casi nada en los extremos.
const NEUTRAL = { 50: 0.985, 100: 0.97, 200: 0.922, 300: 0.87, 400: 0.708, 500: 0.556, 600: 0.439, 700: 0.371, 800: 0.269, 900: 0.205, 950: 0.145 };
const TINT = { 50: 0.1, 100: 0.15, 200: 0.3, 300: 0.45, 400: 0.85, 500: 1, 600: 1, 700: 0.8, 800: 0.45, 900: 0.4, 950: 0.35 };
/** Croma máximo del neutro: tiñe los grises, nunca los convierte en un color. */
const MAX_TINT = 0.05;

/** Escala neutra 50–950 teñida con el tono del neutro. @param {string} neutro */
export function neutralScale(neutro) {
  const base = parseColor(neutro) ?? /** @type {Oklch} */ (parseColor(DEFAULT_PRESET.color.neutro));
  const chroma = Math.min(base.c, MAX_TINT);
  return Object.fromEntries(Object.entries(NEUTRAL).map(([step, l]) => [step, formatColor({ l, c: chroma * TINT[step], h: base.h, alpha: 1 })]));
}

// Rol de cada token en claro y oscuro: un paso de la escala neutra, «blanco», un color del preset o «sobre:x»,
// el texto (el neutro más claro o el más oscuro) que más contraste da sobre x.
const ROLES = {
  background: ['blanco', 950],
  foreground: [950, 50],
  card: ['blanco', 900],
  'card-foreground': [950, 50],
  popover: ['blanco', 900],
  'popover-foreground': [950, 50],
  primary: ['marca', 'marca'],
  'primary-foreground': ['sobre:primary', 'sobre:primary'],
  secondary: [100, 800],
  'secondary-foreground': [900, 50],
  muted: [100, 800],
  'muted-foreground': [600, 400],
  accent: [100, 800],
  'accent-foreground': [900, 50],
  destructive: ['error', 'error'],
  'destructive-foreground': ['sobre:destructive', 'sobre:destructive'],
  border: [200, 800],
  input: [200, 800],
  ring: ['marca', 'marca'],
};
export const COLOR_TOKENS = Object.keys(ROLES);
export const MODOS = ['light', 'dark'];

/**
 * Un color de marca en un modo: tal cual en claro y, en oscuro, aclarado lo justo para que se vea sobre el fondo
 * (3:1). Así una marca muy oscura no desaparece en modo oscuro.
 */
function brandIn(mode, color, background) {
  if (mode === 'light') return color;
  return contrast(color, background) >= 3 ? color : nearestPassing(color, background, 3) ?? color;
}

const rem = (px) => `${fixed(px / 16, 4)}rem`;
const px = (x) => `${fixed(x, 2)}px`;

/**
 * Tokens de un preset «generar»: colores por modo (con los ajustes a mano encima) y lo común a todos los modos
 * (fuentes, escala de texto, espaciado, radios y sombras).
 * @param {Preset} preset
 */
export function deriveTokens(preset) {
  const neutral = neutralScale(preset.color.neutro);
  /** @type {Record<string, Record<string, string>>} */
  const modos = {};
  MODOS.forEach((mode, index) => {
    /** @type {Record<string, string>} */
    const values = {};
    const background = index === 0 ? formatColor({ l: 1, c: 0, h: 0, alpha: 1 }) : neutral[950];
    const pick = (spec) => {
      if (typeof spec === 'number') return neutral[spec];
      if (spec === 'blanco') return formatColor({ l: 1, c: 0, h: 0, alpha: 1 });
      if (spec === 'marca') return brandIn(mode, preset.color.marca, background);
      if (spec === 'error') return brandIn(mode, preset.color.error, background);
      const on = values[spec.slice('sobre:'.length)];
      return contrast(neutral[50], on) >= contrast(neutral[950], on) ? neutral[50] : neutral[950];
    };
    for (const [name, roles] of Object.entries(ROLES)) values[name] = preset.ajustes[mode]?.[name] ?? pick(roles[index]);
    modos[mode] = values;
  });

  const { texto, sombra } = preset;
  /** @type {Record<string, string>} */
  const comunes = { 'font-sans': texto.sans };
  if (texto.serif) comunes['font-serif'] = texto.serif;
  comunes['font-mono'] = texto.mono;
  for (const [step, exp] of Object.entries(TEXT_STEPS)) comunes[`text-${step}`] = rem(texto.base * texto.escala ** exp);
  comunes['leading-tight'] = '1.2';
  comunes['leading-normal'] = fixed(texto.interlineado, 2);
  comunes.spacing = rem(preset.espaciado);
  comunes.radius = rem(preset.radio);
  // La escala de radios de shadcn: proporcional a --radius.
  comunes['radius-sm'] = 'calc(var(--radius) * 0.6)';
  comunes['radius-md'] = 'calc(var(--radius) * 0.8)';
  comunes['radius-lg'] = 'var(--radius)';
  comunes['radius-xl'] = 'calc(var(--radius) * 1.4)';
  const shade = `rgb(0 0 0 / ${fixed(sombra.opacidad, 3)})`;
  const blur = (x) => px(x * sombra.difuminado);
  comunes['shadow-sm'] = `0 1px ${blur(2)} 0 ${shade}`;
  comunes['shadow-md'] = `0 4px ${blur(6)} -1px ${shade}, 0 2px ${blur(4)} -2px ${shade}`;
  comunes['shadow-lg'] = `0 10px ${blur(15)} -3px ${shade}, 0 4px ${blur(6)} -4px ${shade}`;
  return { modos, comunes, neutral };
}

// ─── Preset: validar, codificar y leer ──────────────────────────────────────

// Lo que viene en la URL no es de fiar: los valores acaban en CSS. Nada que cargue recursos (url(), image(),
// @import) ni que cierre la declaración o la regla.
const UNSAFE = /[;{}<>\\]|\/\*|url\(|image\(|image-set\(|@|expression\(/i;
const TOKEN_NAME = /^[a-z0-9][a-z0-9-]{0,63}$/i;
const MODE_NAME = /^[a-z0-9][\w-]{0,31}$/i;
const FONT = /^[\p{L}\p{N}\s"',._-]{1,200}$/u;

/** Un valor de token que se puede escribir en CSS sin riesgo. @param {unknown} value */
export const isSafeValue = (value) => typeof value === 'string' && value.trim().length > 0 && value.length <= 200 && !UNSAFE.test(value);
/** Un nombre de token válido, sin `--`. @param {unknown} name */
export const isTokenName = (name) => typeof name === 'string' && TOKEN_NAME.test(name);

/**
 * Completa y valida un preset que viene de fuera (URL, terminal, CSS). Lo que no vale se sustituye por el valor
 * por defecto y se avisa.
 * @param {any} raw
 * @returns {{ preset: Preset, avisos: string[] }}
 */
export function normalizePreset(raw) {
  const avisos = [];
  const d = DEFAULT_PRESET;
  const src = raw && typeof raw === 'object' ? raw : {};
  if (src.v !== undefined && src.v !== PRESET_VERSION) avisos.push(`versión de preset ${src.v} desconocida: se lee como la ${PRESET_VERSION}`);
  const numberIn = (key, value, fallback) => {
    const [lo, hi] = LIMITES[key];
    const n = typeof value === 'number' ? value : typeof value === 'string' ? parseFloat(value) : NaN;
    if (!Number.isFinite(n)) {
      if (value !== undefined) avisos.push(`${key} no es un número`);
      return fallback;
    }
    if (n < lo || n > hi) avisos.push(`${key} fuera de rango (${lo}–${hi}): se recorta`);
    return clamp(n, lo, hi);
  };
  const colorIn = (key, value, fallback) => {
    if (value === undefined) return fallback;
    if (isSafeValue(value) && parseColor(value)) return value.trim();
    avisos.push(`color.${key} no es un color válido`);
    return fallback;
  };
  const fontIn = (key, value, fallback) => {
    if (value === undefined) return fallback;
    if (value === '' && key === 'serif') return '';
    if (typeof value === 'string' && FONT.test(value)) return value.trim();
    avisos.push(`texto.${key} no es una lista de fuentes válida`);
    return fallback;
  };

  const ajustes = {};
  for (const [mode, values] of Object.entries(src.ajustes && typeof src.ajustes === 'object' ? src.ajustes : {})) {
    if (!MODE_NAME.test(mode) || !values || typeof values !== 'object') {
      avisos.push(`ajustes: modo «${mode}» no válido`);
      continue;
    }
    for (const [key, value] of Object.entries(values)) {
      const name = key.replace(/^--/, '');
      if (!isTokenName(name) || !isSafeValue(value)) {
        avisos.push(`ajustes.${mode}: «${key}» descartado`);
        continue;
      }
      (ajustes[mode] ??= {})[name] = value.trim();
    }
  }

  const color = src.color ?? {};
  const texto = src.texto ?? {};
  const sombra = src.sombra ?? {};
  const base = typeof src.base === 'string' && MODE_NAME.test(src.base) ? src.base : null;
  return {
    preset: {
      v: PRESET_VERSION,
      modo: src.modo === 'ajustar' ? 'ajustar' : 'generar',
      base,
      color: { neutro: colorIn('neutro', color.neutro, d.color.neutro), marca: colorIn('marca', color.marca, d.color.marca), error: colorIn('error', color.error, d.color.error) },
      texto: {
        sans: fontIn('sans', texto.sans, d.texto.sans),
        serif: fontIn('serif', texto.serif, d.texto.serif),
        mono: fontIn('mono', texto.mono, d.texto.mono),
        base: numberIn('texto.base', texto.base, d.texto.base),
        escala: numberIn('texto.escala', texto.escala, d.texto.escala),
        interlineado: numberIn('texto.interlineado', texto.interlineado, d.texto.interlineado),
      },
      espaciado: numberIn('espaciado', src.espaciado, d.espaciado),
      radio: numberIn('radio', src.radio, d.radio),
      sombra: { opacidad: numberIn('sombra.opacidad', sombra.opacidad, d.sombra.opacidad), difuminado: numberIn('sombra.difuminado', sombra.difuminado, d.sombra.difuminado) },
      ajustes,
    },
    avisos,
  };
}

const MAX_CODE = 6000;

/** El preset en base64url, para la URL (`?preset=`). Un preset «ajustar» solo guarda sus ajustes. @param {Preset} preset */
export function encodePreset(preset) {
  const data = preset.modo === 'ajustar' ? { v: preset.v, modo: preset.modo, base: preset.base, ajustes: preset.ajustes } : preset;
  const bytes = new TextEncoder().encode(JSON.stringify(data));
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * Lee un preset: el código, una URL del Lab con `?preset=` o el JSON. Lanza un error si no se puede leer.
 * @param {string} input
 * @returns {{ preset: Preset, avisos: string[] }}
 */
export function decodePreset(input) {
  const text = String(input ?? '').trim();
  if (text.startsWith('{')) return normalizePreset(JSON.parse(text));
  const code = /[?&]preset=([A-Za-z0-9_-]+)/.exec(text)?.[1] ?? text;
  if (!/^[A-Za-z0-9_-]+$/.test(code) || code.length > MAX_CODE) throw new Error('preset no válido');
  const binary = atob(code.replace(/-/g, '+').replace(/_/g, '/'));
  const json = new TextDecoder().decode(Uint8Array.from(binary, (ch) => ch.charCodeAt(0)));
  return normalizePreset(JSON.parse(json));
}

/** El código del preset que `ds preset aplicar` deja en la cabecera del CSS, o null. @param {string} css */
export const presetFromCss = (css) => /ds-preset:\s*([A-Za-z0-9_-]+)/.exec(css)?.[1] ?? null;

// ─── CSS ────────────────────────────────────────────────────────────────────

const declarations = (values, indent = '  ') => Object.entries(values).map(([name, value]) => `${indent}--${name}: ${value};`).join('\n');

/** Bloque CSS de un selector; los de modo `@media (prefers-color-scheme: x) sel` van dentro de su @media. */
function block(selector, values) {
  const media = /^(@media\s*\([^)]*\))\s+(.+)$/.exec(selector);
  if (!media) return `${selector} {\n${declarations(values)}\n}`;
  return `${media[1]} {\n  ${media[2]} {\n${declarations(values, '    ')}\n  }\n}`;
}

/**
 * Un ajuste en el modo base (:root) cambiaría también los modos que heredan ese token. Para que solo cambie el
 * modo que se tocó, los demás fijan el valor que tenían (cuando era el mismo que el del modo base).
 * @param {Ajustes} ajustes
 * @param {Record<string, Record<string, string>>} originales valores de antes, por modo, con el modo base primero
 * @returns {Ajustes}
 */
export function pinInherited(ajustes, originales) {
  const [baseMode, ...others] = Object.keys(originales);
  /** @type {Ajustes} */
  const out = structuredClone(ajustes);
  for (const name of Object.keys(ajustes[baseMode] ?? {})) {
    for (const mode of others) {
      const before = originales[mode]?.[name];
      if (out[mode]?.[name] === undefined && before !== undefined && before === originales[baseMode]?.[name]) (out[mode] ??= {})[name] = before;
    }
  }
  return out;
}

/**
 * CSS de un preset para experimental/. «generar» escribe todos los tokens: lo común y el modo claro en :root y
 * el oscuro en .dark. «ajustar» escribe solo los ajustes, con los selectores de cada modo del sistema; con los
 * valores de antes (`originales`), los modos que heredaban un token ajustado en :root conservan el suyo.
 * @param {Preset} preset
 * @param {{ selectores?: Record<string, string[]> | null, originales?: Record<string, Record<string, string>> }} [options]
 */
export function presetCss(preset, { selectores = null, originales } = {}) {
  const head = [
    '/* Primitivos del Lab. No lo edites a mano: ábrelo en el Lab con `npx ds preset resolver`, cámbialo allí',
    '   y vuelve a aplicarlo con `npx ds preset aplicar`.',
    `   ds-preset: ${encodePreset(preset)} */`,
  ].join('\n');
  if (preset.modo === 'generar') {
    const { modos, comunes } = deriveTokens(preset);
    return `${head}\n\n${block(':root', { ...modos.light, ...comunes })}\n\n${block('.dark', modos.dark)}\n`;
  }
  const blocks = [];
  for (const [mode, values] of Object.entries(originales ? pinInherited(preset.ajustes, originales) : preset.ajustes)) {
    if (!Object.keys(values).length) continue;
    const list = selectores?.[mode]?.length ? selectores[mode] : [mode === 'base' || mode === 'light' ? ':root' : mode === 'dark' ? '.dark' : `[data-theme="${mode}"]`];
    const plain = list.filter((s) => !s.startsWith('@media'));
    if (plain.length) blocks.push(block(plain.join(', '), values));
    for (const s of list.filter((s) => s.startsWith('@media'))) blocks.push(block(s, values));
  }
  return `${head}\n\n${blocks.join('\n\n')}\n`;
}

/**
 * Los valores de una base de tokens (de producción o de experimental/) en cada modo, con los ajustes encima.
 * Sin modos, uno solo: «base».
 * @param {Record<string, string | Record<string, string>>} values
 * @param {string[]} modes
 * @param {Ajustes} [ajustes]
 * @returns {Record<string, Record<string, string>>}
 */
export function baseByMode(values, modes, ajustes = {}) {
  const list = modes.length ? modes : ['base'];
  return Object.fromEntries(list.map((mode) => {
    /** @type {Record<string, string>} */
    const out = {};
    for (const [name, value] of Object.entries(values)) {
      const raw = tokenValue(value, mode === 'base' ? undefined : mode);
      if (raw !== undefined) out[name] = raw;
    }
    return [mode, { ...out, ...ajustes[mode] }];
  }));
}
