#!/usr/bin/env node
// Comprueba la configuración de cada sistema: system.json, repo de producción, superficies y contenido.
import fs from 'node:fs';
import path from 'node:path';
import { CONTENT_SECTIONS, listSystems, listTranslations, loadEntries, normalizeRoute, systemLanguages } from '../lib/core.mjs';

let errors = 0;
const ok = (msg) => console.log(`  ✓ ${msg}`);
const warn = (msg) => console.log(`  ! ${msg}`);
const bad = (msg) => (errors++, console.log(`  ✗ ${msg}`));

for (const system of listSystems()) {
  console.log(`${system.nombre} (${system.id}) — ${system.dir}`);
  for (const key of ['id', 'nombre', 'descripcion', 'plataformas']) (system[key] ? ok : bad)(`system.json: ${key}`);
  if (/NOMBRE_DEL_SISTEMA|ID_DEL_SISTEMA/.test(JSON.stringify(system))) bad('system.json conserva textos de la plantilla');
  try {
    const ruta = normalizeRoute(system.publicacion?.ruta);
    ok(`publicación: ${ruta ? `bajo ${ruta}` : 'en la raíz del dominio'}`);
  } catch (error) {
    bad(`system.json: ${error.message}`);
  }
  let idiomas = null;
  try {
    idiomas = systemLanguages(system);
    ok(`idiomas: ${idiomas.todos.join(', ')}${idiomas.traducciones.length ? ` (traducciones bajo ${idiomas.traducciones.map((l) => `/${l}`).join(', ')})` : ''}`);
    for (const lang of idiomas.traducciones) if (!system[lang]?.nombre) warn(`system.json: sin "${lang}": { "nombre", "descripcion" }, el sistema se llama igual en ${lang}`);
  } catch (error) {
    bad(`system.json: ${error.message}`);
  }
  const prod = system.produccion;
  if (!prod) warn('sin produccion: el sistema no se puede enlazar con el código');
  else {
    const repo = path.resolve(system.dir, prod.repo);
    if (!fs.existsSync(repo)) bad(`repo de producción no encontrado: ${prod.repo}`);
    else {
      ok(`repo de producción: ${repo}`);
      for (const [id, surface] of Object.entries(prod.superficies ?? {})) {
        for (const rel of surface.estilos ?? []) (fs.existsSync(path.join(repo, rel)) ? ok : bad)(`superficie ${id}: ${rel}`);
        const cobertura = surface.cobertura === true ? (surface.tailwind ? 'componentes' : 'clases') : surface.cobertura;
        if (cobertura && !['clases', 'componentes'].includes(cobertura)) bad(`superficie ${id}: cobertura "${surface.cobertura}" no válida (true, "clases" o "componentes")`);
        if (cobertura === 'componentes') for (const dir of [surface.componentes ?? 'src/components'].flat()) (fs.existsSync(path.join(repo, dir)) ? ok : warn)(`superficie ${id}: componentes en ${dir}`);
      }
    }
    if (!fs.existsSync(path.join(system.dir, 'sync-report.json'))) warn('aún no hay sync: ejecuta ds sync');
  }
  const design = path.join(system.dir, 'DESIGN.md');
  if (!fs.existsSync(design)) bad('falta DESIGN.md');
  else if (/NOMBRE_DEL_SISTEMA/.test(fs.readFileSync(design, 'utf8'))) bad('DESIGN.md conserva textos de la plantilla');
  if (!idiomas) {
    console.log('');
    continue;
  }
  const entries = loadEntries(system);
  for (const section of CONTENT_SECTIONS) {
    const n = entries.filter((e) => e.section === section.id).length;
    (n ? ok : warn)(`${section.label}: ${n} fichas`);
  }
  if (idiomas.traducciones.length) {
    const list = listTranslations(system);
    const pending = list.filter((t) => t.estado !== 'ok').length;
    (pending ? warn : ok)(`traducciones: ${list.length - pending} de ${list.length} al día${pending ? ' (npx ds traducciones)' : ''}`);
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
