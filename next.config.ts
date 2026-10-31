import fs from 'node:fs';
import path from 'node:path';
import type { NextConfig } from 'next';
import { publicationRoute } from './lib/core.mjs';

// Turbopack necesita que su raíz contenga node_modules/next. Con el kit instalado en un sistema,
// Next está en el node_modules del sistema, por encima de la carpeta de ejecución.
function turbopackRoot(dir: string): string {
  for (let d = dir; ; d = path.dirname(d)) {
    if (fs.existsSync(path.join(d, 'node_modules', 'next'))) return d;
    if (path.dirname(d) === d) return dir;
  }
}

// Ruta de publicación (system.json → publicacion.ruta o DS_RUTA): solo al exportar; ds dev sirve en la raíz.
// Con ruta, Next la pone delante de las páginas, de /_next y de los <Link>; lo demás usa lib/site.ts.
const route = process.env.NODE_ENV === 'production' ? publicationRoute() : '';

// Sitio estático: el sistema se publica como HTML + .md + JSON, legible por personas y agentes.
const nextConfig: NextConfig = {
  ...(route ? { basePath: route } : {}),
  env: { DS_RUTA_SITIO: route },
  output: 'export',
  images: { unoptimized: true },
  devIndicators: false,
  // Hay dos layouts raíz, uno por idioma (app/(principal) y app/(en)): la 404 tiene el suyo, app/global-not-found.tsx.
  experimental: { globalNotFound: true },
  // Sin el bloque de reglas que next dev añade a AGENTS.md cuando detecta un agente: este AGENTS.md es del kit.
  agentRules: false,
  // dev y build no comparten carpeta: se puede exportar sin romper el servidor de desarrollo.
  distDir: process.env.NODE_ENV === 'production' ? '.next-build' : '.next',
  turbopack: { root: turbopackRoot(process.cwd()) },
};

export default nextConfig;
