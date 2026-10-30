#!/usr/bin/env node
// CLI del kit. Salvo `instalar` e `init`, se ejecuta desde el repo de un sistema de diseño (la carpeta con system.json).
//
//   ds instalar [--aqui] [--quitar]  instala la skill de montaje para Claude Code y Codex (en tu usuario; con --aqui, en esta carpeta)
//   ds init "<Nombre>" [id]   crea el repo del sistema: plantilla, kit y skills (sin nombre, pregunta en la terminal)
//        [--carpeta <ruta>] [--desde repo|web|figma|cero] [--produccion <ruta>] [--url <url>] [--kit <paquete>] [--json]
//   ds info [--json]          sistema, secciones, producción, último sync, skills y rutas del kit
//   ds search <texto> [--seccion <id>] [--limite 10] [--json]   busca fichas antes de crear una
//   ds dev [--port 4100]      servidor de desarrollo con el contenido de este repo
//   ds build                  exporta el sitio estático a ./out (bajo publicacion.ruta o DS_RUTA, si la hay)
//   ds sync [--accept <id>]   lee producción: instantánea CSS, tokens, huellas e informe
//   ds check                  falla si algo está desajustado, ausente o inventado
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
const INIT_ALLOWED = new Set(['.git', '.gitignore', '.DS_Store', 'package.json', 'package-lock.json', 'node_modules', 'README.md', 'system.json']);
const ORIGINS = ['repo', 'web', 'figma', 'cero'];

// Opciones: `--clave valor` e interruptores (`--json`). El resto son argumentos posicionales.
const VALUE_OPTIONS = new Set(['--carpeta', '--desde', '--produccion', '--url', '--kit', '--seccion', '--limite', '--port', '--accept']);
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
    const child = spawn(cmd, cmdArgs, { cwd, stdio: 'inherit', env: { ...process.env, DS_SISTEMAS: SITE, ...env } });
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

/** El núcleo del kit leyendo el sistema de esta carpeta (para info y search, sin arrancar Next). */
async function loadCore() {
  process.env.DS_SISTEMAS = SITE;
  return import('../lib/core.mjs');
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

    const spec = kitSpec();
    if (!fs.existsSync(path.join(target, 'node_modules', ...kitPkg.name.split('/'), 'package.json'))) {
      log(`Instalando el kit (${spec})…`);
      const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
      const result = spawnSync(npm, ['install', '--save', spec], { cwd: target, stdio: ['ignore', 2, 2] });
      if (result.status !== 0) fail(`no se pudo instalar el kit. Prueba a mano: cd ${target} && npm install ${spec}`);
    }

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
    const norm = (text = '') => String(text).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    const words = norm(query).split(/\s+/).filter(Boolean);
    const section = option('--seccion');
    const limit = Number(option('--limite') ?? 10);
    // Cada palabra tiene que aparecer en algún campo; pesa más en el id y el título que en el cuerpo.
    const results = core.loadEntries(system)
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
      .map(({ entry: e }) => ({ id: e.id, titulo: e.titulo, seccion: e.section, estado: e.estado, resumen: e.resumen, archivo: e.file, md: `${e.href}.md` }));
    if (JSON_OUT) return console.log(JSON.stringify(results, null, 2));
    if (!results.length) return console.log(`Ninguna ficha coincide con «${query}».`);
    for (const r of results) console.log(`${r.id} · ${r.estado}\n  ${r.titulo}: ${r.resumen}\n  ${r.archivo}`);
  },
  async dev() {
    requireSystem();
    const dir = runtimeDir();
    const portAt = args.indexOf('--port');
    const port = portAt >= 0 ? args[portAt + 1] : '4100';
    if ((await node(dir, 'scripts/build-public.mjs')) !== 0) process.exit(1);
    process.exit(await run(process.execPath, [nextBin(dir), 'dev', '--port', port], { cwd: dir }));
  },
  async build() {
    requireSystem();
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
  async sync() {
    requireSystem();
    process.exit(await node(runtimeDir(), 'scripts/sync-production.mjs', args));
  },
  async check() {
    requireSystem();
    process.exit(await node(runtimeDir(), 'scripts/sync-production.mjs', ['--check']));
  },
  async skills() {
    installSkills();
  },
  async doctor() {
    requireSystem();
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
