#!/usr/bin/env node
// Comprueba la configuración de cada sistema: system.json, repo de producción, superficies y contenido.
import fs from 'node:fs';
import path from 'node:path';
import { CONTENT_SECTIONS, legacyTokenFiles, listSystems, loadEntries, normalizeRoute } from '../lib/core.mjs';

let errors = 0;
const ok = (msg) => console.log(`  ✓ ${msg}`);
const warn = (msg) => console.log(`  ! ${msg}`);
const bad = (msg) => (errors++, console.log(`  ✗ ${msg}`));

// En un directorio, ds pasa las fuentes git ya leídas (ver lib/fuentes.mjs): carpeta de la caché, ref, commit y avisos.
const fuentes = JSON.parse(process.env.DS_FUENTES || '[]');
if (fuentes.length) {
  console.log(`Fuentes git del directorio (${fuentes.length})`);
  const ignore = path.join(path.dirname(process.env.DS_DIRECTORIO ?? ''), '.gitignore');
  const ignored = fs.existsSync(ignore) && fs.readFileSync(ignore, 'utf8').split('\n').some((line) => /^\/?\.ds\/?$/.test(line.trim()));
  (ignored ? ok : bad)(ignored ? '.ds/ está en el .gitignore: la caché no entra en el repo' : 'añade .ds/ al .gitignore del directorio: la caché de las fuentes no se sube');
  for (const f of fuentes) (f.tipo === 'rama' ? warn : ok)(`${f.git}@${f.ref ?? 'HEAD'}: ${f.tipo}${f.tipo === 'rama' ? ' (fija un commit o una etiqueta)' : ''}, commit ${f.sha.slice(0, 7)}`);
  console.log('');
}

for (const system of listSystems()) {
  const fuente = fuentes.find((f) => f.dir === system.dir);
  console.log(`${system.nombre} (${system.id}) — ${fuente ? `${fuente.git}@${fuente.ref ?? 'HEAD'}` : system.dir}`);
  for (const key of ['id', 'nombre', 'descripcion', 'plataformas']) (system[key] ? ok : bad)(`system.json: ${key}`);
  if (/NOMBRE_DEL_SISTEMA|ID_DEL_SISTEMA/.test(JSON.stringify(system))) bad('system.json conserva textos de la plantilla');
  try {
    const ruta = normalizeRoute(system.publicacion?.ruta);
    ok(`publicación: ${ruta ? `bajo ${ruta}` : 'en la raíz del dominio'}`);
  } catch (error) {
    bad(`system.json: ${error.message}`);
  }
  const prod = system.produccion;
  if (!prod) warn('sin produccion: el sistema no se puede enlazar con el código');
  else {
    const repo = path.resolve(system.dir, prod.repo);
    // Una fuente git se lee sola, sin su repo de producción al lado: el directorio enseña su último sync.
    if (!fs.existsSync(repo) && fuente) ok('repo de producción: no hace falta en el directorio (se enseña el último sync del sistema)');
    else if (!fs.existsSync(repo)) bad(`repo de producción no encontrado: ${prod.repo}`);
    else {
      ok(`repo de producción: ${repo}`);
      for (const [id, surface] of Object.entries(prod.superficies ?? {})) {
        for (const rel of surface.estilos ?? []) (fs.existsSync(path.join(repo, rel)) ? ok : bad)(`superficie ${id}: ${rel}`);
        const cobertura = surface.cobertura === true ? (surface.tailwind ? 'componentes' : 'clases') : surface.cobertura;
        if (cobertura && !['clases', 'componentes'].includes(cobertura)) bad(`superficie ${id}: cobertura "${surface.cobertura}" no válida (true, "clases" o "componentes")`);
        if (cobertura === 'componentes') for (const dir of [surface.componentes ?? 'src/components'].flat()) (fs.existsSync(path.join(repo, dir)) ? ok : warn)(`superficie ${id}: componentes en ${dir}`);
      }
    }
    if (!fs.existsSync(path.join(system.dir, 'sync-report.json'))) warn(fuente ? 'aún no hay sync en esta ref: ejecuta ds sync en el repo del sistema' : 'aún no hay sync: ejecuta ds sync');
  }
  const design = path.join(system.dir, 'DESIGN.md');
  if (!fs.existsSync(design)) bad('falta DESIGN.md');
  else if (/NOMBRE_DEL_SISTEMA/.test(fs.readFileSync(design, 'utf8'))) bad('DESIGN.md conserva textos de la plantilla');
  // Desde la 2.0, los tokens van en su fundamento: content/tokens/ ya no se lee.
  const legacy = legacyTokenFiles(system);
  if (legacy.length) bad(`content/tokens/ ya no se lee (${legacy.length} ficha(s)): ejecuta npx ds migrar para pasar sus tokens a su fundamento`);
  const entries = loadEntries(system);
  for (const section of CONTENT_SECTIONS) {
    const n = entries.filter((e) => e.section === section.id).length;
    (n ? ok : warn)(`${section.label}: ${n} fichas`);
  }
  console.log('');
}
// DS_RUTA gana a publicacion.ruta en ds build.
if (process.env.DS_RUTA !== undefined) {
  try {
    const ruta = normalizeRoute(process.env.DS_RUTA, 'DS_RUTA');
    ok(`DS_RUTA: ds build publica ${ruta ? `bajo ${ruta}` : 'en la raíz del dominio'}, sin mirar publicacion.ruta`);
  } catch (error) {
    bad(error.message);
  }
}
if (errors) {
  console.error(`${errors} problema(s).`);
  process.exit(1);
}
