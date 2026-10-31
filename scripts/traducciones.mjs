#!/usr/bin/env node
// Estado de las traducciones (system.json → idiomas). Nada de esto toca producción.
//
//   npx ds traducciones                    lista las traducciones: al día, desfasadas y las que faltan
//   npx ds traducciones --aceptar <ruta>   marca como revisada una traducción (o "all"): escribe en su `origen`
//                                          la huella del original. Solo después de revisar el texto.
//   --aviso                                solo avisa de lo que no está al día (lo usa ds check); nunca falla
//   --json                                 la lista en JSON
//
// En el kit (sin DS_SISTEMAS) también revisa la metodología (docs/metodologia/*.en.md).
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, listSystems, listTranslations } from '../lib/core.mjs';

const args = process.argv.slice(2);
const acceptAt = args.indexOf('--aceptar');
const ACCEPT = acceptAt >= 0 ? args[acceptAt + 1] ?? 'all' : null;
const WARN_ONLY = args.includes('--aviso');
const JSON_OUT = args.includes('--json');
const IN_KIT = !process.env.DS_SISTEMAS;

/** Escribe `origen: "<huella>"` en el frontmatter de una traducción, sin tocar lo demás. Entre comillas: sin ellas, YAML lee «4513968e0721» como un número. */
function stamp(file, hash) {
  const src = fs.readFileSync(file, 'utf8');
  hash = JSON.stringify(hash);
  const match = /^---\n([\s\S]*?)\n---\n?/.exec(src);
  let next;
  if (!match) next = `---\norigen: ${hash}\n---\n\n${src}`;
  else if (/^origen:.*$/m.test(match[1])) next = src.replace(match[0], match[0].replace(/^origen:.*$/m, `origen: ${hash}`));
  else next = src.replace(match[0], `---\n${match[1]}\norigen: ${hash}\n---\n`);
  fs.writeFileSync(file, next);
}

const rows = [];
for (const system of listSystems()) {
  // La metodología es del kit: se revisa una sola vez, con el primer sistema que la enseña.
  const metodologia = IN_KIT && system.metodologia && !rows.some((r) => r.metodologia);
  for (const t of listTranslations(system, { metodologia })) {
    const base = t.original.startsWith(system.dir) ? system.dir : ROOT;
    rows.push({ sistema: system.id, ...t, metodologia: base === ROOT, ruta: path.relative(base, t.traduccion) });
  }
}

if (ACCEPT) {
  const targets = rows.filter((r) => r.estado !== 'falta' && (ACCEPT === 'all' || [r.ruta, path.relative(process.cwd(), r.traduccion), path.relative(process.cwd(), r.original)].includes(ACCEPT)));
  if (!targets.length) {
    console.error(ACCEPT === 'all' ? 'No hay traducciones que aceptar.' : `No hay ninguna traducción en ${ACCEPT}.`);
    process.exit(1);
  }
  for (const r of targets) {
    const { huella } = r;
    if (r.origen === huella) continue;
    stamp(r.traduccion, huella);
    console.log(`aceptada: ${r.ruta} (${huella})`);
  }
  process.exit(0);
}

if (JSON_OUT) {
  console.log(JSON.stringify(rows.map(({ sistema, lang, ruta, estado, origen, huella }) => ({ sistema, idioma: lang, ruta, estado, origen, huella })), null, 2));
  process.exit(0);
}

const pending = rows.filter((r) => r.estado !== 'ok');
if (WARN_ONLY) {
  for (const r of pending) console.log(`aviso ${r.sistema}: traducción ${r.estado === 'falta' ? 'que falta' : 'desfasada'}: ${r.ruta}`);
  process.exit(0);
}
if (!rows.length) {
  console.log('Ningún sistema tiene traducciones. Se activan en system.json con "idiomas": ["es", "en"].');
  process.exit(0);
}
const LABEL = { ok: 'al día', desfasada: 'desfasada', falta: 'falta' };
for (const r of rows) console.log(`${LABEL[r.estado].padEnd(9)} ${r.lang}  ${r.sistema}  ${r.ruta}`);
const count = (e) => rows.filter((r) => r.estado === e).length;
console.log(`\n${count('ok')} al día, ${count('desfasada')} desfasadas, ${count('falta')} sin traducir.`);
if (count('desfasada')) console.log('Revisa cada desfasada contra su original y acéptala con --aceptar <ruta>.');
