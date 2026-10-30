// La ruta de publicación de este sitio, tal como la fijó next.config.ts al compilar ('' en dev y en la raíz).
// <Link> y el router de Next ya la añaden solos. sitePath es para lo que no pasa por ellos: <a> a archivos
// (.md, design.md, llms.txt), fetch, window.open, las hojas de los ejemplos en vivo y el HTML de las fichas.
import { withRoute } from './ruta.mjs';

export const SITE_ROUTE: string = process.env.DS_RUTA_SITIO ?? '';

export const sitePath = (href: string): string => withRoute(href, SITE_ROUTE);
