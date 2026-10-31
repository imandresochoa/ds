// Ruta de publicación: la carpeta bajo la que se sirve el sitio exportado («/ds» → https://dominio/ds/…).
// '' es la raíz del dominio. Sin dependencias de Node: lo usan los scripts, next.config.ts y la app.

/** «ds», «/ds/» → «/ds»; «», «/» → «». Falla si no es una ruta de URL válida. */
export function normalizeRoute(value, origin = 'publicacion.ruta') {
  const raw = String(value ?? '').trim();
  const route = raw.replace(/\/+$/, '');
  if (!route) return '';
  const full = route.startsWith('/') ? route : `/${route}`;
  const segments = full.split('/').slice(1);
  if (!segments.every((s) => /^[A-Za-z0-9._~-]+$/.test(s) && s !== '.' && s !== '..')) {
    throw new Error(`${origin}: «${raw}» no es una ruta válida. Usa una como "/ds".`);
  }
  return full;
}

/** Pone la ruta delante de un enlace absoluto del sitio («/x» → «/ds/x»). Los relativos, los externos y «//host» quedan igual. */
export function withRoute(href, route) {
  return route && href.startsWith('/') && !href.startsWith('//') ? route + href : href;
}

/** Aplica `rewrite` a cada línea de un texto Markdown que esté fuera de los bloques de código. */
function outsideFences(markdown, rewrite) {
  let fence = null;
  return markdown
    .split('\n')
    .map((line) => {
      const open = /^\s*(`{3,}|~{3,})/.exec(line);
      if (open && (!fence || open[1][0] === fence[0] && open[1].length >= fence.length)) {
        fence = fence ? null : open[1];
        return line;
      }
      return fence ? line : rewrite(line);
    })
    .join('\n');
}

/** Lo mismo en un texto Markdown: enlaces «](/x)» y definiciones «[x]: /x», fuera de los bloques de código. */
export function routeMarkdown(markdown, route) {
  if (!route) return markdown;
  return outsideFences(markdown, (line) => line.replace(/\]\(\/(?!\/)/g, `](${route}/`).replace(/^(\s*\[[^\]]+\]:\s*)\/(?!\/)/, `$1${route}/`));
}

/**
 * En una traducción, los enlaces a páginas de sistemas que también están traducidos llevan el prefijo del idioma:
 * «](/ejemplo/componentes/boton)» → «](/en/ejemplo/componentes/boton)». `roots` son los ids de esos sistemas.
 */
export function localizeMarkdown(markdown, prefix, roots) {
  if (!prefix || !roots.length) return markdown;
  const ids = roots.map((r) => r.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
  const inline = new RegExp(`\\]\\(\\/(?=(?:${ids})(?:[/)#?.]))`, 'g');
  const reference = new RegExp(`^(\\s*\\[[^\\]]+\\]:\\s*)\\/(?=(?:${ids})(?:[/#?.\\s]|$))`);
  return outsideFences(markdown, (line) => line.replace(inline, `](${prefix}/`).replace(reference, `$1${prefix}/`));
}
