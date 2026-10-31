// Cómo se previsualiza cada superficie de producción a partir de su instantánea (<repo del sistema>/produccion).
import fs from 'node:fs';
import path from 'node:path';
import type { PreviewSurface } from '@/components/Preview';
import { loadExperimentalTokens, loadSyncReport } from './core.mjs';
import type { System } from './nav';
import { sitePath } from './site';

type SurfaceConfig = { nombre: string; estilos: string[]; tailwind?: string; fondo?: string; estilosExtra?: string[]; cssExtra?: string; altoVista?: number };

export function previewSurfaces(system: System): Record<string, PreviewSurface> {
  const out: Record<string, PreviewSurface> = {};
  const surfaces = (system.produccion?.superficies ?? {}) as Record<string, SurfaceConfig>;
  // Los modos (claro, oscuro…) y sus selectores salen del último sync: con ellos, el ejemplo cambia de modo.
  const report = loadSyncReport(system);
  const modes = (id: string) => (report?.tokens?.[id]?.modos ?? null) as Record<string, string[]> | null;
  const viewport = (value: unknown) => (typeof value === 'number' && value > 0 ? value : null);
  // Con ruta de publicación, la lleva delante: el iframe (srcdoc) resuelve las rutas contra la raíz del dominio.
  const url = (surfaceId: string, file: string) => sitePath(`/_ds/${system.id}/produccion/${surfaceId}/${path.basename(file)}`);
  for (const [id, surface] of Object.entries(surfaces)) {
    const own = surface.tailwind ? [] : surface.estilos.map((file) => url(id, file));
    const extra = (surface.estilosExtra ?? []).map((ref) => {
      const [other, file] = ref.split('/');
      return url(other, file);
    });
    const tailwindCss = surface.tailwind
      ? surface.estilos.map((file) => {
          const snap = path.join(system.dir, 'produccion', id, path.basename(file));
          // Va incrustada en el iframe (no como <link>): las url(assets/…) relativas pasan a absolutas.
          const css = fs.existsSync(snap) ? fs.readFileSync(snap, 'utf8') : '';
          return css.replace(/url\((['"]?)assets\//g, `url($1${sitePath(`/_ds/${system.id}/produccion/${id}/assets/`)}`);
        }).join('\n')
      : '';
    out[id] = {
      stylesheets: [...extra, ...own],
      tailwind: surface.tailwind ?? null,
      tailwindCss,
      extraCss: surface.cssExtra ?? '',
      background: surface.fondo ?? '#fff',
      modos: modes(id),
      altoVista: viewport(surface.altoVista),
    };
  }
  // Los ejemplos en exploración o desarrollo cargan además el CSS experimental del sistema.
  const experimental = path.join(system.dir, 'experimental');
  if (fs.existsSync(experimental)) {
    const sheets = fs.readdirSync(experimental).filter((f) => f.endsWith('.css')).map((f) => sitePath(`/_ds/${system.id}/experimental/${f}`));
    for (const surface of Object.values(out)) if (!surface.tailwind) surface.stylesheets.push(...sheets);
    // Un sistema sin producción todavía (recién creado) previsualiza solo con su CSS experimental.
    if (!Object.keys(out).length && sheets.length) out.experimental = { stylesheets: sheets, tailwind: null, tailwindCss: '', extraCss: '', background: '#fff', modos: (loadExperimentalTokens(system)?.info.modos ?? null) as Record<string, string[]> | null, altoVista: null };
  }
  return out;
}
