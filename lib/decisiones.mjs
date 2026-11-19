// Decisiones del sistema (content/decisiones/): registros de decisión (ADR) numerados. Aquí, lo que se calcula de
// ellas (quién sustituye a quién y qué decisiones afectan a cada ficha) y lo que comprueba `ds check`.
// Lo comparten el registry, la interfaz y el sync.
import { DECISION_SECTION, DECISION_STATUSES } from './meta.mjs';

/** Días que una decisión puede seguir «propuesta» antes de que `ds check` avise. */
export const DIAS_PROPUESTA = 14;

/** Apartados del cuerpo de una decisión. Los tres primeros son obligatorios. */
export const DECISION_PARTS = ['Contexto', 'Decisión', 'Consecuencias', 'Alternativas'];

const isDecision = (entry) => entry.section === DECISION_SECTION;
const ids = (value) => [value ?? []].flat().map(String);
const normalize = (text = '') => text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();

/** Número de una decisión: los cuatro dígitos con los que empieza su slug (`0003-tokens-con-nombre`). */
export const decisionNumber = (slug) => /^(\d{4})-/.exec(slug)?.[1] ?? null;

/** Fecha de una decisión como texto `AAAA-MM-DD` (YAML puede leerla como Date). */
const day = (value) => (value instanceof Date ? value.toISOString().slice(0, 10) : value ? String(value) : null);

/**
 * Relaciones entre decisiones y fichas. `sustituidaPor(id)`: las decisiones que la sustituyen. `para(id)`: las
 * decisiones (aceptadas o propuestas) que afectan a una ficha, de la más reciente a la más antigua.
 */
export function decisionRelations(entries) {
  const decisions = entries.filter(isDecision);
  const sustituidaPor = (id) => decisions.filter((d) => ids(d.data.sustituye).includes(id)).map((d) => d.id);
  const para = (id) =>
    decisions
      .filter((d) => ['aceptada', 'propuesta'].includes(d.estado) && ids(d.data.afecta).includes(id))
      .sort((a, b) => b.slug.localeCompare(a.slug))
      .map((d) => d.id);
  return { decisions, sustituidaPor, para };
}

/** Lo propio de una decisión en el registry y en su `.md`. */
export function decisionData(entry, relations) {
  return {
    numero: decisionNumber(entry.slug),
    fecha: day(entry.data.fecha),
    decide: entry.data.decide ?? null,
    afecta: ids(entry.data.afecta),
    sustituye: ids(entry.data.sustituye),
    sustituidaPor: relations.sustituidaPor(entry.id),
  };
}

/**
 * Comprueba las decisiones de un sistema. `errores` hacen fallar `ds check`; `avisos`, no.
 * @param {Array<any>} entries las fichas del sistema (loadEntries)
 * @param {Date} [today]
 */
export function checkDecisions(entries, today = new Date()) {
  const errores = [];
  const avisos = [];
  const known = new Set(entries.map((e) => e.id));
  const { decisions, sustituidaPor } = decisionRelations(entries);
  const byNumber = new Map();

  for (const d of decisions) {
    const where = `${d.id}:`;
    const numero = decisionNumber(d.slug);
    if (!numero) errores.push(`${where} el nombre del archivo tiene que empezar por su número de cuatro cifras (0001-${d.slug}.md).`);
    else byNumber.set(numero, [...(byNumber.get(numero) ?? []), d.id]);

    if (!(d.estado in DECISION_STATUSES)) errores.push(`${where} estado «${d.estado}» no es de una decisión (${Object.keys(DECISION_STATUSES).join(', ')}).`);
    if (!d.data.fecha) errores.push(`${where} falta la fecha (AAAA-MM-DD).`);
    // Solo una persona acepta o rechaza: queda escrito quién.
    if (['aceptada', 'rechazada', 'sustituida'].includes(d.estado) && !d.data.decide) errores.push(`${where} estado «${d.estado}» sin «decide»: escribe quién lo decidió.`);

    for (const id of ids(d.data.afecta)) if (!known.has(id)) errores.push(`${where} afecta a ${id}, que no existe.`);
    for (const id of ids(d.data.sustituye)) {
      const old = decisions.find((o) => o.id === id);
      if (!old) errores.push(`${where} sustituye a ${id}, que no es una decisión.`);
      else if (d.estado === 'aceptada' && old.estado !== 'sustituida') errores.push(`${where} sustituye a ${id}, que sigue «${old.estado}»: pásala a «sustituida».`);
    }
    if (d.estado === 'sustituida' && !sustituidaPor(d.id).length) errores.push(`${where} está «sustituida», pero ninguna decisión la sustituye (falta «sustituye» en la nueva).`);

    const headings = [...d.body.matchAll(/^##\s+(.+)$/gm)].map((m) => normalize(m[1]));
    const missing = DECISION_PARTS.slice(0, 3).filter((part) => !headings.some((h) => h.startsWith(normalize(part))));
    if (missing.length) avisos.push(`${where} faltan los apartados ${missing.join(', ')}.`);

    const fecha = day(d.data.fecha);
    if (d.estado === 'propuesta' && fecha) {
      const dias = Math.floor((today.getTime() - new Date(fecha).getTime()) / 86_400_000);
      if (dias > DIAS_PROPUESTA) avisos.push(`${where} lleva ${dias} días propuesta: pide a una persona que la acepte o la rechace.`);
    }
  }
  for (const [numero, list] of byNumber) if (list.length > 1) errores.push(`El número ${numero} está repetido: ${list.join(', ')}.`);

  // Los estados de decisión solo valen en las decisiones.
  for (const e of entries.filter((x) => !isDecision(x) && x.estado in DECISION_STATUSES)) errores.push(`${e.id}: «${e.estado}» es un estado de decisión; una ficha usa exploracion, desarrollo, produccion u obsoleto.`);

  return { errores, avisos };
}
