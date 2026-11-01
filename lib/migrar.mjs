// Migraciones del contenido de un sistema entre versiones mayores del kit. Las usa `ds migrar`: sin --aplicar,
// solo enseña lo que haría. Escribe en el repo del sistema, nunca en producción.
//
//   2.0  content/tokens/ → content/fundamentos/: cada ficha de tokens se junta con el fundamento del mismo slug
//        (su lista `tokens` y su texto, en el apartado «## Tokens») o, si no lo hay, pasa a ser ese fundamento.
//        Los ids `tokens/<slug>` de `relacionados` y `usa`, los enlaces a /<id>/tokens/<slug> y las claves del lock
//        pasan a `fundamentos/<slug>`.
import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';

const FRONT = /^---\n([\s\S]*?)\n---\n?/;
// Al reescribir un frontmatter: sin plegar líneas largas y con las listas cortas como estaban ([a, b]).
const YAML_OUT = { lineWidth: 0, flowCollectionPadding: false };

function readFicha(file) {
  const src = fs.readFileSync(file, 'utf8');
  const match = FRONT.exec(src);
  return { doc: YAML.parseDocument(match ? match[1] : ''), body: match ? src.slice(match[0].length) : src };
}
const writeFicha = (file, doc, body) => fs.writeFileSync(file, `---\n${doc.toString(YAML_OUT).trimEnd()}\n---\n${body}`);

/** El índice de una ficha: `slug.md` o `slug/index.md`. null si no es una ficha. */
function fichaFile(dir, name) {
  const full = path.join(dir, name);
  if (fs.statSync(full).isDirectory()) return fs.existsSync(path.join(full, 'index.md')) ? { slug: name, file: path.join(full, 'index.md'), folder: full } : null;
  return name.endsWith('.md') ? { slug: name.replace(/\.md$/, ''), file: full, folder: null } : null;
}

const tokenName = (t) => String(typeof t === 'string' ? t : t?.nombre ?? '').replace(/^--/, '');

/** Añade `text` al apartado `## Tokens` del cuerpo (al final de ese apartado) o lo crea al final. */
function appendToTokensSection(body, text) {
  if (!text.trim()) return body;
  const lines = body.replace(/\s+$/, '').split('\n');
  const start = lines.findIndex((l) => /^##\s+tokens\s*$/i.test(l));
  if (start < 0) return `${lines.join('\n')}\n\n## Tokens\n\n${text.trim()}\n`;
  const next = lines.findIndex((l, i) => i > start && /^#{1,2}\s/.test(l));
  const end = next < 0 ? lines.length : next;
  const section = lines.slice(start, end).join('\n').replace(/\s+$/, '');
  return [...lines.slice(0, start), `${section}\n\n${text.trim()}\n`, ...lines.slice(end)].join('\n').replace(/\s+$/, '') + '\n';
}

/** Cambia los ids `tokens/x` por `fundamentos/x` en `relacionados` y `usa`, y quita los que apuntan a la propia ficha. */
function rewriteIds(doc, selfId) {
  let changed = false;
  for (const key of ['relacionados', 'usa']) {
    const seq = doc.get(key, true);
    if (!YAML.isSeq(seq)) continue;
    const before = seq.items.map((n) => String(YAML.isScalar(n) ? n.value : n));
    const after = [...new Set(before.map((id) => id.replace(/^tokens\//, 'fundamentos/')))].filter((id) => id !== selfId);
    if (after.join('\n') === before.join('\n')) continue;
    changed = true;
    if (after.length) {
      const node = doc.createNode(after);
      node.flow = seq.flow;
      doc.set(key, node);
    } else doc.delete(key);
  }
  return changed;
}

/** Enlaces del Markdown a las páginas de tokens del sistema: /<id>/tokens/<slug> → /<id>/fundamentos/<slug>#tokens. */
function rewriteLinks(text, systemId) {
  return text
    .replace(new RegExp(`\\]\\(/${systemId}/tokens/([\\w-]+)(?:\\.md)?\\)`, 'g'), `](/${systemId}/fundamentos/$1#tokens)`)
    .replace(new RegExp(`\\]\\(/${systemId}/tokens\\)`, 'g'), `](/${systemId}/fundamentos)`);
}

/**
 * Plan de la migración de content/tokens/ (2.0) en el sistema de `dir`. Devuelve qué hará con cada ficha, los avisos
 * para la persona y `aplicar()`, que lo escribe. Sin content/tokens/, el plan está vacío.
 */
export function planTokensMigration(dir, systemId) {
  const tokensDir = path.join(dir, 'content', 'tokens');
  const fundamentosDir = path.join(dir, 'content', 'fundamentos');
  /** @type {Array<{ origen: string; destino: string; accion: 'juntar' | 'mover'; tokens: number }>} */
  const fichas = [];
  const avisos = [];
  const steps = [];
  if (!fs.existsSync(tokensDir)) return { fichas, cambios: [], avisos, aplicar: () => [] };

  const rel = (file) => path.relative(dir, file);
  for (const name of fs.readdirSync(tokensDir).sort()) {
    const source = fichaFile(tokensDir, name);
    if (!source) continue;
    const { doc, body } = readFicha(source.file);
    const list = doc.toJS()?.tokens ?? [];
    const selfId = `fundamentos/${source.slug}`;
    if (source.folder && fs.readdirSync(source.folder).some((n) => n !== 'index.md')) avisos.push(`${rel(source.folder)} tiene más archivos que index.md: solo se mueve index.md; revisa el resto a mano.`);
    const targetFile = [path.join(fundamentosDir, `${source.slug}.md`), path.join(fundamentosDir, source.slug, 'index.md')].find((f) => fs.existsSync(f));

    if (!targetFile) {
      // Sin fundamento con el mismo slug: la ficha de tokens pasa a ser ese fundamento, tal cual.
      const destino = path.join(fundamentosDir, `${source.slug}.md`);
      fichas.push({ origen: rel(source.file), destino: rel(destino), accion: 'mover', tokens: list.length });
      steps.push(() => {
        rewriteIds(doc, selfId);
        fs.mkdirSync(fundamentosDir, { recursive: true });
        writeFicha(destino, doc, rewriteLinks(body, systemId));
        fs.rmSync(source.folder ?? source.file, { recursive: true });
      });
      continue;
    }

    // Con fundamento: manda su frontmatter; se le añaden la lista de tokens y, en «## Tokens», el texto de la ficha.
    const target = readFicha(targetFile);
    const data = target.doc.toJS() ?? {};
    const sourceData = doc.toJS() ?? {};
    if (sourceData.estado && data.estado && sourceData.estado !== data.estado) avisos.push(`${rel(targetFile)} está en «${data.estado}» y ${rel(source.file)}, en «${sourceData.estado}»: se queda «${data.estado}». Revísalo.`);
    const previous = data.tokens ?? [];
    if (previous.length) avisos.push(`${rel(targetFile)} ya tenía tokens: se juntan con los de ${rel(source.file)} (sin repetir nombres).`);
    fichas.push({ origen: rel(source.file), destino: rel(targetFile), accion: 'juntar', tokens: list.length });
    if (/ficha de tokens|fichas de tokens/i.test(target.body)) avisos.push(`${rel(targetFile)} habla de «la ficha de tokens»: ahora los tokens están en la misma página. Revisa esa frase.`);
    steps.push(() => {
      const names = new Set(list.map(tokenName));
      // Un nombre suelto del fundamento que la ficha de tokens documenta con su rol se queda con el rol.
      const merged = [...previous.filter((t) => !names.has(tokenName(t))), ...list];
      target.doc.set('tokens', previous.length ? target.doc.createNode(merged) : doc.get('tokens', true));
      if (!data.grupo && sourceData.grupo) target.doc.set('grupo', sourceData.grupo);
      rewriteIds(target.doc, selfId);
      writeFicha(targetFile, target.doc, rewriteLinks(appendToTokensSection(target.body, body), systemId));
      fs.rmSync(source.folder ?? source.file, { recursive: true });
    });
  }

  // Las demás fichas, DESIGN.md y las páginas de Docs: ids en el frontmatter y enlaces en el texto.
  const migrated = new Set(fichas.flatMap((f) => [f.origen, f.destino]));
  const others = [];
  const walk = (folder) => {
    if (!fs.existsSync(folder)) return;
    for (const name of fs.readdirSync(folder).sort()) {
      const full = path.join(folder, name);
      if (fs.statSync(full).isDirectory()) walk(full);
      else if (name.endsWith('.md') && !full.startsWith(tokensDir + path.sep) && !migrated.has(rel(full))) others.push(full);
    }
  };
  walk(path.join(dir, 'content'));
  if (fs.existsSync(path.join(dir, 'DESIGN.md'))) others.push(path.join(dir, 'DESIGN.md'));
  const cambios = [];
  for (const file of others) {
    const { doc, body } = readFicha(file);
    const hasFront = FRONT.test(fs.readFileSync(file, 'utf8'));
    const idsChanged = hasFront && rewriteIds(doc, null);
    const newBody = rewriteLinks(body, systemId);
    if (!idsChanged && newBody === body) continue;
    cambios.push({ archivo: rel(file), motivo: [idsChanged && 'ids tokens/… → fundamentos/…', newBody !== body && 'enlaces a /tokens/ → /fundamentos/'].filter(Boolean).join(' y ') });
    steps.push(() => (hasFront ? writeFicha(file, doc, newBody) : fs.writeFileSync(file, newBody)));
  }

  // Las huellas revisadas: las claves `tokens/<slug>` pasan a `fundamentos/<slug>`.
  const lockFile = path.join(dir, 'produccion.lock.json');
  const lock = fs.existsSync(lockFile) ? JSON.parse(fs.readFileSync(lockFile, 'utf8')) : null;
  if (lock?.entradas && Object.keys(lock.entradas).some((k) => k.startsWith('tokens/'))) {
    cambios.push({ archivo: rel(lockFile), motivo: 'claves tokens/… → fundamentos/…' });
    steps.push(() => {
      const entradas = {};
      for (const [key, value] of Object.entries(lock.entradas)) {
        const id = key.replace(/^tokens\//, 'fundamentos/');
        entradas[id] = { ...entradas[id], ...value };
      }
      fs.writeFileSync(lockFile, JSON.stringify({ ...lock, entradas }, null, 2) + '\n');
    });
  }

  // La copia de la plantilla en AGENTS.md todavía lista la sección `tokens`.
  const agentsFile = path.join(dir, 'AGENTS.md');
  const OLD_SECTIONS = '`fundamentos`, `tokens`, `componentes`';
  if (fs.existsSync(agentsFile) && fs.readFileSync(agentsFile, 'utf8').includes(OLD_SECTIONS)) {
    cambios.push({ archivo: rel(agentsFile), motivo: 'la tabla del mapa ya no lista la sección tokens' });
    steps.push(() => fs.writeFileSync(agentsFile, fs.readFileSync(agentsFile, 'utf8').replace(OLD_SECTIONS, '`fundamentos` (con la lista de sus tokens), `componentes`')));
  }

  const aplicar = () => {
    for (const step of steps) step();
    if (fs.existsSync(tokensDir) && !fs.readdirSync(tokensDir).filter((n) => n !== '.DS_Store').length) fs.rmSync(tokensDir, { recursive: true });
    return [...fichas.map((f) => f.destino), ...cambios.map((c) => c.archivo)];
  };
  return { fichas, cambios, avisos, aplicar };
}
