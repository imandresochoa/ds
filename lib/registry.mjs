// Registry de solo lectura: el índice del sistema (/<sistema>/registry.json) y un JSON por pieza
// (/<sistema>/r/<sección>/<slug>.json). Lo usan `ds build`, `ds dev`, `ds search` y `ds ver`, para que
// un agente vea la misma forma en la web y en la terminal. Nada de esto escribe en producción.
import { CONTENT_SECTIONS, STATUSES, loadEntries, loadProductionTokens, loadSyncReport } from './core.mjs';

const sectionOf = (entry) => CONTENT_SECTIONS.find((s) => s.id === entry.section);

/** Categoría de una ficha en las secciones que agrupan por categoría (`nivel` es su nombre anterior en los bloques). */
export const categoria = (entry) => (sectionOf(entry)?.agrupar === 'categoria' ? entry.data.categoria ?? entry.data.nivel ?? null : null);

/** Las categorías como dato: la función de un componente, la categoría de un bloque o gráfico, el grupo de un fundamento o token. */
const categorias = (entry) => [entry.section === 'componentes' ? entry.data.funcion : categoria(entry) ?? entry.data.grupo].filter(Boolean);

const tokenName = (t) => String(typeof t === 'string' ? t : t?.nombre ?? '').replace(/^--/, '');

const normalize = (text = '') => text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();

/** El Markdown de una sección `## …` del cuerpo, hasta el siguiente `## `. null si no está. */
function bodySection(body, titles) {
  const lines = body.split('\n');
  const start = lines.findIndex((l) => /^##\s/.test(l) && titles.some((t) => normalize(l.replace(/^##\s+/, '')).startsWith(t)));
  if (start < 0) return null;
  const end = lines.findIndex((l, i) => i > start && /^#{1,2}\s/.test(l));
  return lines.slice(start + 1, end < 0 ? undefined : end).join('\n').trim() || null;
}

/** Lee todo lo que necesita el registry de un sistema. `at` pone delante la ruta de publicación (en `ds build`). */
export function loadRegistry(system, { at = (href) => href } = {}) {
  const entries = loadEntries(system);
  const report = loadSyncReport(system);
  const tokens = loadProductionTokens(system);
  const ids = new Set(entries.map((e) => e.id));

  // Cada token, a la ficha de tokens que lo documenta: así los `tokens` de una ficha entran en el grafo.
  const tokenOwner = new Map();
  for (const e of entries.filter((e) => e.section === 'tokens')) for (const t of e.data.tokens ?? []) if (!tokenOwner.has(tokenName(t))) tokenOwner.set(tokenName(t), e.id);

  const avisos = [];
  const usa = new Map(entries.map((e) => {
    const declared = (e.data.usa ?? []).map(String);
    for (const id of declared.filter((id) => !ids.has(id))) avisos.push(`${e.id} usa ${id}, que no existe.`);
    const fromTokens = e.section === 'tokens' ? [] : (e.data.tokens ?? []).map((t) => tokenOwner.get(tokenName(t))).filter(Boolean);
    return [e.id, [...new Set([...declared.filter((id) => ids.has(id)), ...fromTokens])].filter((id) => id !== e.id)];
  }));
  const usadoPor = (id) => entries.filter((e) => usa.get(e.id).includes(id)).map((e) => e.id);

  const json = (e) => at(`/${system.id}/r/${e.section}/${e.slug}.json`);

  /** Lo justo para elegir una pieza; el detalle está en su JSON. */
  const indexEntry = (e) => ({
    id: e.id,
    tipo: sectionOf(e)?.tipo ?? e.section,
    titulo: e.titulo,
    resumen: e.resumen,
    estado: e.estado,
    categorias: categorias(e),
    destacado: e.data.destacado === true,
    iniciativa: e.data.iniciativa ?? null,
    json: json(e),
    md: at(`${e.href}.md`),
    url: at(e.href),
  });

  const piece = (e) => {
    const sync = report?.entradas?.[e.id];
    const declaredTokens = e.data.tokens ?? [];
    return {
      ...indexEntry(e),
      sistema: system.id,
      nivel: e.section === 'componentes' ? e.data.nivel ?? null : null,
      creado: e.data.creado ?? null,
      actualizado: e.data.actualizado ?? null,
      usa: usa.get(e.id),
      usadoPor: usadoPor(e.id),
      relacionados: e.data.relacionados.filter((id) => ids.has(id)),
      // En una ficha de tokens, los que documenta con su rol y su valor en cada superficie de producción.
      tokens: e.section === 'tokens'
        ? declaredTokens.map((t) => {
            const nombre = tokenName(t);
            const produccion = Object.fromEntries(Object.entries(tokens).filter(([, values]) => nombre in values).map(([surface, values]) => [surface, values[nombre]]));
            return { nombre, rol: typeof t === 'string' ? null : t.rol ?? null, produccion };
          })
        : declaredTokens.map(tokenName),
      plataformas: Object.fromEntries(Object.entries(e.platforms).map(([p, info]) => [p, { estado: info.estado, superficies: info.superficies }])),
      sync: sync
        ? { estado: sync.estado, avisos: sync.avisos, fuentes: sync.fuentes.map((f) => ({ plataforma: f.plataforma, superficie: f.superficie, fuente: f.fuente, estado: f.estado, huella: f.huella ?? null, motivo: f.motivo ?? null })) }
        : null,
      reglas: bodySection(e.body, ['reglas']),
      antipatrones: bodySection(e.body, ['antipatrones', 'rechaza estos reflejos']),
    };
  };

  const index = {
    sistema: { id: system.id, nombre: system.nombre, descripcion: system.descripcion, extiende: system.extiende, produccion: system.produccion ? { web: system.produccion.web, codigo: system.produccion.codigo, commit: report?.commit ?? null } : null },
    estados: STATUSES,
    tipos: Object.fromEntries(CONTENT_SECTIONS.filter((s) => s.tipo).map((s) => [s.tipo, s.label])),
    piezas: entries.map(indexEntry),
    tokens,
    // Modos de cada superficie y los selectores que los activan (claro en :root, oscuro en .dark…).
    modos: Object.fromEntries(Object.entries(report?.tokens ?? {}).map(([surface, info]) => [surface, info.modos])),
  };

  return { entries, index, indexEntry, piece, avisos };
}

/** Busca una pieza por id (`componentes/boton`) o por slug, si solo hay una con ese slug. */
export function findEntry(entries, query) {
  const exact = entries.find((e) => e.id === query);
  if (exact) return { entry: exact };
  const bySlug = entries.filter((e) => e.slug === query);
  return bySlug.length === 1 ? { entry: bySlug[0] } : { entry: null, candidatos: bySlug.map((e) => e.id) };
}
