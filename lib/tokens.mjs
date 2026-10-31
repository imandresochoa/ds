// Tokens de producción con modos (claro, oscuro…). Sin dependencias de Node: los usan el sync, la publicación y la interfaz.
//
// tokens.produccion.json guarda un valor por token y superficie: un texto si vale lo mismo en todos los modos
// (o el sistema no tiene modos) y { modo: valor } si cambia entre modos, con el modo base primero.

/** @typedef {string | Record<string, string>} TokenValue */

/** Nombre visible de cada modo. Los demás se muestran tal cual. @type {Record<string, string>} */
export const MODE_LABELS = { base: 'Base', light: 'Claro', dark: 'Oscuro' };
/** @type {Record<string, Record<string, string>>} */
const MODE_LABELS_BY_LANG = { es: MODE_LABELS, en: { base: 'Base', light: 'Light', dark: 'Dark' } };
/** @param {string} mode @param {string} [lang] */
export const modeLabel = (mode, lang = 'es') => (MODE_LABELS_BY_LANG[lang] ?? MODE_LABELS)[mode] ?? mode;

/**
 * Modos de una superficie, en orden. Salen del informe del sync (`tokens.<superficie>.modos`) o, sin él,
 * de los valores. Con menos de dos modos devuelve [] (no hay nada que comparar).
 * @param {Record<string, TokenValue>} [values]
 * @param {Record<string, string[]> | null} [declared]
 * @returns {string[]}
 */
export function tokenModes(values = {}, declared = null) {
  const modes = declared ? Object.keys(declared) : [];
  if (!declared) for (const value of Object.values(values)) if (value && typeof value === 'object') for (const mode of Object.keys(value)) if (!modes.includes(mode)) modes.push(mode);
  return modes.length > 1 ? modes : [];
}

/**
 * Valor escrito de un token en un modo. Sin modo, el del modo base.
 * @param {TokenValue | undefined | null} value
 * @param {string} [mode]
 * @returns {string | undefined}
 */
export function tokenValue(value, mode) {
  if (value === undefined || value === null || typeof value === 'string') return value ?? undefined;
  return mode ? value[mode] : Object.values(value)[0];
}

const VAR = /var\(\s*--([\w-]+)\s*(?:,\s*((?:[^()]|\([^()]*\))*))?\)/g;

/**
 * Sustituye cada var(--x) por el valor de --x en el modo dado, en cadena. Lo que no se puede resolver se queda igual.
 * @param {string} text
 * @param {(name: string, mode?: string) => string | undefined} lookup
 * @param {string} [mode]
 * @param {Set<string>} [seen]
 * @returns {string}
 */
export function resolveVars(text, lookup, mode, seen = new Set()) {
  return text.replace(VAR, (all, name, fallback) => {
    if (seen.has(name)) return all;
    const raw = lookup(name, mode);
    if (raw === undefined) return fallback === undefined ? all : resolveVars(fallback.trim(), lookup, mode, seen);
    return resolveVars(raw, lookup, mode, new Set([...seen, name]));
  });
}

/**
 * Valor de un token en un modo con sus var() resueltas contra los demás tokens de la superficie.
 * @param {Record<string, TokenValue>} values
 * @param {string} name
 * @param {string} [mode]
 */
export function resolvedTokenValue(values, name, mode) {
  const raw = tokenValue(values[name], mode);
  return raw === undefined ? undefined : resolveVars(raw, (other, m) => tokenValue(values[other], m), mode, new Set([name]));
}
