#!/usr/bin/env node
// CLI del kit. Salvo `instalar` e `init`, se ejecuta desde el repo de un sistema de diseño (la carpeta con system.json).
// `dev`, `build` y `doctor` también funcionan en un repo de directorio (directorio.json), que sirve juntos varios sistemas.
//
//   ds instalar [--aqui] [--quitar]  instala la skill de montaje para Claude Code y Codex (en tu usuario; con --aqui, en esta carpeta)
//   ds init "<Nombre>" [id]   crea el repo del sistema: plantilla, kit y skills (sin nombre, pregunta en la terminal)
//        [--carpeta <ruta>] [--desde repo|web|figma|cero] [--produccion <ruta>] [--url <url>] [--kit <paquete>] [--json]
//   ds init --directorio ["<Nombre>"] [--carpeta <ruta>] [--sistemas <ruta>,<ruta>]   crea un repo de directorio
//   ds info [--json]          sistema, secciones, producción, último sync, skills y rutas del kit
//   ds search <texto> [--seccion <id>] [--limite 10] [--json]   busca fichas antes de crear una (con --json, como en registry.json)
//   ds ver <pieza>            el JSON de una pieza, igual que /<sistema>/r/<sección>/<slug>.json (id o slug)
//   ds dev [--port 4100]      servidor de desarrollo con el contenido de este repo
//   ds build                  exporta el sitio estático a ./out (bajo publicacion.ruta o DS_RUTA, si la hay)
//   ds preset ver <preset>    lee un preset del Lab (código, enlace o JSON): valores y contraste
//   ds preset aplicar <preset> [--solo color,texto,espaciado,radios,sombras,movimiento] [--archivo tokens.css]
//        [--sobrescribir] [--aceptar-contraste]   escribe el preset en experimental/, nunca en producción
//   ds preset resolver        el preset de experimental/tokens.css y el enlace para abrirlo en el Lab (--port si ds dev usa otro)
//   ds sync [--accept <id>]   lee producción: instantánea CSS, tokens, huellas e informe
//   ds check                  falla si algo está desajustado, ausente o inventado
//   ds patrones [--min-hojas 2] [--min-rasgos 1] [--limite 20] [--todos] [--json]   clases de hojas y prefijos distintos con la misma forma
//        (radio, sombra, fondo, borde, relleno y tokens), leídas de la instantánea de ds sync: piezas candidatas
//   ds skills                 copia (o actualiza) las skills del kit en .claude/skills/ y .agents/skills/
//   ds doctor                 comprueba la configuración del sistema
//   ds version                versión del kit instalada
//   ds enlazar <ruta-al-kit>  usa un checkout local del kit (para pulir la interfaz con datos reales)
//   ds desenlazar             vuelve a la versión del kit fijada en package.json
//
// El motor (Next + scripts) vive en el kit. Si el kit está instalado dentro de node_modules,
// se copia a .ds/kit para ejecutarlo; si está enlazado (npm link), se ejecuta en su sitio y
// los cambios en el kit se ven al momento.
import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import readline from 'node:readline/promises';
import { fileURLToPath } from 'node:url';

const KIT = fs.realpathSync(path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'));
const SITE = process.cwd();
const [command = 'ayuda', ...args] = process.argv.slice(2);
const kitPkg = JSON.parse(fs.readFileSync(path.join(KIT, 'package.json'), 'utf8'));

/** Skill con la que empieza todo: `ds instalar` la deja en la carpeta de usuario de cada agente. */
const ENTRY_SKILL = 'montar-sistema';
/** Skills que cambiaron de nombre: `ds skills` borra la copia antigua. */
const RENAMED_SKILLS = ['crear-sistema'];
/** Dónde lee las skills cada agente: Claude Code y Codex. */
const SKILL_DIRS = [['.claude', 'skills'], ['.agents', 'skills']];
/** Lo que puede haber en la carpeta antes de `ds init` (lo que dejan git init y npm init). */
const INIT_ALLOWED = new Set(['.git', '.gitignore', '.DS_Store', 'package.json', 'package-lock.json', 'node_modules', 'README.md', 'system.json', 'directorio.json']);
/** Un repo de directorio: lista los sistemas que se sirven juntos, con el Directorio en la portada. */
const DIRECTORY_FILE = 'directorio.json';
const ORIGINS = ['repo', 'web', 'figma', 'cero'];

// Opciones: `--clave valor` e interruptores (`--json`). El resto son argumentos posicionales.
const VALUE_OPTIONS = new Set(['--sistemas', '--carpeta', '--desde', '--produccion', '--url', '--kit', '--seccion', '--limite', '--port', '--accept', '--solo', '--archivo', '--min-hojas', '--min-rasgos']);
const option = (name) => {
  const at = args.indexOf(name);
  return at >= 0 ? args[at + 1] : undefined;
};
const flag = (name) => args.includes(name);
const positional = args.filter((a, i) => !a.startsWith('--') && !VALUE_OPTIONS.has(args[i - 1]));
const JSON_OUT = flag('--json');
// Con --json, la salida estándar es solo el JSON: los mensajes van a stderr.
const log = (...msg) => (JSON_OUT ? console.error : console.log)(...msg);

const fail = (msg) => {
  console.error(`ds: ${msg}`);
  process.exit(1);
};
const readJson = (file) => (fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : null);
const slugify = (text) => text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
/** `child` está dentro de `parent` (o es la misma carpeta). */
const isInside = (parent, child) => {
  const rel = path.relative(parent, child);
  return !rel.startsWith('..') && !path.isAbsolute(rel);
};
/** Archivos de una carpeta que impiden crear el sistema en ella. */
const foreignFiles = (dir) => (fs.existsSync(dir) ? fs.readdirSync(dir).filter((name) => !INIT_ALLOWED.has(name)) : []);

function requireSystem() {
  if (!fs.existsSync(path.join(SITE, 'system.json'))) fail('no hay system.json en esta carpeta. Ejecuta «ds init "<Nombre>"» o entra en el repo del sistema.');
}

/** El directorio.json de esta carpeta con las rutas de sus sistemas ya resueltas, o null. */
function readDirectory() {
  const config = readJson(path.join(SITE, DIRECTORY_FILE));
  if (!config) return null;
  const sistemas = (config.sistemas ?? []).map((rel) => path.resolve(SITE, rel));
  if (!sistemas.length) fail(`${DIRECTORY_FILE} no lista ningún sistema. Añade sus carpetas: "sistemas": ["../mi-design-system"].`);
  const missing = sistemas.filter((dir) => !fs.existsSync(path.join(dir, 'system.json')));
  if (missing.length) fail(`${DIRECTORY_FILE}: no hay system.json en ${missing.join(', ')}`);
  return { ...config, sistemas };
}

/** dev, build y doctor: el repo de un sistema o el de un directorio. */
function requireSite() {
  if (fs.existsSync(path.join(SITE, 'system.json'))) return;
  if (readDirectory()) return;
  fail(`no hay system.json ni ${DIRECTORY_FILE} en esta carpeta. Entra en el repo de un sistema o de un directorio.`);
}

/** Qué sistemas lee el motor: el de esta carpeta o, en un directorio, todos los que lista. */
function siteEnv() {
  if (fs.existsSync(path.join(SITE, 'system.json')) || !fs.existsSync(path.join(SITE, DIRECTORY_FILE))) return { DS_SISTEMAS: SITE, DS_DIRECTORIO: '' };
  return { DS_SISTEMAS: readDirectory().sistemas.join(path.delimiter), DS_DIRECTORIO: path.join(SITE, DIRECTORY_FILE) };
}

/**
 * Cómo se instala esta misma versión del kit. Si el kit llegó como dependencia (de un sistema o de npx),
 * lo que fija ese package.json; si no, nombre@versión. `--kit` lo sustituye.
 */
function kitSpec() {
  if (option('--kit')) return option('--kit');
  const parts = KIT.split(path.sep);
  const at = parts.lastIndexOf('node_modules');
  if (at > 0) {
    const owner = parts.slice(0, at).join(path.sep) || path.sep;
    const pkg = readJson(path.join(owner, 'package.json'));
    const spec = pkg?.dependencies?.[kitPkg.name] ?? pkg?.devDependencies?.[kitPkg.name];
    if (spec?.startsWith('file:')) return path.resolve(owner, spec.slice(5));
    if (spec) return /^[\^~<>=*\d]|^latest$/.test(spec) ? `${kitPkg.name}@${spec}` : spec;
  }
  return `${kitPkg.name}@${kitPkg.version}`;
}

/** Carpeta desde la que se ejecuta el motor. */
function runtimeDir() {
  if (!KIT.split(path.sep).includes('node_modules')) return KIT;
  const target = path.join(SITE, '.ds', 'kit');
  const stamp = path.join(target, '.version');
  const version = `${kitPkg.version}:${fs.statSync(path.join(KIT, 'package.json')).mtimeMs}`;
  if (!fs.existsSync(stamp) || fs.readFileSync(stamp, 'utf8') !== version) {
    fs.rmSync(target, { recursive: true, force: true });
    const skip = new Set(['node_modules', '.next', '.next-build', 'out', 'public', '.git']);
    fs.cpSync(KIT, target, { recursive: true, filter: (src) => !skip.has(path.basename(src)) || path.dirname(src) !== KIT });
    fs.writeFileSync(stamp, version);
  }
  return target;
}

function run(cmd, cmdArgs, { cwd, env = {} } = {}) {
  return new Promise((resolve) => {
    const child = spawn(cmd, cmdArgs, { cwd, stdio: 'inherit', env: { ...process.env, ...siteEnv(), ...env } });
    child.on('exit', (code) => resolve(code ?? 1));
  });
}

const node = (dir, script, extra = []) => run(process.execPath, [path.join(dir, script), ...extra], { cwd: dir });
const nextBin = (dir) => {
  // Next se resuelve desde la carpeta de ejecución hacia arriba (kit enlazado o node_modules del sistema).
  for (let d = dir; ; d = path.dirname(d)) {
    const bin = path.join(d, 'node_modules', 'next', 'dist', 'bin', 'next');
    if (fs.existsSync(bin)) return bin;
    if (path.dirname(d) === d) fail('no encuentro Next. Ejecuta npm install.');
  }
};

/** El núcleo del kit leyendo el sistema de esta carpeta (para info, search y ver, sin arrancar Next). */
async function loadCore() {
  process.env.DS_SISTEMAS = SITE;
  return { ...(await import('../lib/core.mjs')), ...(await import('../lib/registry.mjs')) };
}

function copyTemplate(from, to, replace) {
  for (const name of fs.readdirSync(from)) {
    const src = path.join(from, name);
    const dest = path.join(to, name);
    if (fs.statSync(src).isDirectory()) {
      fs.mkdirSync(dest, { recursive: true });
      copyTemplate(src, dest, replace);
    } else if (!fs.existsSync(dest)) {
      const text = fs.readFileSync(src, 'utf8');
      fs.writeFileSync(dest, Object.entries(replace).reduce((t, [k, v]) => t.replaceAll(k, v), text));
    }
  }
}

/** Copia una skill. Las skills llaman al kit por su paquete: se fija el que se está usando. */
function copySkill(from, to) {
  fs.cpSync(from, to, { recursive: true });
  const file = path.join(to, 'SKILL.md');
  fs.writeFileSync(file, fs.readFileSync(file, 'utf8').replaceAll('ESPEC_DEL_KIT', kitSpec()));
}

/** Copia las skills del kit a las carpetas de Claude Code y Codex de `target`. */
function installSkills(target = SITE) {
  const from = path.join(KIT, 'skills');
  if (!fs.existsSync(from)) return;
  const names = fs.readdirSync(from).filter((name) => fs.statSync(path.join(from, name)).isDirectory());
  for (const parts of SKILL_DIRS) {
    const to = path.join(target, ...parts);
    fs.mkdirSync(to, { recursive: true });
    for (const name of [...names, ...RENAMED_SKILLS]) fs.rmSync(path.join(to, name), { recursive: true, force: true });
    for (const name of names) copySkill(path.join(from, name), path.join(to, name));
  }
  log(`Skills del kit ${kitPkg.version} en .claude/skills/ y .agents/skills/: ${names.join(', ')}`);
}

/** Instala esta versión del kit en `target`, si no está ya, y devuelve cómo se fijó. */
function installKit(target) {
  const spec = kitSpec();
  if (!fs.existsSync(path.join(target, 'node_modules', ...kitPkg.name.split('/'), 'package.json'))) {
    log(`Instalando el kit (${spec})…`);
    const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
    const result = spawnSync(npm, ['install', '--save', spec], { cwd: target, stdio: ['ignore', 2, 2] });
    if (result.status !== 0) fail(`no se pudo instalar el kit. Prueba a mano: cd ${target} && npm install ${spec}`);
  }
  return spec;
}

/** Preguntas de `ds init` en una terminal, para quien no usa agente. Con agente, las hace la skill montar-sistema. */
async function askInTerminal() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const ask = async (question, fallback = '') => (await rl.question(fallback ? `${question} [${fallback}] ` : `${question} `)).trim() || fallback;
  const choose = async (question, options) => {
    console.log(question);
    options.forEach((o, i) => console.log(`  ${i + 1}) ${o}`));
    for (;;) {
      const n = Number(await ask('Número:', '1'));
      if (options[n - 1]) return n - 1;
    }
  };
  try {
    let nombre = '';
    while (!nombre) nombre = await ask('Nombre del producto o del sistema:');
    const origin = await choose('¿De dónde partimos?', ['De un repo con código', 'De una web o de Figma', 'De nada todavía']);
    const out = { nombre, desde: ['repo', 'web', 'cero'][origin] };
    if (origin === 0) out.produccion = await ask('Ruta al repo del producto:', '.');
    if (origin === 1) {
      out.url = await ask('URL de la web o del archivo de Figma:');
      if (/figma\.com/.test(out.url)) out.desde = 'figma';
    }
    const inProduct = out.produccion && isInside(path.resolve(SITE, out.produccion), SITE);
    const fallback = foreignFiles(SITE).length || inProduct ? `../${slugify(nombre)}-design-system` : '.';
    out.carpeta = await ask('Carpeta del sistema:', fallback);
    return out;
  } finally {
    rl.close();
  }
}

/** `ds init --directorio`: un repo que sirve juntos varios sistemas, con el Directorio en la portada. */
function initDirectory() {
  const nombre = positional[0] ?? 'Sistemas de diseño';
  const target = path.resolve(SITE, option('--carpeta') ?? '.');
  const extra = foreignFiles(target);
  if (extra.length) fail(`${target} no está vacía (${extra.slice(0, 3).join(', ')}${extra.length > 3 ? '…' : ''}). El directorio necesita su propia carpeta: usa --carpeta <ruta>.`);
  fs.mkdirSync(target, { recursive: true });
  if (!fs.existsSync(path.join(target, '.git'))) spawnSync('git', ['init', '-q'], { cwd: target, stdio: 'ignore' });
  const pkgFile = path.join(target, 'package.json');
  const pkg = readJson(pkgFile) ?? { name: slugify(nombre) || 'directorio', private: true };
  pkg.scripts = { dev: 'ds dev', build: 'ds build', doctor: 'ds doctor', ...pkg.scripts };
  fs.writeFileSync(pkgFile, JSON.stringify(pkg, null, 2) + '\n');
  const spec = installKit(target);
  const file = path.join(target, DIRECTORY_FILE);
  // Las rutas a los sistemas son relativas a este repo, como produccion.repo en system.json.
  const sistemas = (option('--sistemas') ?? '').split(',').map((s) => s.trim()).filter(Boolean).map((s) => path.relative(target, path.resolve(SITE, s)).split(path.sep).join('/'));
  if (!fs.existsSync(file)) fs.writeFileSync(file, JSON.stringify({ nombre, descripcion: '', sistemas }, null, 2) + '\n');
  if (!fs.existsSync(path.join(target, '.gitignore'))) fs.writeFileSync(path.join(target, '.gitignore'), 'node_modules/\n.ds/\nout/\n');
  const result = { directorio: { nombre, carpeta: target, sistemas }, kit: spec };
  if (JSON_OUT) return console.log(JSON.stringify(result, null, 2));
  console.log(`\nDirectorio «${nombre}» en ${target}.`);
  console.log(sistemas.length ? `Sistemas: ${sistemas.join(', ')}. Siguiente paso: npx ds dev.` : `Siguiente paso: añade las carpetas de los sistemas a "sistemas" en ${DIRECTORY_FILE} y ejecuta npx ds dev.`);
}

const commands = {
  async instalar() {
    const base = flag('--aqui') ? SITE : os.homedir();
    const quitar = flag('--quitar');
    const dests = SKILL_DIRS.map((parts) => path.join(base, ...parts, ENTRY_SKILL));
    for (const dest of dests) {
      fs.rmSync(dest, { recursive: true, force: true });
      if (quitar) continue;
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      copySkill(path.join(KIT, 'skills', ENTRY_SKILL), dest);
    }
    const list = dests.map((d) => `  ${d}`).join('\n');
    if (quitar) return console.log(`Skill ${ENTRY_SKILL} quitada de:\n${list}`);
    console.log(`Skill ${ENTRY_SKILL} (kit ${kitPkg.version}) instalada para Claude Code y Codex en:\n${list}\n`);
    console.log('Abre Claude Code o Codex en el repo de tu producto (o en una carpeta vacía) y escribe:\n\n  monta el sistema de diseño\n');
    console.log(`Para quitarla: npx ${kitSpec()} instalar${flag('--aqui') ? ' --aqui' : ''} --quitar`);
  },
  async init() {
    if (flag('--directorio')) return initDirectory();
    const answers = positional[0] || JSON_OUT || !process.stdin.isTTY ? null : await askInTerminal();
    const nombre = positional[0] ?? answers?.nombre;
    if (!nombre) fail('uso: ds init "<Nombre>" [id] [--carpeta <ruta>] [--desde repo|web|figma|cero] [--produccion <ruta>] [--url <url>] [--json]');
    const id = positional[1] ?? slugify(nombre);
    const prodArg = option('--produccion') ?? answers?.produccion;
    const desde = option('--desde') ?? answers?.desde ?? (prodArg ? 'repo' : 'cero');
    if (!ORIGINS.includes(desde)) fail(`--desde debe ser ${ORIGINS.join(', ')}`);
    if (desde === 'repo' && !prodArg) fail('con --desde repo, indica el repo del producto con --produccion <ruta>');
    const url = option('--url') ?? answers?.url ?? null;
    const produccion = prodArg ? path.resolve(SITE, prodArg) : null;
    if (produccion && !fs.existsSync(produccion)) fail(`no existe el repo de producción: ${produccion}`);
    const target = path.resolve(SITE, option('--carpeta') ?? answers?.carpeta ?? '.');
    const suggestion = `../${id}-design-system`;
    // El sistema vive en su propio repo: nunca dentro del de producción ni encima de otro proyecto.
    if (produccion && isInside(produccion, target)) fail(`la carpeta del sistema está dentro del repo de producción. Usa --carpeta ${suggestion}.`);
    const extra = foreignFiles(target);
    if (extra.length && !fs.existsSync(path.join(target, 'system.json'))) fail(`${target} no está vacía (${extra.slice(0, 3).join(', ')}${extra.length > 3 ? '…' : ''}). El sistema necesita su propia carpeta: usa --carpeta ${suggestion}.`);

    fs.mkdirSync(target, { recursive: true });
    if (!fs.existsSync(path.join(target, '.git'))) spawnSync('git', ['init', '-q'], { cwd: target, stdio: 'ignore' });
    const pkgFile = path.join(target, 'package.json');
    const pkg = readJson(pkgFile) ?? { name: `${id}-design-system`, private: true };
    pkg.scripts = { dev: 'ds dev', build: 'ds build', sync: 'ds sync', 'check:sync': 'ds check', ...pkg.scripts };
    fs.writeFileSync(pkgFile, JSON.stringify(pkg, null, 2) + '\n');

    const spec = installKit(target);

    const sysFile = path.join(target, 'system.json');
    const isNew = !fs.existsSync(sysFile);
    const initials = nombre.split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase().padEnd(2, nombre[1]?.toUpperCase() ?? 'X');
    copyTemplate(path.join(KIT, 'plantilla'), target, { NOMBRE_DEL_SISTEMA: nombre, ID_DEL_SISTEMA: id, '"NN"': `"${initials}"`, 'AAAA-MM-DD': new Date().toISOString().slice(0, 10) });
    // npm no publica archivos .gitignore: la plantilla lo guarda sin punto.
    const gi = path.join(target, 'gitignore');
    if (fs.existsSync(gi)) fs.existsSync(path.join(target, '.gitignore')) ? fs.rmSync(gi) : fs.renameSync(gi, path.join(target, '.gitignore'));
    if (isNew) {
      // De dónde parte el sistema. Sin repo de producción no hay enlace con el código (todavía).
      const system = readJson(sysFile);
      system.origen = { desde, url };
      system.produccion = produccion ? { ...system.produccion, repo: path.relative(target, produccion).split(path.sep).join('/') } : null;
      fs.writeFileSync(sysFile, JSON.stringify(system, null, 2) + '\n');
    }
    installSkills(target);

    const result = { sistema: { id, nombre, carpeta: target, nuevo: isNew }, origen: { desde, url, produccion }, kit: spec };
    if (JSON_OUT) return console.log(JSON.stringify(result, null, 2));
    console.log(`\nSistema «${nombre}» ${isNew ? 'creado' : 'actualizado'} en ${target}.`);
    console.log(`Siguiente paso: abre Claude Code o Codex en esa carpeta y escribe «monta el sistema de diseño» (skill ${ENTRY_SKILL}).`);
  },
  async info() {
    requireSystem();
    const core = await loadCore();
    const [system] = core.listSystems();
    const entries = core.loadEntries(system);
    const report = core.loadSyncReport(system);
    const tally = (values) => values.filter(Boolean).reduce((acc, v) => ({ ...acc, [v]: (acc[v] ?? 0) + 1 }), {});
    const skillsIn = (parts) => {
      const dir = path.join(SITE, ...parts);
      return fs.existsSync(dir) ? fs.readdirSync(dir).filter((n) => fs.statSync(path.join(dir, n)).isDirectory()).sort() : [];
    };
    const prod = system.produccion;
    const prodDir = prod ? path.resolve(SITE, prod.repo) : null;
    const data = {
      kit: { paquete: kitPkg.name, version: kitPkg.version, ruta: KIT, metodologia: path.join(KIT, 'docs', 'metodologia'), enlazado: !KIT.split(path.sep).includes('node_modules') },
      sistema: { id: system.id, nombre: system.nombre, descripcion: system.descripcion ?? '', carpeta: SITE, origen: system.origen ?? null, plataformas: system.plataformas ?? [], metodologia: system.metodologia === true },
      secciones: core.CONTENT_SECTIONS.map((s) => {
        const list = entries.filter((e) => e.section === s.id);
        return { id: s.id, nombre: s.label, carpeta: `content/${(s.carpetas ?? [s.id])[0]}`, categorias: s.categorias ? Object.keys(s.categorias) : null, fichas: list.length, estados: tally(list.map((e) => e.estado)) };
      }),
      docs: core.loadPages(system).map((p) => ({ slug: p.slug, titulo: p.titulo, archivo: p.file })),
      produccion: prod
        ? {
            repo: prodDir,
            existe: fs.existsSync(prodDir),
            rama: prod.rama ?? 'main',
            superficies: Object.keys(prod.superficies ?? {}),
            sync: report ? { fecha: report.generado, commit: report.commit, estados: tally(Object.values(report.entradas ?? {}).map((e) => e.estado)) } : null,
          }
        : null,
      skills: { claude: skillsIn(['.claude', 'skills']), codex: skillsIn(['.agents', 'skills']) },
    };
    if (JSON_OUT) return console.log(JSON.stringify(data, null, 2));
    const origen = data.sistema.origen;
    console.log(`${data.sistema.nombre} (${data.sistema.id}) · kit ${data.kit.version}${data.kit.enlazado ? ' (enlazado)' : ''}`);
    if (origen) console.log(`Origen: ${origen.desde}${origen.url ? ` · ${origen.url}` : ''}`);
    console.log(`Fichas: ${data.secciones.map((s) => `${s.nombre} ${s.fichas}`).join(' · ')}`);
    if (!data.produccion) console.log('Producción: sin enlazar');
    else {
      const sync = data.produccion.sync;
      const estados = sync ? Object.entries(sync.estados).map(([k, v]) => `${v} ${k}`).join(', ') : '';
      console.log(`Producción: ${data.produccion.repo}${data.produccion.existe ? '' : ' (no encontrado)'} · ${sync ? `sync del ${sync.fecha.slice(0, 10)} (${sync.commit})${estados ? `: ${estados}` : ''}` : 'sin sync'}`);
    }
    console.log(`Skills: Claude Code ${data.skills.claude.length} · Codex ${data.skills.codex.length}`);
    console.log(`Metodología: ${data.kit.metodologia}`);
  },
  async search() {
    requireSystem();
    const query = positional.join(' ').trim();
    if (!query) fail('uso: ds search <texto> [--seccion <id>] [--limite 10] [--json]');
    const core = await loadCore();
    const [system] = core.listSystems();
    const { entries, indexEntry } = core.loadRegistry(system);
    const norm = (text = '') => String(text).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    const words = norm(query).split(/\s+/).filter(Boolean);
    const section = option('--seccion');
    const limit = Number(option('--limite') ?? 10);
    // Cada palabra tiene que aparecer en algún campo; pesa más en el id y el título que en el cuerpo.
    const results = entries
      .filter((e) => !section || e.section === section)
      .map((e) => {
        const fields = [[norm(e.id), 5], [norm(e.titulo), 4], [norm(e.resumen), 2], [norm([e.body, ...Object.values(e.platforms).map((p) => p.body)].join('\n')), 1]];
        let score = 0;
        for (const word of words) {
          const hits = fields.filter(([text]) => text.includes(word));
          if (!hits.length) return null;
          score += hits.reduce((sum, [, weight]) => sum + weight, 0);
        }
        return { entry: e, score };
      })
      .filter((r) => r !== null)
      .sort((a, b) => b.score - a.score || a.entry.titulo.localeCompare(b.entry.titulo, 'es'))
      .slice(0, limit)
      // La misma forma que las piezas de registry.json, más el archivo de la ficha en este repo.
      .map(({ entry: e }) => ({ ...indexEntry(e), archivo: e.file }));
    if (JSON_OUT) return console.log(JSON.stringify(results, null, 2));
    if (!results.length) return console.log(`Ninguna ficha coincide con «${query}».`);
    for (const r of results) console.log(`${r.id} · ${r.estado}\n  ${r.titulo}: ${r.resumen}\n  ${r.archivo}`);
  },
  async ver() {
    requireSystem();
    const query = positional[0];
    if (!query) fail('uso: ds ver <pieza> (id, como componentes/boton, o slug)');
    const core = await loadCore();
    const [system] = core.listSystems();
    const { entries, piece } = core.loadRegistry(system);
    const { entry, candidatos } = core.findEntry(entries, query);
    if (!entry) fail(candidatos?.length ? `«${query}» es ambiguo: ${candidatos.join(', ')}` : `no hay ninguna pieza «${query}». Búscala con ds search.`);
    console.log(JSON.stringify(piece(entry), null, 2));
  },
  async dev() {
    requireSite();
    const dir = runtimeDir();
    const portAt = args.indexOf('--port');
    const port = portAt >= 0 ? args[portAt + 1] : '4100';
    if ((await node(dir, 'scripts/build-public.mjs')) !== 0) process.exit(1);
    process.exit(await run(process.execPath, [nextBin(dir), 'dev', '--port', port], { cwd: dir }));
  },
  async build() {
    requireSite();
    const dir = runtimeDir();
    // --exportar: los enlaces de los .md, design.md y llms.txt llevan la ruta de publicación, si la hay.
    if ((await node(dir, 'scripts/build-public.mjs', ['--exportar'])) !== 0) process.exit(1);
    const code = await run(process.execPath, [nextBin(dir), 'build'], { cwd: dir });
    if (code !== 0) process.exit(code);
    fs.rmSync(path.join(SITE, 'out'), { recursive: true, force: true });
    // Con output: 'export', Next 16 deja el sitio exportado en distDir (.next-build).
    fs.cpSync(path.join(dir, '.next-build'), path.join(SITE, 'out'), { recursive: true });
    console.log('Sitio exportado en ./out');
  },
  async preset() {
    requireSystem();
    const [action, input] = positional;
    if (!['ver', 'aplicar', 'resolver'].includes(action)) fail('uso: ds preset ver|aplicar <preset> · ds preset resolver');
    const core = await loadCore();
    const lab = await import('../lib/lab.mjs');
    const { setTokenValues } = await import('../lib/css-tokens.mjs');
    const [system] = core.listSystems();
    const expDir = path.join(SITE, 'experimental');
    const file = path.resolve(expDir, option('--archivo') ?? 'tokens.css');
    if (!isInside(expDir, file) || !file.endsWith('.css')) fail('--archivo tiene que ser un .css dentro de experimental/');
    const rel = path.relative(SITE, file);
    // El enlace apunta a `ds dev`: con otro puerto, `--port` lo cambia también aquí.
    const labUrl = (code) => `http://localhost:${option('--port') ?? '4100'}/${system.id}/lab${code ? `?preset=${code}` : ''}`;
    const savedCode = () => (fs.existsSync(file) ? lab.presetFromCss(fs.readFileSync(file, 'utf8')) : null);

    if (action === 'resolver') {
      const code = savedCode();
      if (JSON_OUT) return console.log(JSON.stringify({ archivo: rel, preset: code, ruta: `/${system.id}/lab${code ? `?preset=${code}` : ''}`, url: labUrl(code) }, null, 2));
      if (!code) return console.log(`${rel} no lo generó el Lab. Con npx ds dev, el Lab abre con los tokens del sistema cargados (pestaña «Ajustar tokens»):\n  ${labUrl(null)}`);
      return console.log(`Preset de ${rel}:\n  ${code}\n\nCon npx ds dev, ábrelo en el Lab:\n  ${labUrl(code)}`);
    }

    if (!input) fail(`uso: ds preset ${action} "<código, enlace del Lab o JSON>"`);
    let read;
    try {
      read = lab.decodePreset(input);
    } catch (error) {
      fail(`el preset no se puede leer (${error instanceof Error ? error.message : error}). Copia el enlace otra vez desde el Lab.`);
    }
    let { preset } = read;
    for (const aviso of read.avisos) log(`aviso: ${aviso}`);

    // --solo: aplica solo esos grupos sobre el preset que ya hay en el archivo (como `shadcn apply --only`).
    const solo = option('--solo')?.split(',').map((g) => g.trim()).filter(Boolean);
    if (solo) {
      const unknown = solo.filter((g) => !lab.GRUPOS.includes(g));
      if (unknown.length) fail(`--solo admite ${lab.GRUPOS.join(', ')} (no ${unknown.join(', ')})`);
      const code = savedCode();
      if (!code) fail(`--solo necesita un ${rel} generado por el Lab sobre el que aplicar`);
      const previous = lab.decodePreset(code).preset;
      if (preset.modo !== 'generar' || previous.modo !== 'generar') fail('--solo solo vale con presets de «Generar»');
      const pick = { color: ['color', 'ajustes'], texto: ['texto'], espaciado: ['espaciado'], radios: ['radio'], sombras: ['sombra'], movimiento: ['movimiento'] };
      preset = { ...previous, ...Object.fromEntries(solo.flatMap((g) => pick[g]).map((key) => [key, preset[key]])) };
    }

    // Los tokens por modo, para medir el contraste: los generados o los del sistema con los ajustes encima.
    const report = core.loadSyncReport(system);
    const experimental = core.loadExperimentalTokens(system);
    let byMode;
    let selectores = null;
    let originales;
    if (preset.modo === 'generar') byMode = lab.deriveTokens(preset).modos;
    else {
      const production = core.loadProductionTokens(system);
      const fromExperimental = preset.base === 'experimental';
      const values = fromExperimental ? experimental?.values : production[preset.base ?? ''];
      if (!values) fail(`el preset ajusta los tokens de «${preset.base}», y este sistema no los tiene`);
      selectores = fromExperimental ? experimental.info.modos : report?.tokens?.[preset.base]?.modos ?? null;
      const modes = core.tokenModes(values, selectores);
      originales = lab.baseByMode(values, modes);
      byMode = lab.baseByMode(values, modes, preset.ajustes);
    }
    const contraste = lab.checkContrast(byMode);
    // Al ajustar, solo cuentan los pares que el preset cambia; los que ya fallaban así se avisan, sin bloquear.
    const touched = (r) => preset.modo === 'generar' || [r.texto, r.fondo].some((t) => preset.ajustes[r.modo]?.[t] !== undefined);
    const failing = contraste.filter((r) => r.ok === false && touched(r));
    const previous = contraste.filter((r) => r.ok === false && !touched(r));
    const below = (n) => `${n} ${n === 1 ? 'par no llega' : 'pares no llegan'} a AA`;
    const describe = (r) => `  ${core.modeLabel(r.modo)}: --${r.texto} sobre --${r.fondo} ${r.ratio}:1 (mínimo ${r.minimo}:1)${r.sugerencia ? ` → --${r.sugerencia.token}: ${r.sugerencia.valor}` : ''}`;

    if (action === 'ver') {
      const code = lab.encodePreset(preset);
      if (JSON_OUT) return console.log(JSON.stringify({ preset, avisos: read.avisos, contraste, css: lab.presetCss(preset, { selectores, originales }), url: labUrl(code) }, null, 2));
      const { color, texto, sombra } = preset;
      if (preset.modo === 'generar') {
        console.log(`Generar · neutro ${color.neutro} · marca ${color.marca} · error ${color.error}`);
        console.log(`Texto: ${texto.sans}${texto.serif ? ` · serif ${texto.serif}` : ''} · ${texto.base} px · escala ${texto.escala} · interlineado ${texto.interlineado}`);
        console.log(`Espaciado ${preset.espaciado} px · radio ${preset.radio} px · sombras ${Math.round(sombra.opacidad * 100)} % × ${sombra.difuminado}`);
        const { movimiento } = preset;
        console.log(movimiento ? `Movimiento: ${movimiento.duracion} ms · escala ${movimiento.escala} · curvas ${lab.CURVAS[movimiento.curva].label.toLowerCase()}` : 'Movimiento: sin tokens (preset anterior al movimiento)');
      } else console.log(`Ajustar los tokens de «${preset.base}»`);
      const ajustes = Object.entries(preset.ajustes).flatMap(([mode, values]) => Object.entries(values).map(([name, value]) => `--${name} (${core.modeLabel(mode)}): ${value}`));
      if (ajustes.length) console.log(`Ajustes a mano:\n${ajustes.map((a) => `  ${a}`).join('\n')}`);
      const measured = contraste.filter((r) => r.ok !== null).length;
      console.log(failing.length ? `Contraste: de ${measured} pares, ${below(failing.length)}:\n${failing.map(describe).join('\n')}` : `Contraste: los pares que cambia el preset llegan a AA.`);
      if (previous.length) console.log(`Ya estaban así (el preset no los cambia): ${below(previous.length)}:\n${previous.map(describe).join('\n')}`);
      return console.log(`Lab: ${labUrl(code)}`);
    }

    // aplicar. Un par por debajo de AA solo se escribe si la persona lo ha aceptado.
    if (failing.length && !flag('--aceptar-contraste')) {
      console.error(`ds: ${below(failing.length)}:\n${failing.map(describe).join('\n')}`);
      fail('no escribo nada. Ajústalos en el Lab (botón «Ajustar») o, si la persona lo acepta, repite con --aceptar-contraste.');
    }
    fs.mkdirSync(expDir, { recursive: true });
    const written = [];
    if (preset.modo === 'ajustar' && preset.base === 'experimental') {
      // Los tokens de experimental/ escritos a mano se cambian en su sitio, en la hoja que los declara.
      let pending = lab.pinInherited(preset.ajustes, originales);
      const baseMode = Object.keys(experimental.info.modos)[0] ?? 'base';
      for (const name of fs.readdirSync(expDir).filter((f) => f.endsWith('.css')).sort()) {
        const target = path.join(expDir, name);
        const before = fs.readFileSync(target, 'utf8');
        const result = setTokenValues(before, pending, baseMode);
        if (result.css !== before) {
          fs.writeFileSync(target, result.css);
          written.push(path.relative(SITE, target));
        }
        pending = result.pending;
      }
      // Lo que un modo heredaba de :root se declara en ese modo, al final de la hoja de tokens.
      if (Object.keys(pending).length) {
        const extra = lab.presetCss({ ...preset, ajustes: pending }, { selectores }).replace(/^\/\*[\s\S]*?\*\/\n\n/, '');
        fs.appendFileSync(file, `${fs.existsSync(file) ? '\n' : ''}${extra}`);
        if (!written.includes(rel)) written.push(rel);
      }
    } else {
      // Un archivo que no generó el Lab no se pisa sin permiso.
      if (fs.existsSync(file) && !savedCode() && !flag('--sobrescribir')) fail(`${rel} no lo generó el Lab y no lo sobrescribo. Usa --archivo <otro>.css o, si la persona lo confirma, --sobrescribir.`);
      fs.writeFileSync(file, lab.presetCss(preset, { selectores, originales }));
      written.push(rel);
    }
    const result = { escrito: written, contraste: { pares: contraste.length, porDebajoDeAA: failing.length, yaEstaban: previous.length }, produccion: Boolean(system.produccion) };
    if (JSON_OUT) return console.log(JSON.stringify(result, null, 2));
    console.log(written.length ? `Escrito: ${written.join(', ')}` : 'Nada que cambiar.');
    if (failing.length) console.log(`Aceptado por la persona: ${below(failing.length)}.`);
    if (previous.length) console.log(`Aviso: ${below(previous.length)} y ya estaba así antes del preset.`);
    console.log(system.produccion
      ? 'Producción no cambia. Lleva el cambio a una iniciativa y anota en sus fichas de tokens los valores nuevos (estado exploracion).'
      : 'Crea o actualiza las fichas de tokens en content/tokens/ (estado exploracion), con nombre y rol. Para verlo: npx ds dev.');
  },
  async sync() {
    requireSystem();
    process.exit(await node(runtimeDir(), 'scripts/sync-production.mjs', args));
  },
  async check() {
    requireSystem();
    process.exit(await node(runtimeDir(), 'scripts/sync-production.mjs', ['--check']));
  },
  async patrones() {
    requireSystem();
    const { sharedPatterns } = await import('../lib/patrones.mjs');
    const limite = Number(option('--limite') ?? 20);
    const minHojas = Number(option('--min-hojas') ?? 2);
    const minRasgos = Number(option('--min-rasgos') ?? 1);
    // Con --todos también salen los grupos de un solo prefijo (los que ya encuentra el inventario por prefijos).
    const result = sharedPatterns(SITE, { limite, minHojas, minRasgos, minPrefijos: flag('--todos') ? 1 : 2 });
    if (!result) fail('no hay instantánea de producción en produccion/. Ejecuta antes ds sync.');
    if (JSON_OUT) return console.log(JSON.stringify(result, null, 2));
    console.log(`${result.reglas} reglas de clase con forma en ${result.hojas} hojas · ${result.grupos.length} grupos candidatos`);
    if (!result.grupos.length) return console.log('Ninguna forma se repite entre hojas con prefijos distintos. Prueba con --min-hojas 1 o --todos.');
    result.grupos.forEach((g, i) => {
      const firma = [...Object.entries(g.firma.declaraciones).map(([k, v]) => `${k}: ${v}`), ...g.firma.tokens.filter((t) => !Object.values(g.firma.declaraciones).some((v) => v.includes(t))).map((t) => `var(${t})`)];
      console.log(`\n${i + 1}. ${g.numHojas} hojas · ${g.numPrefijos} prefijos (${g.prefijos.join(', ')})${g.varianteDe ? ` · variante del ${g.varianteDe}` : ''}`);
      console.log(`   firma: ${firma.join('; ')}`);
      for (const c of g.clases) console.log(`   ${c.selector}  ${c.hoja}`);
    });
  },
  async skills() {
    installSkills();
  },
  async doctor() {
    requireSite();
    process.exit(await node(runtimeDir(), 'scripts/doctor.mjs'));
  },
  async enlazar() {
    requireSystem();
    const [kitPath] = args;
    if (!kitPath || !fs.existsSync(path.join(path.resolve(kitPath), 'bin', 'ds.mjs'))) fail('uso: ds enlazar <ruta al checkout del kit>');
    // Enlace solo en este repo: a diferencia de npm link, no necesita escribir en la carpeta global de npm.
    const target = path.join(SITE, 'node_modules', kitPkg.name);
    fs.rmSync(target, { recursive: true, force: true });
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.symlinkSync(path.resolve(kitPath), target, 'dir');
    if (!fs.existsSync(path.join(path.resolve(kitPath), 'node_modules', 'next'))) console.log('Aviso: ejecuta npm install en el kit antes de ds dev.');
    console.log(`Kit enlazado: ${path.resolve(kitPath)}. Los cambios en el kit se ven al momento con ds dev. Para volver: ds desenlazar.`);
  },
  async desenlazar() {
    requireSystem();
    const target = path.join(SITE, 'node_modules', kitPkg.name);
    if (fs.lstatSync(target, { throwIfNoEntry: false })?.isSymbolicLink()) fs.unlinkSync(target); // rmSync falla con EISDIR en un enlace a carpeta (Node 24)
    process.exit(await run('npm', ['install'], { cwd: SITE }));
  },
  async version() {
    console.log(kitPkg.version);
  },
  async ayuda() {
    const src = fs.readFileSync(fileURLToPath(import.meta.url), 'utf8');
    console.log(src.split('\n').filter((l) => l.startsWith('//   ')).map((l) => l.slice(3)).join('\n'));
  },
};

(commands[command] ?? commands.ayuda)();
