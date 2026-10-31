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
//   /en/…                         lo mismo (salvo el registry y el directorio) para los sistemas traducidos al inglés
//
// Con --exportar (ds build), los enlaces absolutos de estos archivos llevan delante la ruta de publicación
// (publicacion.ruta o DS_RUTA), igual que las páginas: /ds/<sistema>/design.md. Sin ella, nada cambia.
import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';
import { PLATFORM_SECTIONS, ROOT, TRADUCCIONES, languagePrefix, listSystems, loadDocs, loadEntries, loadPages, loadProductionTokens, loadSyncReport, localeMeta, localizeSystem, modeLabel, publicationRoute, readTranslation, routeMarkdown, systemLanguages, systemsIn, tokenModes, tokenValue, withRoute } from '../lib/core.mjs';
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

/** Lo que escribe este script con sus propias palabras, en cada idioma. */
const TEXT = {
  es: {
    title: 'Sistemas de diseño',
    intro: [
      '> Sistemas de diseño agentic-first. Cada página tiene su versión Markdown en la misma ruta terminada en `.md`.',
      '> Empieza por el design.md del sistema. Usa solo fichas «En producción» salvo que te pidan lo contrario; las que están en exploración o desarrollo aún no existen en producción. Si algo no está documentado, dilo en lugar de inventarlo.',
    ],
    states: 'Estados',
    directory: 'Directorio',
    directoryLine: 'un sistema por tarjeta, con su cobertura y el enlace a su registry',
    noImplementation: (status) => `Estado: ${status}. Sin implementación documentada.`,
    production: 'Enlace con producción',
    productionHead: '| Fuente | Estado | Huella |',
    design: 'reglas, API de clases, tokens y estados',
    registry: (r) => `índice de piezas; cada una en \`${r}\` con su estado, lo que usa, sus fuentes y su sync`,
    llmsFull: 'todas las fichas en un archivo',
    docs: 'Docs',
    others: 'Otros',
    methodology: 'Metodología (interna)',
    generated: '<!-- Todo lo que sigue se genera desde las fichas y el sync. No se edita a mano. -->',
    classApi: 'API pública de clases (solo «En producción»)',
    exactNames: 'Usa exactamente estos nombres. No inventes sinónimos.',
    entries: 'Fichas',
    tokens: (commit) => `Tokens de producción${commit ? ` (commit ${commit})` : ''}`,
    modes: 'Modos',
    value: 'Valor',
  },
  en: {
    title: 'Design systems',
    intro: [
      '> Agentic-first design systems. Every page has a Markdown version at the same path ending in `.md`.',
      '> Start with the system’s design.md. Use only entries that are “In production” unless told otherwise; the ones in exploration or development don’t exist in production yet. If something isn’t documented, say so instead of making it up.',
    ],
    states: 'Statuses',
    directory: 'Directory',
    directoryLine: 'one card per system, with its coverage and a link to its registry',
    noImplementation: (status) => `Status: ${status}. No documented implementation.`,
    production: 'Link to production',
    productionHead: '| Source | Status | Fingerprint |',
    design: 'rules, class API, tokens and statuses',
    registry: (r) => `index of pieces (in the system’s main language); each one in \`${r}\` with its status, what it uses, its sources and its sync`,
    llmsFull: 'every entry in one file',
    docs: 'Docs',
    others: 'Others',
    methodology: 'Methodology (internal)',
    generated: '<!-- Everything below is generated from the entries and the sync. Do not edit it by hand. -->',
    classApi: 'Public class API (“In production” only)',
    exactNames: 'Use exactly these names. Do not invent synonyms.',
    entries: 'Entries',
    tokens: (commit) => `Production tokens${commit ? ` (commit ${commit})` : ''}`,
    modes: 'Modes',
    value: 'Value',
  },
};

// Con varios sistemas, el Directorio: lo que ve la portada (/) y lo que lee un agente para elegir sistema.
const directory = loadDirectoryIndex({ at });
if (directory) write('directorio.json', JSON.stringify(directory, null, 2) + '\n');

/** Cabecera de un llms.txt en un idioma. */
function llmsHeader(lang) {
  const t = TEXT[lang];
  const { STATUSES } = localeMeta(lang);
  return [
    `# ${directory?.nombre ?? t.title}`,
    '',
    ...(directory?.descripcion ? [`> ${directory.descripcion}`, ''] : []),
    ...t.intro,
    '',
    `## ${t.states}`,
    '',
    ...Object.values(STATUSES).map((s) => `- ${s.label}: ${s.descripcion}`),
    '',
    ...(directory && lang === 'es' ? [`## ${t.directory}`, '', `- [directorio.json](${at('/directorio.json')}): ${t.directoryLine}`, ''] : []),
  ];
}

/**
 * Los archivos de un sistema en un idioma (fichas en .md, Docs, design.md, llms-full.txt) y sus líneas de llms.txt.
 * En el idioma principal van en la raíz; en una traducción, bajo /<idioma>/.
 */
function publishSystem(system, lang) {
  const t = TEXT[lang];
  const { CONTENT_SECTIONS, FUNCIONES, KIT_PAGES, PLATFORMS, STATUSES, SYNC_STATES } = localeMeta(lang);
  const prefix = languagePrefix(system, lang);
  const own = localizeSystem(system, lang);
  const entries = loadEntries(system, lang);
  const report = loadSyncReport(system);
  const tokens = loadProductionTokens(system);
  const statusLabel = (s) => STATUSES[s]?.label ?? s;
  const dir = `${prefix.slice(1)}${prefix ? '/' : ''}${system.id}`;

  /** Una ficha completa en Markdown: frontmatter, cuerpo común y una sección por plataforma. */
  const entryMarkdown = (entry) => {
    const sync = report?.entradas?.[entry.id];
    const front = { ...entry.data, id: entry.id, url: at(entry.href), sync: sync?.estado ?? null, ...(entry.traduccion ? { idioma: lang, traduccion: entry.traduccion } : {}) };
    const parts = [`---\n${YAML.stringify(front).trim()}\n---`, `# ${entry.titulo}`, entry.resumen, md(entry.body.trim())];
    for (const [platform, info] of Object.entries(entry.platforms)) {
      if (info.body.trim()) parts.push(`# ${PLATFORMS[platform]}\n\n${md(info.body.trim())}`);
      else if (PLATFORM_SECTIONS.includes(entry.section)) parts.push(`# ${PLATFORMS[platform]}\n\n${t.noImplementation(statusLabel(info.estado))}`);
    }
    if (sync?.fuentes?.length) {
      parts.push(`# ${t.production}\n\n${t.productionHead}\n| --- | --- | --- |\n` + sync.fuentes.map((f) => `| \`${f.fuente}\` | ${SYNC_STATES[f.estado]?.label ?? f.estado} | ${f.huella ?? '—'} |`).join('\n'));
    }
    return parts.filter(Boolean).join('\n\n') + '\n';
  };

  /** Subgrupo de una ficha en llms.txt: los componentes, por función; bloques y gráficos, por categoría. */
  const llmsGroup = (entry) => {
    const section = CONTENT_SECTIONS.find((s) => s.id === entry.section);
    if (entry.section === 'componentes') return FUNCIONES[entry.data.funcion] ?? t.others;
    if (section?.agrupar === 'categoria') return section.categorias?.[categoria(entry)] ?? categoria(entry) ?? t.others;
    return null;
  };

  for (const entry of entries) write(`${dir}/${entry.section}/${entry.slug}.md`, entryMarkdown(entry));
  // Las páginas propias de Docs; las del kit (Producción, Para agentes) se generan en la interfaz.
  const pages = loadPages(system, lang).filter((p) => !KIT_PAGES.some((k) => k.slug === p.slug));
  for (const page of pages) write(page.slug ? `${dir}/docs/${page.slug}.md` : `${dir}/docs.md`, `# ${page.titulo}\n\n${page.resumen}\n\n${md(page.body.trim())}\n`);

  // design.md: criterio escrito a mano + mecánica generada (nunca se desincroniza).
  const designFile = path.join(system.dir, 'DESIGN.md');
  const designSource = !fs.existsSync(designFile) ? null : prefix ? readTranslation(designFile, lang).body : fs.readFileSync(designFile, 'utf8');
  const handwritten = designSource ? md(designSource.trim()) : `# ${own.nombre}`;
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
    const label = (m) => modeLabel(m, lang);
    const how = modes.length ? `${t.modes}: ${modes.map((m) => `${label(m)}${selectors?.[m] ? ` (${selectors[m].map((s) => `\`${s}\``).join(', ')})` : ''}`).join(' · ')}.\n\n` : '';
    const head = `| Token | ${modes.length ? modes.map(label).join(' | ') : t.value} |\n| --- |${' --- |'.repeat(columns.length)}`;
    const rows = Object.entries(values).map(([k, v]) => `| \`--${k}\` | ${columns.map((m) => { const x = tokenValue(v, m); return x === undefined ? '—' : `\`${x}\``; }).join(' | ')} |`);
    return `### ${system.produccion?.superficies?.[surface]?.nombre ?? surface}\n\n${how}${head}\n${rows.join('\n')}`;
  }).join('\n\n');
  const generated = [
    '---',
    '',
    t.generated,
    '',
    `## ${t.states}`,
    '',
    ...Object.values(STATUSES).map((s) => `- **${s.label}:** ${s.descripcion}`),
    '',
    `## ${t.classApi}`,
    '',
    t.exactNames,
    '',
    ...classApi,
    '',
    `## ${t.entries}`,
    '',
    bySection,
    '',
    `## ${t.tokens(report?.commit)}`,
    '',
    tokenTable,
    '',
  ].join('\n');
  write(`${dir}/design.md`, `${handwritten}\n\n${generated}`);
  write(`${dir}/llms-full.txt`, entries.map(entryMarkdown).join('\n\n---\n\n'));

  const llms = [];
  llms.push(`## ${own.nombre}`, '', `- [design.md](${at(`/${dir}/design.md`)}): ${t.design}`, `- [registry.json](${at(`/${system.id}/registry.json`)}): ${t.registry(at(`/${system.id}/r/<sección>/<slug>.json`))}`, `- [llms-full.txt](${at(`/${dir}/llms-full.txt`)}): ${t.llmsFull}`, '');
  llms.push(`### ${t.docs}`, '', ...pages.map((p) => `- [${p.titulo}](${at(`/${dir}/${p.slug ? `docs/${p.slug}` : 'docs'}.md`)})${p.resumen ? `: ${p.resumen}` : ''}`), '');
  const line = (e) => `- [${e.titulo}](${at(e.href)}.md): ${statusLabel(e.estado)}. ${e.resumen}`;
  for (const section of CONTENT_SECTIONS) {
    const list = entries.filter((e) => e.section === section.id);
    if (!list.length) continue;
    llms.push(`### ${section.label}`, '');
    const groups = [...new Set(list.map(llmsGroup))];
    if (groups.length === 1 && groups[0] === null) llms.push(...list.map(line), '');
    else for (const group of groups) llms.push(`#### ${group}`, '', ...list.filter((e) => llmsGroup(e) === group).map(line), '');
  }
  return llms;
}

/** La metodología en un idioma (solo si algún sistema de ese idioma la activa) y sus líneas de llms.txt. */
function publishDocs(systems, lang, prefix) {
  const docs = systems.some((s) => s.metodologia) ? loadDocs(lang) : [];
  const base = prefix ? `${prefix.slice(1)}/` : '';
  for (const doc of docs) write(`${base}metodologia/${doc.slug}.md`, `# ${doc.titulo}\n\n${doc.resumen}\n\n${md(doc.body.trim())}\n`);
  return { count: docs.length, llms: docs.length ? [`## ${TEXT[lang].methodology}`, '', ...docs.map((d) => `- [${d.titulo}](${at(`${prefix}/metodologia/${d.slug}.md`)}): ${d.resumen}`), ''] : [] };
}

// El idioma principal: todo en la raíz, con el registry y las instantáneas de producción.
const systems = listSystems();
const mainLang = systems[0] ? systemLanguages(systems[0]).principal : 'es';
const llms = llmsHeader(mainLang);
for (const system of systems) {
  const { entries, index, piece, avisos } = loadRegistry(system, { at });
  copyDir(path.join(system.dir, 'produccion'), `_ds/${system.id}/produccion`);
  copyDir(path.join(system.dir, 'experimental'), `_ds/${system.id}/experimental`);
  // registry.json es el índice; cada pieza tiene su JSON en r/. Un agente elige en el índice y lee solo lo que usa.
  write(`${system.id}/registry.json`, JSON.stringify(index, null, 2) + '\n');
  for (const entry of entries) write(`${system.id}/r/${entry.section}/${entry.slug}.json`, JSON.stringify(piece(entry), null, 2) + '\n');
  for (const aviso of avisos) console.warn(`aviso ${system.id}: ${aviso}`);
  llms.push(...publishSystem(system, systemLanguages(system).principal));
}
// La metodología es interna: se publica solo si algún sistema la activa.
const docs = publishDocs(systems, 'es', '');
llms.push(...docs.llms);
write('llms.txt', llms.join('\n'));

// Las traducciones: /en/llms.txt y, bajo /en/, los archivos de los sistemas que la tienen.
const translated = [];
for (const lang of TRADUCCIONES) {
  const list = systemsIn(lang);
  if (!list.length) continue;
  const lines = llmsHeader(lang);
  for (const system of list) lines.push(...publishSystem(system, lang));
  lines.push(...publishDocs(list, lang, `/${lang}`).llms);
  write(`${lang}/llms.txt`, lines.join('\n'));
  translated.push(`${lang} (${list.length})`);
}

console.log(`public/ generado: ${systems.length} sistema(s), ${docs.count} guías de metodología${translated.length ? `, traducido a ${translated.join(', ')}` : ''}${ROUTE ? `, publicado bajo ${ROUTE}` : ''}`);
