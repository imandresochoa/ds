#!/usr/bin/env node
// Genera public/ a partir de los sistemas (DS_SISTEMAS o systems/) y docs/ (se ejecuta antes de `dev` y `build`):
//   /_ds/<sistema>/produccion/…   instantánea del CSS de producción para los ejemplos en vivo
//   /<sistema>/<sección>/<ficha>.md  cada ficha en Markdown (misma ruta que su página)
//   /<sistema>/design.md          guía para agentes: DESIGN.md escrito a mano + apéndice generado
//   /<sistema>/registry.json      datos estructurados de todas las fichas
//   /llms.txt                     índice para agentes de todos los sistemas
//   /metodologia/<guía>.md        la metodología común
//
// Con --exportar (ds build), los enlaces absolutos de estos archivos llevan delante la ruta de publicación
// (publicacion.ruta o DS_RUTA), igual que las páginas: /ds/<sistema>/design.md. Sin ella, nada cambia.
import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';
import { CONTENT_SECTIONS, PLATFORMS, ROOT, STATUSES, SYNC_STATES, listSystems, loadDocs, loadEntries, loadProductionTokens, loadSyncReport, modeLabel, publicationRoute, routeMarkdown, tokenModes, tokenValue, withRoute } from '../lib/core.mjs';

const PUBLIC = path.join(ROOT, 'public');
const ROUTE = process.argv.includes('--exportar') ? publicationRoute() : '';
const at = (href) => withRoute(href, ROUTE);
const md = (markdown) => routeMarkdown(markdown, ROUTE);
fs.rmSync(PUBLIC, { recursive: true, force: true });
fs.mkdirSync(PUBLIC, { recursive: true });

const write = (rel, content) => {
  const file = path.join(PUBLIC, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
};
const copyDir = (from, to) => fs.existsSync(from) && fs.cpSync(from, path.join(PUBLIC, to), { recursive: true });
const statusLabel = (s) => STATUSES[s]?.label ?? s;

/** Una ficha completa en Markdown: frontmatter, cuerpo común y una sección por plataforma. */
function entryMarkdown(system, entry, report) {
  const sync = report?.entradas?.[entry.id];
  const front = { ...entry.data, id: entry.id, url: at(entry.href), sync: sync?.estado ?? null };
  const parts = [`---\n${YAML.stringify(front).trim()}\n---`, `# ${entry.titulo}`, entry.resumen, md(entry.body.trim())];
  for (const [platform, info] of Object.entries(entry.platforms)) {
    if (info.body.trim()) parts.push(`# ${PLATFORMS[platform]}\n\n${md(info.body.trim())}`);
    else if (CONTENT_SECTIONS.find((s) => s.id === entry.section)?.agrupar === 'nivel') parts.push(`# ${PLATFORMS[platform]}\n\nEstado: ${statusLabel(info.estado)}. Sin implementación documentada.`);
  }
  if (sync?.fuentes?.length) {
    parts.push('# Enlace con producción\n\n| Fuente | Estado | Huella |\n| --- | --- | --- |\n' + sync.fuentes.map((f) => `| \`${f.fuente}\` | ${SYNC_STATES[f.estado]?.label ?? f.estado} | ${f.huella ?? '—'} |`).join('\n'));
  }
  return parts.filter(Boolean).join('\n\n') + '\n';
}

const llms = [
  '# Sistemas de diseño',
  '',
  '> Sistemas de diseño agentic-first. Cada página tiene su versión Markdown en la misma ruta terminada en `.md`.',
  '> Empieza por el design.md del sistema. Usa solo fichas «En producción» salvo que te pidan lo contrario; las que están en exploración o desarrollo aún no existen en producción. Si algo no está documentado, dilo en lugar de inventarlo.',
  '',
  '## Estados',
  '',
  ...Object.values(STATUSES).map((s) => `- ${s.label}: ${s.descripcion}`),
  '',
];

for (const system of listSystems()) {
  const entries = loadEntries(system);
  const report = loadSyncReport(system);
  const tokens = loadProductionTokens(system);

  copyDir(path.join(system.dir, 'produccion'), `_ds/${system.id}/produccion`);
  copyDir(path.join(system.dir, 'experimental'), `_ds/${system.id}/experimental`);

  for (const entry of entries) write(`${system.id}/${entry.section}/${entry.slug}.md`, entryMarkdown(system, entry, report));

  // registry.json: lo que un agente necesita para decidir sin leer cada ficha.
  const registry = {
    sistema: { id: system.id, nombre: system.nombre, descripcion: system.descripcion, extiende: system.extiende, produccion: system.produccion ? { web: system.produccion.web, codigo: system.produccion.codigo, commit: report?.commit ?? null } : null },
    estados: STATUSES,
    fichas: entries.map((e) => ({
      id: e.id,
      titulo: e.titulo,
      resumen: e.resumen,
      seccion: e.section,
      funcion: e.data.funcion ?? null,
      nivel: e.data.nivel ?? null,
      estado: e.estado,
      iniciativa: e.data.iniciativa ?? null,
      md: at(`${e.href}.md`),
      url: at(e.href),
      tokens: (e.data.tokens ?? []).map((t) => (typeof t === 'string' ? t : t.nombre)),
      plataformas: Object.fromEntries(Object.entries(e.platforms).map(([p, info]) => [p, { estado: info.estado, superficies: info.superficies }])),
      sync: report?.entradas?.[e.id] ? { estado: report.entradas[e.id].estado, avisos: report.entradas[e.id].avisos } : null,
    })),
    tokens,
    // Modos de cada superficie y los selectores que los activan (claro en :root, oscuro en .dark…).
    modos: Object.fromEntries(Object.entries(report?.tokens ?? {}).map(([surface, info]) => [surface, info.modos])),
  };
  write(`${system.id}/registry.json`, JSON.stringify(registry, null, 2) + '\n');

  // design.md: criterio escrito a mano + mecánica generada (nunca se desincroniza).
  const handwritten = fs.existsSync(path.join(system.dir, 'DESIGN.md')) ? md(fs.readFileSync(path.join(system.dir, 'DESIGN.md'), 'utf8').trim()) : `# ${system.nombre}`;
  const bySection = CONTENT_SECTIONS.map((section) => {
    const list = entries.filter((e) => e.section === section.id);
    if (!list.length) return '';
    return `### ${section.label}\n\n` + list.map((e) => `- [${e.titulo}](${at(e.href)}.md) — ${statusLabel(e.estado)}. ${e.resumen}`).join('\n');
  }).filter(Boolean).join('\n\n');
  const classApi = entries
    .filter((e) => e.estado === 'produccion')
    .flatMap((e) => Object.values(e.platforms).flatMap((p) => p.superficies.filter((s) => s.clases?.length).map((s) => `- ${e.titulo} (${s.id}): ${s.clases.map((c) => `\`.${c}\``).join(', ')}`)));
  // Con modos, una columna por modo y la línea que dice cómo se activa cada uno.
  const tokenTable = Object.entries(tokens).map(([surface, values]) => {
    const selectors = report?.tokens?.[surface]?.modos ?? null;
    const modes = tokenModes(values, selectors);
    const columns = modes.length ? modes : [undefined];
    const how = modes.length ? `Modos: ${modes.map((m) => `${modeLabel(m)}${selectors?.[m] ? ` (${selectors[m].map((s) => `\`${s}\``).join(', ')})` : ''}`).join(' · ')}.\n\n` : '';
    const head = `| Token | ${modes.length ? modes.map(modeLabel).join(' | ') : 'Valor'} |\n| --- |${' --- |'.repeat(columns.length)}`;
    const rows = Object.entries(values).map(([k, v]) => `| \`--${k}\` | ${columns.map((m) => { const x = tokenValue(v, m); return x === undefined ? '—' : `\`${x}\``; }).join(' | ')} |`);
    return `### ${system.produccion?.superficies?.[surface]?.nombre ?? surface}\n\n${how}${head}\n${rows.join('\n')}`;
  }).join('\n\n');
  const generated = [
    '---',
    '',
    '<!-- Todo lo que sigue se genera desde las fichas y el sync. No se edita a mano. -->',
    '',
    '## Estados',
    '',
    ...Object.values(STATUSES).map((s) => `- **${s.label}:** ${s.descripcion}`),
    '',
    '## API pública de clases (solo «En producción»)',
    '',
    'Usa exactamente estos nombres. No inventes sinónimos.',
    '',
    ...classApi,
    '',
    '## Fichas',
    '',
    bySection,
    '',
    `## Tokens de producción${report ? ` (commit ${report.commit})` : ''}`,
    '',
    tokenTable,
    '',
  ].join('\n');
  write(`${system.id}/design.md`, `${handwritten}\n\n${generated}`);
  write(`${system.id}/llms-full.txt`, entries.map((e) => entryMarkdown(system, e, report)).join('\n\n---\n\n'));

  llms.push(`## ${system.nombre}`, '', `- [design.md](${at(`/${system.id}/design.md`)}): reglas, API de clases, tokens y estados`, `- [registry.json](${at(`/${system.id}/registry.json`)}): datos estructurados`, `- [llms-full.txt](${at(`/${system.id}/llms-full.txt`)}): todas las fichas en un archivo`, '');
  for (const section of CONTENT_SECTIONS) {
    const list = entries.filter((e) => e.section === section.id);
    if (!list.length) continue;
    llms.push(`### ${section.label}`, '', ...list.map((e) => `- [${e.titulo}](${at(e.href)}.md): ${statusLabel(e.estado)}. ${e.resumen}`), '');
  }
}

// La metodología es interna: se publica solo si algún sistema la activa.
const docs = listSystems().some((s) => s.metodologia) ? loadDocs() : [];
for (const doc of docs) write(`metodologia/${doc.slug}.md`, `# ${doc.titulo}\n\n${doc.resumen}\n\n${md(doc.body.trim())}\n`);
if (docs.length) llms.push('## Metodología (interna)', '', ...docs.map((d) => `- [${d.titulo}](${at(`/metodologia/${d.slug}.md`)}): ${d.resumen}`), '');
write('llms.txt', llms.join('\n'));

console.log(`public/ generado: ${listSystems().length} sistema(s), ${docs.length} guías de metodología${ROUTE ? `, publicado bajo ${ROUTE}` : ''}`);
