#!/usr/bin/env node
// Genera public/ a partir de los sistemas (DS_SISTEMAS o systems/) y docs/ (se ejecuta antes de `dev` y `build`):
//   /_ds/<sistema>/produccion/…   instantánea del CSS de producción para los ejemplos en vivo
//   /<sistema>/<sección>/<ficha>.md  cada ficha en Markdown (misma ruta que su página)
//   /<sistema>/docs.md, /<sistema>/docs/<página>.md  las páginas de Docs del sistema (content/docs/)
//   /<sistema>/design.md          guía para agentes: DESIGN.md escrito a mano + apéndice generado
//   /<sistema>/registry.json      índice del registry: lo justo de cada pieza para elegirla
//   /<sistema>/r/<sección>/<slug>.json  cada pieza: estado, grafo (usa), fuentes, sync, reglas y antipatrones
//   /llms.txt                     índice para agentes de todos los sistemas
//   /directorio.json              con varios sistemas (repo de directorio): una tarjeta por sistema con su cobertura
//   /metodologia/<guía>.md        la metodología común
//
// Con --exportar (ds build), los enlaces absolutos de estos archivos llevan delante la ruta de publicación
// (publicacion.ruta o DS_RUTA), igual que las páginas: /ds/<sistema>/design.md. Sin ella, nada cambia.
import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';
import { CONTENT_SECTIONS, FUNCIONES, KIT_PAGES, PLATFORM_SECTIONS, PLATFORMS, ROOT, STATUSES, SYNC_STATES, listSystems, loadDocs, loadPages, loadSyncReport, modeLabel, publicationRoute, routeMarkdown, tokenModes, tokenValue, withRoute } from '../lib/core.mjs';
import { categoria, loadDirectoryIndex, loadRegistry } from '../lib/registry.mjs';

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
    else if (PLATFORM_SECTIONS.includes(entry.section)) parts.push(`# ${PLATFORMS[platform]}\n\nEstado: ${statusLabel(info.estado)}. Sin implementación documentada.`);
  }
  if (sync?.fuentes?.length) {
    parts.push('# Enlace con producción\n\n| Fuente | Estado | Huella |\n| --- | --- | --- |\n' + sync.fuentes.map((f) => `| \`${f.fuente}\` | ${SYNC_STATES[f.estado]?.label ?? f.estado} | ${f.huella ?? '—'} |`).join('\n'));
  }
  return parts.filter(Boolean).join('\n\n') + '\n';
}

/** Subgrupo de una ficha en llms.txt: los componentes, por función; bloques y gráficos, por categoría. */
function llmsGroup(entry) {
  const section = CONTENT_SECTIONS.find((s) => s.id === entry.section);
  if (entry.section === 'componentes') return FUNCIONES[entry.data.funcion] ?? 'Otros';
  if (section?.agrupar === 'categoria') return section.categorias?.[categoria(entry)] ?? categoria(entry) ?? 'Otros';
  return null;
}

// Con varios sistemas, el Directorio: lo que ve la portada (/) y lo que lee un agente para elegir sistema.
const directory = loadDirectoryIndex({ at });
if (directory) write('directorio.json', JSON.stringify(directory, null, 2) + '\n');

const llms = [
  `# ${directory?.nombre ?? 'Sistemas de diseño'}`,
  '',
  ...(directory?.descripcion ? [`> ${directory.descripcion}`, ''] : []),
  '> Sistemas de diseño agentic-first. Cada página tiene su versión Markdown en la misma ruta terminada en `.md`.',
  '> Empieza por el design.md del sistema. Usa solo fichas «En producción» salvo que te pidan lo contrario; las que están en exploración o desarrollo aún no existen en producción. Si algo no está documentado, dilo en lugar de inventarlo.',
  '',
  '## Estados',
  '',
  ...Object.values(STATUSES).map((s) => `- ${s.label}: ${s.descripcion}`),
  '',
  ...(directory ? ['## Directorio', '', `- [directorio.json](${at('/directorio.json')}): un sistema por tarjeta, con su cobertura y el enlace a su registry`, ''] : []),
];

for (const system of listSystems()) {
  const { entries, index, piece, avisos } = loadRegistry(system, { at });
  const report = loadSyncReport(system);
  const tokens = index.tokens;

  copyDir(path.join(system.dir, 'produccion'), `_ds/${system.id}/produccion`);
  copyDir(path.join(system.dir, 'experimental'), `_ds/${system.id}/experimental`);

  for (const entry of entries) write(`${system.id}/${entry.section}/${entry.slug}.md`, entryMarkdown(system, entry, report));
  // Las páginas propias de Docs; las del kit (Producción, Para agentes) se generan en la interfaz.
  const pages = loadPages(system).filter((p) => !KIT_PAGES.some((k) => k.slug === p.slug));
  for (const page of pages) write(page.slug ? `${system.id}/docs/${page.slug}.md` : `${system.id}/docs.md`, `# ${page.titulo}\n\n${page.resumen}\n\n${md(page.body.trim())}\n`);

  // registry.json es el índice; cada pieza tiene su JSON en r/. Un agente elige en el índice y lee solo lo que usa.
  write(`${system.id}/registry.json`, JSON.stringify(index, null, 2) + '\n');
  for (const entry of entries) write(`${system.id}/r/${entry.section}/${entry.slug}.json`, JSON.stringify(piece(entry), null, 2) + '\n');
  for (const aviso of avisos) console.warn(`aviso ${system.id}: ${aviso}`);

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

  llms.push(`## ${system.nombre}`, '', `- [design.md](${at(`/${system.id}/design.md`)}): reglas, API de clases, tokens y estados`, `- [registry.json](${at(`/${system.id}/registry.json`)}): índice de piezas; cada una en \`${at(`/${system.id}/r/<sección>/<slug>.json`)}\` con su estado, lo que usa, sus fuentes y su sync`, `- [llms-full.txt](${at(`/${system.id}/llms-full.txt`)}): todas las fichas en un archivo`, '');
  llms.push('### Docs', '', ...pages.map((p) => `- [${p.titulo}](${at(`/${system.id}/${p.slug ? `docs/${p.slug}` : 'docs'}.md`)})${p.resumen ? `: ${p.resumen}` : ''}`), '');
  const line = (e) => `- [${e.titulo}](${at(e.href)}.md): ${statusLabel(e.estado)}. ${e.resumen}`;
  for (const section of CONTENT_SECTIONS) {
    const list = entries.filter((e) => e.section === section.id);
    if (!list.length) continue;
    llms.push(`### ${section.label}`, '');
    const groups = [...new Set(list.map(llmsGroup))];
    if (groups.length === 1 && groups[0] === null) llms.push(...list.map(line), '');
    else for (const group of groups) llms.push(`#### ${group}`, '', ...list.filter((e) => llmsGroup(e) === group).map(line), '');
  }
}

// La metodología es interna: se publica solo si algún sistema la activa.
const docs = listSystems().some((s) => s.metodologia) ? loadDocs() : [];
for (const doc of docs) write(`metodologia/${doc.slug}.md`, `# ${doc.titulo}\n\n${doc.resumen}\n\n${md(doc.body.trim())}\n`);
if (docs.length) llms.push('## Metodología (interna)', '', ...docs.map((d) => `- [${d.titulo}](${at(`/metodologia/${d.slug}.md`)}): ${d.resumen}`), '');
write('llms.txt', llms.join('\n'));

console.log(`public/ generado: ${listSystems().length} sistema(s), ${docs.length} guías de metodología${ROUTE ? `, publicado bajo ${ROUTE}` : ''}`);
