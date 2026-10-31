// Patrones compartidos en la instantánea de producción (`produccion/<superficie>/*.css`, la que deja `ds sync`).
// Agrupa reglas de clases distintas que comparten una firma de forma (radio, sombra, fondo, borde, relleno y
// los mismos var(--token)), aunque vivan en hojas distintas y con prefijos distintos. Lo usa `ds patrones` y la
// skill inventariar-produccion para proponer piezas que el inventario por prefijos no ve. Solo lectura.
import fs from 'node:fs';
import path from 'node:path';
import postcss from 'postcss';

/** Propiedades de forma, agrupadas en familias: dos clases con `background` y `background-color` iguales comparten fondo. */
const FAMILIES = [
  ['radio', /^border(-(top|bottom|start|end)-(left|right|start|end))?-radius$/],
  ['sombra', /^box-shadow$/],
  ['fondo', /^background(-color)?$/],
  ['borde', /^border(-(top|right|bottom|left|block|inline)(-(start|end))?)?(-(width|style|color))?$/],
  ['relleno', /^padding(-(top|right|bottom|left|block|inline)(-(start|end))?)?$/],
];
const familyOf = (prop) => FAMILIES.find(([, re]) => re.test(prop))?.[0] ?? null;

/** Valores que quitan en vez de dar forma (los resets de un botón): no son un rasgo compartido. */
const RESET = /^(0|0px|none|transparent|inherit|initial|unset|revert|auto|0 0|0px 0px|0 none|none 0)$/;

const normValue = (value) => value.replace(/\s*!important\s*$/i, '').replace(/\s+/g, ' ').replace(/\s*,\s*/g, ', ').trim().toLowerCase();
const tokensIn = (value) => [...value.matchAll(/var\(\s*(--[\w-]+)/g)].map(([, t]) => t);

/** Prefijo de una clase: `wall-item` → wall, `feedCard` → feed, `hero__card` → hero. */
export const prefixOf = (cls) => cls.split(/[-_]|(?=[A-Z])/).find(Boolean)?.toLowerCase() ?? cls;

/**
 * Selectores que cuentan como pieza: clases sin pseudoclases, atributos ni comodines (`.card`, `.wall .item`).
 * Devuelve las clases del selector o null.
 */
function selectorClasses(selector) {
  const s = selector.trim();
  if (!s || /[:[*]/.test(s) || /[>+~]/.test(s)) return null;
  const compounds = s.split(/\s+/);
  // Cada compuesto es una sola clase: `.btn.btn-primary` o `div.card` son variantes, no la forma base.
  if (!compounds.every((c) => /^\.[\w-]+$/.test(c))) return null;
  return compounds.map((c) => c.slice(1));
}

/** La regla está fuera de @media, @supports y @keyframes (dentro de @layer sí cuenta): la forma base. */
const isBase = (rule) => {
  for (let p = rule.parent; p && p.type !== 'root'; p = p.parent) if (p.type === 'atrule' && p.name !== 'layer') return false;
  return true;
};

/** Hojas de la instantánea: [{ superficie, hoja, archivo }]. */
export function snapshotSheets(systemDir) {
  const dir = path.join(systemDir, 'produccion');
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .flatMap((d) => fs.readdirSync(path.join(dir, d.name))
      .filter((f) => f.endsWith('.css'))
      .sort()
      .map((f) => ({ superficie: d.name, hoja: `${d.name}/${f}`, archivo: path.join(dir, d.name, f) })));
}

/**
 * Lee las piezas de cada hoja: un selector con sus declaraciones de forma (las reglas repetidas del mismo selector
 * se juntan; gana la última). Se descartan los selectores que cuelgan de una clase de modo o de ámbito (una clase
 * que define propiedades personalizadas, como `.dark`): son ajustes de otra pieza, no una pieza.
 */
export function readPieces(sheets) {
  const pieces = [];
  for (const sheet of sheets) {
    const root = postcss.parse(fs.readFileSync(sheet.archivo, 'utf8'), { from: sheet.archivo });
    const scopes = new Set();
    root.walkRules((rule) => {
      if (!rule.some((n) => n.type === 'decl' && n.prop.startsWith('--'))) return;
      for (const sel of rule.selectors) {
        const m = /^\.([\w-]+)$/.exec(sel.trim());
        if (m) scopes.add(m[1]);
      }
    });
    const bySelector = new Map();
    root.walkRules((rule) => {
      if (!isBase(rule)) return;
      for (const sel of rule.selectors) {
        const classes = selectorClasses(sel);
        if (!classes || classes.slice(0, -1).some((c) => scopes.has(c))) continue;
        const key = classes.map((c) => `.${c}`).join(' ');
        if (!bySelector.has(key)) bySelector.set(key, { selector: key, clase: classes[0], decls: new Map() });
        rule.each((n) => {
          if (n.type === 'decl' && familyOf(n.prop)) bySelector.get(key).decls.set(n.prop === 'background-color' ? 'background' : n.prop, normValue(n.value));
        });
      }
    });
    for (const p of bySelector.values()) {
      const features = new Set();
      for (const [prop, value] of p.decls) {
        if (RESET.test(value)) continue;
        features.add(`${prop}: ${value}`);
        for (const t of tokensIn(value)) features.add(`var(${t})`);
      }
      if (features.size) pieces.push({ selector: p.selector, prefijo: prefixOf(p.clase), superficie: sheet.superficie, hoja: sheet.hoja, features });
    }
  }
  return pieces;
}

/** Cuántos rasgos distintos tiene una firma: un token que ya está dentro de una declaración de la firma no suma. */
function strength(features) {
  const decls = features.filter((f) => !f.startsWith('var('));
  const tokens = features.filter((f) => f.startsWith('var(') && !decls.some((d) => d.includes(f.slice(0, -1))));
  return decls.length + tokens.length;
}

/** Una firma vale si tiene los rasgos pedidos y algo más que relleno: dos clases con el mismo padding no son la misma pieza. */
const isSignature = (features, minRasgos) => strength(features) >= minRasgos && features.some((f) => !f.startsWith('padding'));

/** La firma como dato: declaraciones por propiedad, tokens y familias de forma que toca. */
function describe(features) {
  const declaraciones = Object.fromEntries(features.filter((f) => !f.startsWith('var(')).map((f) => {
    const at = f.indexOf(': ');
    return [f.slice(0, at), f.slice(at + 2)];
  }));
  const tokens = features.filter((f) => f.startsWith('var(')).map((f) => f.slice(4, -1));
  const familias = [...new Set(Object.keys(declaraciones).map(familyOf))];
  return { declaraciones, tokens, familias };
}

/**
 * Grupos de piezas que comparten firma. Cada firma candidata sale de lo que tienen en común dos piezas; se cierra
 * con todo lo que comparten las piezas que la contienen, de modo que cada grupo es la firma más larga de su
 * conjunto de piezas. Se ordenan por hojas que cruzan, luego por fuerza de la firma (a igual alcance, la forma más
 * completa antes que un rasgo suelto) y luego por prefijos.
 * `minRasgos` es cuántos rasgos distintos pide una firma: con 1 basta un mismo radio o un mismo token de fondo.
 * @param {{ minRasgos?: number, minHojas?: number, minPrefijos?: number, limite?: number }} opciones
 */
export function findPatterns(pieces, { minRasgos = 1, minHojas = 2, minPrefijos = 2, limite = 20 } = {}) {
  const candidates = pieces.filter((p) => isSignature([...p.features], minRasgos));
  const groups = new Map();
  const seen = new Set();
  for (let i = 0; i < candidates.length; i++) {
    for (let j = i + 1; j < candidates.length; j++) {
      const a = candidates[i];
      const b = candidates[j];
      if (a.hoja === b.hoja && a.prefijo === b.prefijo) continue;
      const common = [...a.features].filter((f) => b.features.has(f)).sort();
      if (!isSignature(common, minRasgos) || seen.has(common.join('\n'))) continue;
      seen.add(common.join('\n'));
      const support = candidates.filter((p) => common.every((f) => p.features.has(f)));
      const closed = [...support[0].features].filter((f) => support.every((p) => p.features.has(f))).sort();
      const key = closed.join('\n');
      if (!groups.has(key)) groups.set(key, { features: closed, support });
    }
  }
  const ranked = [...groups.values()]
    .map(({ features, support }) => {
      const hojas = [...new Set(support.map((p) => p.hoja))].sort();
      const prefijos = [...new Set(support.map((p) => p.prefijo))].sort();
      return {
        features,
        firma: describe(features),
        fuerza: strength(features),
        hojas,
        numHojas: hojas.length,
        prefijos,
        numPrefijos: prefijos.length,
        superficies: [...new Set(support.map((p) => p.superficie))].sort(),
        clases: support.map((p) => ({ selector: p.selector, hoja: p.hoja })),
      };
    })
    .filter((g) => g.numHojas >= minHojas && g.numPrefijos >= minPrefijos)
    .sort((x, y) => y.numHojas - x.numHojas || y.fuerza - x.fuerza || y.numPrefijos - x.numPrefijos || y.clases.length - x.clases.length)
    .slice(0, limite);
  // Variante: un grupo anterior tiene toda su firma y todas sus clases (la misma pieza, con más rasgos en común).
  const sel = (c) => `${c.hoja} ${c.selector}`;
  return ranked.map(({ features, ...g }, i) => {
    const parent = ranked.slice(0, i).findIndex((o) => o.features.every((f) => features.includes(f)) && g.clases.every((c) => o.clases.some((x) => sel(x) === sel(c))));
    return { ...g, varianteDe: parent >= 0 ? parent + 1 : null };
  });
}

/** Todo junto: hojas de la instantánea de un sistema → grupos. null si no hay instantánea. */
export function sharedPatterns(systemDir, opciones) {
  const sheets = snapshotSheets(systemDir);
  if (!sheets.length) return null;
  const pieces = readPieces(sheets);
  return { hojas: sheets.length, reglas: pieces.length, grupos: findPatterns(pieces, opciones) };
}
