#!/usr/bin/env node
// CLI del kit. Se ejecuta desde el repo de un sistema de diseño (la carpeta con system.json).
//
//   ds init "<Nombre>" [id]   crea system.json, DESIGN.md, AGENTS.md, contenido de ejemplo y skills
//   ds dev [--port 4100]      servidor de desarrollo con el contenido de este repo
//   ds build                  exporta el sitio estático a ./out (bajo publicacion.ruta o DS_RUTA, si la hay)
//   ds sync [--accept <id>]   lee producción: instantánea CSS, tokens, huellas e informe
//   ds check                  falla si algo está desajustado, ausente o inventado
//   ds skills                 copia (o actualiza) las skills del kit en .claude/skills/
//   ds doctor                 comprueba la configuración del sistema
//   ds version                versión del kit instalada
//   ds enlazar <ruta-al-kit>  usa un checkout local del kit (para pulir la interfaz con datos reales)
//   ds desenlazar             vuelve a la versión del kit fijada en package.json
//
// El motor (Next + scripts) vive en el kit. Si el kit está instalado dentro de node_modules,
// se copia a .ds/kit para ejecutarlo; si está enlazado (npm link), se ejecuta en su sitio y
// los cambios en el kit se ven al momento.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const KIT = fs.realpathSync(path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'));
const SITE = process.cwd();
const [command = 'ayuda', ...args] = process.argv.slice(2);
const kitPkg = JSON.parse(fs.readFileSync(path.join(KIT, 'package.json'), 'utf8'));

const fail = (msg) => {
  console.error(`ds: ${msg}`);
  process.exit(1);
};

function requireSystem() {
  if (!fs.existsSync(path.join(SITE, 'system.json'))) fail('no hay system.json en esta carpeta. Ejecuta «ds init "<Nombre>"» o entra en el repo del sistema.');
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

function installSkills() {
  const from = path.join(KIT, 'skills');
  if (!fs.existsSync(from)) return;
  const to = path.join(SITE, '.claude', 'skills');
  fs.mkdirSync(to, { recursive: true });
  for (const name of fs.readdirSync(from)) {
    fs.rmSync(path.join(to, name), { recursive: true, force: true });
    fs.cpSync(path.join(from, name), path.join(to, name), { recursive: true });
  }
  console.log(`Skills del kit ${kitPkg.version} en .claude/skills/: ${fs.readdirSync(from).join(', ')}`);
}

const commands = {
  async init() {
    const [nombre, idArg] = args;
    if (!nombre) fail('uso: ds init "<Nombre>" [id]');
    const id = idArg ?? nombre.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const initials = nombre.split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase().padEnd(2, nombre[1]?.toUpperCase() ?? 'X');
    copyTemplate(path.join(KIT, 'plantilla'), SITE, { NOMBRE_DEL_SISTEMA: nombre, ID_DEL_SISTEMA: id, '"NN"': `"${initials}"`, 'AAAA-MM-DD': new Date().toISOString().slice(0, 10) });
    // npm no publica archivos .gitignore: la plantilla lo guarda sin punto.
    const gi = path.join(SITE, 'gitignore');
    if (fs.existsSync(gi)) fs.existsSync(path.join(SITE, '.gitignore')) ? fs.rmSync(gi) : fs.renameSync(gi, path.join(SITE, '.gitignore'));
    const pkgFile = path.join(SITE, 'package.json');
    if (fs.existsSync(pkgFile)) {
      const pkg = JSON.parse(fs.readFileSync(pkgFile, 'utf8'));
      pkg.scripts = { dev: 'ds dev', build: 'ds build', sync: 'ds sync', 'check:sync': 'ds check', ...pkg.scripts };
      fs.writeFileSync(pkgFile, JSON.stringify(pkg, null, 2) + '\n');
    }
    installSkills();
    console.log(`Sistema «${nombre}» creado. Siguiente paso: abre AGENTS.md o pide a tu agente «adapta este sistema a mi repo de producción» (skill crear-sistema).`);
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
