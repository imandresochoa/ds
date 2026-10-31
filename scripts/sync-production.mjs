#!/usr/bin/env node
// Enlace 1:1 con producción.
//
//   npx ds sync                 copia el CSS de producción, extrae tokens y calcula huellas
//   npx ds sync --accept ID     marca como revisada la ficha ID (o "all") con la huella actual
//   npx ds check                falla si algo de producción cambió sin revisar o no existe
//   --local                     lee la copia local del repo tal cual (rama y cambios sin commit incluidos)
//
// Lee system.json de cada sistema → produccion.repo (ruta local al repo del producto). Por defecto
// compara con lo publicado: origin/<produccion.rama> (main), no con la rama que haya en la copia local.
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import postcss from 'postcss';
import { PLATFORM_SECTIONS, listSystems, loadEntries, loadLock, previewClasses } from '../lib/core.mjs';
import { buildTokens, readModeTokens, readThemeTokens } from '../lib/css-tokens.mjs';
import { findHallazgos } from '../lib/hallazgos.mjs';

const args = process.argv.slice(2);
const CHECK = args.includes('--check');
const LOCAL = args.includes('--local');
const acceptAt = args.indexOf('--accept');
const ACCEPT = acceptAt >= 0 ? args[acceptAt + 1] ?? 'all' : null;

const sha = (text) => crypto.createHash('sha256').update(text).digest('hex').slice(0, 16);
const git = (repo, ...cmd) => execFileSync('git', ['-C', repo, ...cmd], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
// Colores en hexadecimal, normalizados a #rrggbb en minúsculas.
const hexes = (text) => [...new Set([...text.matchAll(/#([0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3})(?![\w-])/g)].map(([, h]) => '#' + (h.length === 3 ? [...h].map((c) => c + c).join('') : h.slice(0, 6)).toLowerCase()))];
const classPattern = (name) => new RegExp(`\\.${name.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}(?![\\w-])`);

let failed = false;

/**
 * Resuelve un @import de paquete («tw-animate-css», «shadcn/tailwind.css», «@fontsource-variable/inter»)
 * a su hoja CSS en el node_modules de la copia local de producción. Sigue `exports` (style, default),
 * `style` y `main`. Devuelve null si no hay hoja CSS.
 */
function resolvePackageCss(spec, repo) {
  const parts = spec.split('/');
  const name = spec.startsWith('@') ? parts.slice(0, 2).join('/') : parts[0];
  const sub = spec.slice(name.length + 1);
  const dir = path.join(repo, 'node_modules', name);
  const pkgFile = path.join(dir, 'package.json');
  if (!fs.existsSync(pkgFile)) return null;
  const pkg = JSON.parse(fs.readFileSync(pkgFile, 'utf8'));
  const pick = (e) => (typeof e === 'string' ? e : e && (e.style ?? e.default ?? e.import));
  const exp = pkg.exports;
  const subpaths = exp && typeof exp === 'object' && Object.keys(exp).some((k) => k.startsWith('.'));
  const rel = sub
    ? pick(subpaths ? exp[`./${sub}`] : undefined) ?? sub
    : pick(subpaths ? exp['.'] : exp) ?? pkg.style ?? pkg.main ?? 'index.css';
  const file = path.join(dir, rel);
  return file.endsWith('.css') && fs.existsSync(file) ? file : null;
}

/**
 * Incrusta los @import de la hoja: el iframe del ejemplo no puede resolver rutas del repo ni paquetes.
 * - Locales («./x.css», «../x.css», con layer() opcional): se leen del repo.
 * - De paquete («tw-animate-css», «shadcn/tailwind.css»): se leen del node_modules de la copia local de
 *   producción; sus url() relativas (fuentes, imágenes) se copian a assets/_paquetes/. Si el paquete no
 *   está instalado, el @import se quita y se avisa (el navegador no puede cargarlo).
 * `tailwindcss` y los @import con url() o http se dejan tal cual. Con `ctx.sinPaquetes`, los de paquete se quitan
 * (para leer solo lo que escribe el producto).
 */
function inlineImports(text, from, ctx) {
  return text.replace(/@import\s+["']([^"']+)["'](?:\s+layer\(([\w-]+)\))?\s*;/g, (all, spec, layer) => {
    if (spec === 'tailwindcss' || /^(https?:)?\/\//.test(spec) || spec.startsWith('/')) return all;
    const local = spec.startsWith('.');
    if (!local && ctx.sinPaquetes) return '';
    const file = local ? path.resolve(path.dirname(from), spec) : resolvePackageCss(spec, ctx.repo);
    if (!file || !fs.existsSync(file)) {
      if (local) return all;
      ctx.paquetesAusentes.add(spec);
      return `/* ds: @import "${spec}" quitado: no está en node_modules de producción */`;
    }
    let inner = inlineImports(fs.readFileSync(file, 'utf8'), file, ctx);
    if (!local) inner = copyPackageAssets(inner, file, ctx);
    return layer ? `@layer ${layer} {\n${inner}\n}` : inner;
  });
}

/** Copia los assets relativos de una hoja de paquete a la instantánea y reescribe sus url(). */
function copyPackageAssets(css, from, ctx) {
  const modules = path.join(ctx.repo, 'node_modules');
  return css.replace(/url\((['"]?)(?!data:|https?:|\/)([^)'"]+)\1\)/g, (all, quote, rel) => {
    const asset = path.resolve(path.dirname(from), rel.split(/[?#]/)[0]);
    if (!fs.existsSync(asset)) return all;
    const target = path.join('_paquetes', path.relative(modules, asset));
    fs.mkdirSync(path.dirname(path.join(ctx.assetsDir, target)), { recursive: true });
    fs.copyFileSync(asset, path.join(ctx.assetsDir, target));
    return `url(${quote}assets/${target.split(path.sep).join('/')}${quote})`;
  });
}

/** Archivos de componentes (.tsx, .jsx, .vue, .svelte, .astro) bajo las carpetas dadas, sin tests ni stories. */
function componentFiles(repo, dirs) {
  const files = [];
  const walk = (dir) => {
    if (!fs.existsSync(dir)) return;
    for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, item.name);
      if (item.isDirectory()) {
        if (item.name !== 'node_modules' && !item.name.startsWith('.')) walk(full);
      } else if (/\.(tsx|jsx|vue|svelte|astro)$/.test(item.name) && !/\.(test|spec|stories)\./.test(item.name)) {
        files.push(path.relative(repo, full).split(path.sep).join('/'));
      }
    }
  };
  for (const dir of [dirs].flat()) walk(path.join(repo, dir));
  return files.sort();
}

for (const system of listSystems()) {
  const prod = system.produccion;
  if (!prod) continue;
  const repo = path.resolve(system.dir, prod.repo);
  const log = (msg) => console.log(`[${system.id}] ${msg}`);

  if (!fs.existsSync(repo)) {
    log(`repo de producción no encontrado en ${repo}; se conserva la última instantánea`);
    if (CHECK) failed = true;
    continue;
  }

  try {
    git(repo, 'rev-parse', '--verify', '--quiet', 'HEAD');
  } catch {
    log(`el repo de producción aún no tiene commits; se conserva la última instantánea`);
    if (CHECK) failed = true;
    continue;
  }

  // Lo publicado es origin/<rama>: se exporta a una carpeta temporal para no depender de la copia local.
  const rama = prod.rama ?? 'main';
  let src = repo;
  let ref = 'HEAD';
  if (!LOCAL) {
    try {
      git(repo, 'fetch', '--quiet', 'origin', rama);
    } catch {
      log(`aviso: no se pudo actualizar origin/${rama} (¿sin conexión?); se usa la última copia descargada`);
    }
    try {
      git(repo, 'rev-parse', '--verify', '--quiet', `origin/${rama}`);
      ref = `origin/${rama}`;
      src = fs.mkdtempSync(path.join(os.tmpdir(), 'ds-produccion-'));
      execFileSync('sh', ['-c', 'git -C "$1" archive "$2" | tar -x -C "$3"', 'sh', repo, ref, src]);
    } catch {
      log(`aviso: no existe origin/${rama}; se lee la copia local`);
      src = repo;
      ref = 'HEAD';
    }
  }
  const commit = git(repo, 'rev-parse', '--short', ref);
  const commitDate = git(repo, 'log', '-1', '--format=%cs', ref);
  if (ref === 'HEAD' && !LOCAL) failed = failed || CHECK;
  const snapshotDir = path.join(system.dir, 'produccion');
  fs.rmSync(snapshotDir, { recursive: true, force: true });

  // 1. Instantánea de las hojas de estilo de cada superficie, con sus assets (fuentes, imágenes).
  const surfaceCss = {};
  const tokens = {};
  // Por superficie: modos con sus selectores y valores escritos en @theme (van al informe).
  const tokenInfo = {};
  // Clases que solo activan un modo (.dark): no son componentes y no cuentan en la cobertura.
  const modeClasses = {};
  const estilosAusentes = [];
  const paquetesAusentes = [];
  for (const [surfaceId, surface] of Object.entries(prod.superficies)) {
    surfaceCss[surfaceId] = [];
    const found = { modes: new Map(), theme: {}, modeClasses: new Set() };
    for (const rel of surface.estilos) {
      const source = path.join(src, rel);
      if (!fs.existsSync(source)) {
        // La superficie apunta a una hoja que ya no existe: el sistema documenta una versión vieja.
        log(`falta ${rel}: revisa produccion.superficies.${surfaceId}.estilos en system.json`);
        estilosAusentes.push(rel);
        if (CHECK) failed = true;
        continue;
      }
      const ctx = { repo, assetsDir: path.join(snapshotDir, surfaceId, 'assets'), paquetesAusentes: new Set() };
      const raw = inlineImports(fs.readFileSync(source, 'utf8'), source, ctx);
      for (const spec of ctx.paquetesAusentes) {
        log(`aviso: @import "${spec}" de ${rel} no está en ${path.join(repo, 'node_modules')}; ejecuta npm install en producción`);
        paquetesAusentes.push(spec);
      }
      let css = raw.replace(/url\((['"]?)(\/[^)'"]+)\1\)/g, (all, quote, url) => {
        const asset = path.join(src, prod.publico ?? 'public', url);
        if (!fs.existsSync(asset)) return all;
        const target = path.join(snapshotDir, surfaceId, 'assets', url);
        fs.mkdirSync(path.dirname(target), { recursive: true });
        fs.copyFileSync(asset, target);
        return `url(${quote}assets${url}${quote})`;
      });
      if (surface.tailwind) css = css.replace(/@import\s+["']tailwindcss["'];?/, '');
      const target = path.join(snapshotDir, surfaceId, path.basename(rel));
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.writeFileSync(target, css);
      const root = postcss.parse(raw, { from: source });
      surfaceCss[surfaceId].push({ rel, root });
      // 2. Tokens: propiedades personalizadas de :root y de cada modo (claro, oscuro…), y variables de @theme.
      // Las de @theme se leen solo de lo que escribe el producto: paquetes como tw-animate-css traen las suyas.
      readModeTokens(root, found);
      readThemeTokens(postcss.parse(inlineImports(fs.readFileSync(source, 'utf8'), source, { ...ctx, sinPaquetes: true }), { from: source }), found.theme);
    }
    ({ values: tokens[surfaceId], info: tokenInfo[surfaceId] } = buildTokens(found));
    modeClasses[surfaceId] = found.modeClasses;
  }
  fs.writeFileSync(path.join(system.dir, 'tokens.produccion.json'), JSON.stringify(tokens, null, 2) + '\n');

  // Todas las clases definidas en cada superficie (para cobertura y para detectar clases inventadas).
  const definedClasses = {};
  for (const [surfaceId, sheets] of Object.entries(surfaceCss)) {
    const set = new Set();
    for (const { root } of sheets) root.walkRules((rule) => {
      for (const [, name] of rule.selector.matchAll(/\.(-?[_a-zA-Z][\w-]*)/g)) set.add(name);
    });
    definedClasses[surfaceId] = set;
  }

  // 3. Huellas por ficha: reglas CSS de sus clases, o el archivo completo si es un componente de código.
  const lock = loadLock(system);
  const entries = loadEntries(system);
  // Si producción tiene cambios sin commit, la instantánea los incluye: se avisa para no confundirlo con main.
  // Sin trim: la primera línea de --porcelain puede empezar por espacio (« M ruta»).
  const sinCommit = src === repo ? execFileSync('git', ['-C', repo, 'status', '--porcelain'], { encoding: 'utf8' }).split('\n').filter(Boolean).map((line) => line.slice(3)) : [];
  const report = { generado: new Date().toISOString(), origen: ref, commit, fechaCommit: commitDate, sinCommit, estilosAusentes, paquetesAusentes, tokens: tokenInfo, entradas: {}, cobertura: {} };
  // Archivos que alguna ficha declara como fuente (para la cobertura por componentes).
  const declaredSources = new Set();
  // Todos los colores escritos en las hojas de producción.
  const prodHexes = new Set(Object.values(surfaceCss).flatMap((sheets) => sheets.flatMap(({ root }) => hexes(root.toString()))));
  const documented = Object.fromEntries(Object.keys(prod.superficies).map((id) => [id, new Set()]));

  for (const entry of entries) {
    const fuentes = [];
    for (const [platform, info] of Object.entries(entry.platforms)) {
      for (const surface of info.superficies) {
        declaredSources.add(surface.fuente);
        const key = `${platform}:${surface.id}:${surface.fuente}`;
        const file = path.join(src, surface.fuente);
        const result = { clave: key, plataforma: platform, superficie: surface.id, fuente: surface.fuente, clases: surface.clases ?? [] };
        if (!fs.existsSync(file)) {
          fuentes.push({ ...result, estado: 'ausente', motivo: 'El archivo no existe en producción.' });
          continue;
        }
        let text;
        if (surface.clases?.length) {
          const sheet = surfaceCss[surface.id]?.find((s) => s.rel === surface.fuente);
          const root = sheet?.root ?? postcss.parse(fs.readFileSync(file, 'utf8'));
          const parts = [];
          const missing = [];
          for (const name of surface.clases) {
            documented[surface.id]?.add(name);
            const pattern = classPattern(name);
            let found = false;
            root.walkRules((rule) => {
              if (!pattern.test(rule.selector)) return;
              found = true;
              const context = rule.parent?.type === 'atrule' ? `@${rule.parent.name} ${rule.parent.params} ` : '';
              parts.push(context + rule.toString().replace(/\s+/g, ' '));
            });
            if (!found) missing.push(name);
          }
          if (missing.length) {
            fuentes.push({ ...result, estado: 'ausente', motivo: `Clases que no existen en producción: ${missing.join(', ')}` });
            continue;
          }
          text = [...new Set(parts)].join('\n');
        } else {
          text = fs.readFileSync(file, 'utf8');
        }
        const huella = sha(text);
        const previous = lock.entradas[entry.id]?.[key];
        if (ACCEPT && (ACCEPT === 'all' || ACCEPT === entry.id)) {
          lock.entradas[entry.id] = { ...lock.entradas[entry.id], [key]: { huella, commit, revisado: new Date().toISOString().slice(0, 10) } };
        }
        const accepted = lock.entradas[entry.id]?.[key];
        const estado = !accepted ? 'nuevo' : accepted.huella === huella ? 'ok' : 'desajuste';
        fuentes.push({ ...result, estado, huella, revisada: accepted?.huella ?? null, commitRevisado: accepted?.commit ?? null, cambioDesde: previous && previous.huella !== huella ? previous.commit : null });
      }
    }

    // Los ejemplos en vivo solo pueden usar clases que existan (en producción o en el CSS experimental).
    const experimental = path.join(system.dir, 'experimental');
    const expCss = fs.existsSync(experimental) ? fs.readdirSync(experimental).filter((f) => f.endsWith('.css')).map((f) => fs.readFileSync(path.join(experimental, f), 'utf8')).join('\n') : '';
    const tailwindSurfaces = Object.entries(prod.superficies).filter(([, s]) => s.tailwind).map(([id]) => id);
    const used = previewClasses([entry.body, ...Object.values(entry.platforms).map((p) => p.body)].join('\n'), tailwindSurfaces);
    const allDefined = new Set(Object.values(definedClasses).flatMap((s) => [...s]));
    const invented = used.filter((name) => !allDefined.has(name) && !classPattern(name).test(expCss));

    // Los tokens se leen en vivo de producción: basta con comprobar que existen.
    const tokenNamesUsed = (entry.data.tokens ?? []).map((t) => (typeof t === 'string' ? t : t.nombre));
    const missingTokens = tokenNamesUsed.filter((name) => !Object.values(tokens).some((values) => name in values));
    if (tokenNamesUsed.length) fuentes.push({ clave: 'tokens', plataforma: 'web', superficie: 'tokens', fuente: 'tokens.produccion.json', clases: [], estado: missingTokens.length ? 'ausente' : 'ok', motivo: missingTokens.length ? `Tokens que no existen en producción: ${missingTokens.join(', ')}` : undefined });

    const order = ['ausente', 'desajuste', 'nuevo', 'ok'];
    const estado = fuentes.length ? order.find((s) => fuentes.some((f) => f.estado === s)) : null;
    const avisos = [];
    if (entry.estado === 'produccion' && !fuentes.length && PLATFORM_SECTIONS.includes(entry.section)) avisos.push('Estado «produccion» sin fuentes declaradas: no se puede verificar.');
    if (entry.estado !== 'produccion' && entry.estado !== 'obsoleto' && fuentes.some((f) => f.estado !== 'ausente')) avisos.push('Tiene fuentes en producción pero su estado no es «produccion».');
    if (invented.length) avisos.push(`Clases de los ejemplos que no existen: ${invented.join(', ')}`);

    // Colores que la ficha escribe a mano: en producción tienen que existir; fuera de producción,
    // si la mayoría ya existe, la ficha seguramente se aplicó y nadie cambió su estado.
    const colores = hexes([entry.body, ...Object.values(entry.platforms).map((p) => p.body)].join('\n'));
    const coloresAusentes = prodHexes.size ? colores.filter((h) => !prodHexes.has(h)) : [];
    const coloresEnProd = colores.length - coloresAusentes.length;
    let coloresFallan = false;
    if (entry.estado === 'produccion' && coloresAusentes.length) {
      avisos.push(`Colores que no existen en producción: ${coloresAusentes.join(', ')}`);
      coloresFallan = true;
    } else if (!['produccion', 'obsoleto'].includes(entry.estado) && colores.length >= 2 && coloresEnProd * 2 >= colores.length) {
      avisos.push(`${coloresEnProd} de ${colores.length} colores ya están en producción: ¿se aplicó? Pasa la ficha a «produccion» y corrige el resto${coloresAusentes.length ? ` (${coloresAusentes.join(', ')})` : ''}.`);
      coloresFallan = true;
    }

    report.entradas[entry.id] = { estado, fuentes, avisos, clasesInventadas: invented, coloresAusentes };
    if (CHECK && (['ausente', 'desajuste'].includes(estado) || invented.length || coloresFallan)) failed = true;
  }

  // 4. Cobertura: lo que producción tiene y ninguna ficha documenta. Por clases o, en superficies Tailwind (sus
  // clases son utilidades), por componentes: archivos de componentes que ninguna ficha declara como fuente.
  for (const [surfaceId, surface] of Object.entries(prod.superficies)) {
    const kind = surface.cobertura === true ? (surface.tailwind ? 'componentes' : 'clases') : surface.cobertura;
    if (kind === 'clases') {
      const all = [...definedClasses[surfaceId]].filter((c) => !modeClasses[surfaceId].has(c)).sort();
      const docs = documented[surfaceId];
      report.cobertura[surfaceId] = { total: all.length, documentadas: all.filter((c) => docs.has(c)).length, sinDocumentar: all.filter((c) => !docs.has(c)) };
    } else if (kind === 'componentes') {
      const all = componentFiles(src, surface.componentes ?? 'src/components');
      report.cobertura[`componentes:${surfaceId}`] = { total: all.length, documentadas: all.filter((f) => declaredSources.has(f)).length, sinDocumentar: all.filter((f) => !declaredSources.has(f)) };
    }
  }
  const tokenNames = new Set(entries.filter((e) => e.section === 'tokens').flatMap((e) => (e.data.tokens ?? []).map((t) => (typeof t === 'string' ? t : t.nombre))));
  for (const [surfaceId, values] of Object.entries(tokens)) {
    const names = Object.keys(values);
    // Una variable de @theme que solo apunta a otro token (--color-x: var(--x)) queda documentada con él.
    const target = (name) => /^var\(\s*--([\w-]+)\s*\)$/.exec(tokenInfo[surfaceId].theme[name]?.trim() ?? '')?.[1];
    const isDocumented = (name) => {
      for (let n = name, hops = 0; n && hops < 5; n = target(n), hops++) if (tokenNames.has(n)) return true;
      return false;
    };
    report.cobertura[`tokens:${surfaceId}`] = { total: names.length, documentadas: names.filter(isDocumented).length, sinDocumentar: names.filter((n) => !isDocumented(n)) };
  }

  // 5. Hallazgos: lo que producción podría hacer mejor con su propio sistema (skill recomendar-produccion).
  // Son observaciones, no fallos: check no los mira.
  report.hallazgos = findHallazgos(src, prod.superficies, tokens, tokenInfo);

  if (ACCEPT) fs.writeFileSync(path.join(system.dir, 'produccion.lock.json'), JSON.stringify(lock, null, 2) + '\n');
  fs.writeFileSync(path.join(system.dir, 'sync-report.json'), JSON.stringify(report, null, 2) + '\n');

  const counts = Object.values(report.entradas).reduce((acc, e) => ((acc[e.estado ?? 'sin-fuente'] = (acc[e.estado ?? 'sin-fuente'] ?? 0) + 1), acc), {});
  log(`producción ${ref} @ ${commit} (${commitDate}) · fichas: ${JSON.stringify(counts)}`);
  if (src === repo && !LOCAL) {
    let atras = 0;
    try {
      atras = Number(git(repo, 'rev-list', '--count', `HEAD..origin/${rama}`) || 0);
    } catch {
      // Sin origin/<rama> no hay con qué comparar.
    }
    if (atras) log(`aviso: la copia local va ${atras} commits por detrás de origin/${rama}`);
  }
  if (src !== repo) fs.rmSync(src, { recursive: true, force: true });
  if (sinCommit.length) log(`aviso: producción tiene ${sinCommit.length} archivos sin commit; la instantánea los incluye`);
  for (const [id, e] of Object.entries(report.entradas)) for (const aviso of e.avisos) log(`aviso ${id}: ${aviso}`);
  for (const [id, info] of Object.entries(tokenInfo)) {
    const modes = Object.entries(info.modos);
    if (modes.length > 1) log(`modos de ${id}: ${modes.map(([mode, sels]) => `${mode} (${sels.join(', ')})`).join(' · ')}`);
  }
  for (const [id, c] of Object.entries(report.cobertura)) log(`cobertura ${id}: ${c.documentadas}/${c.total}`);
  for (const [id, h] of Object.entries(report.hallazgos.superficies)) {
    const parts = [[h.valoresSueltos.length, 'valores sueltos'], [h.copiasDeTokens.length, 'copias de tokens'], [h.tokensSinUso.length, 'tokens sin uso']].filter(([n]) => n);
    if (parts.length) log(`hallazgos ${id}: ${parts.map(([n, what]) => `${n} ${what}`).join(' · ')}`);
  }
  if (report.hallazgos.hojasSinCargar.length) log(`hallazgos: ${report.hallazgos.hojasSinCargar.length} hojas que ninguna superficie carga`);
}

if (failed) {
  console.error('check:sync falló: hay hojas de producción que faltan o fichas desajustadas, ausentes, con clases inventadas o con colores que no cuadran.');
  process.exit(1);
}
