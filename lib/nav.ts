// Datos de navegación que el servidor prepara para la interfaz (cabecera, barra lateral, ⌘K y anterior/siguiente).
import { CAMBIO_PROMPT, CONTENT_SECTIONS, KIT_PAGES, SECTIONS, listSystems, loadDocs, loadEntries, loadPages, loadSyncReport, loadSystem } from './core.mjs';

export type NavItem = {
  href: string;
  titulo: string;
  resumen: string;
  seccion: string;
  estado: string;
  sync: string | null;
  creado: string | null;
  actualizado: string | null;
  nuevo: boolean;
  md: string | null;
  fuente: string | null;
  grupo: string | null;
  iniciativa: { titulo: string; href: string } | null;
  plataformas: Record<string, string>;
  // clave: plataforma, superficie y fuente (única en la ficha). Varias superficies pueden citar el mismo archivo.
  fuentes: { clave: string; superficie: string; fuente: string; estado: string; motivo?: string }[];
};
export type NavLink = { href: string; label: string };
export type NavGroup = { id: string; label: string; href: string | null; items: NavItem[] };
export type SystemSummary = {
  id: string;
  nombre: string;
  iniciales: string;
  color: string;
  descripcion: string;
  web: string | null;
  codigo: string | null;
  repo: string | null;
};
export type Nav = {
  system: SystemSummary;
  systems: SystemSummary[];
  /** Navegación de la cabecera. */
  top: NavLink[];
  /** Primer grupo de la barra lateral de Docs: las secciones. */
  sections: NavLink[];
  /** Un grupo por sección con sus páginas. */
  groups: NavGroup[];
  /** Todas las páginas, en el orden de lectura (anterior/siguiente y ⌘K). */
  items: NavItem[];
  /** Prompts del botón «Nuevo». */
  acciones: { label: string; prompt: string }[];
  /** «Abrir en Claude/ChatGPT» envía la URL de la página a un servicio externo: solo si el sistema lo activa. */
  abrirEnAgentes: boolean;
};

export type Entry = ReturnType<typeof loadEntries>[number];
export type System = ReturnType<typeof loadSystem>;
type Section = (typeof SECTIONS)[number];

export { KIT_PAGES };

/** Una ficha creada en los últimos 30 días lleva el punto de «Nuevo». */
const NEW_DAYS = 30;
const isNew = (creado?: string | null) => Boolean(creado) && Date.now() - Date.parse(creado as string) < NEW_DAYS * 864e5;

/** Raíz del repo de código a partir de la URL base para ver archivos (`…/blob/main/`). */
const repoUrl = (codigo?: string | null) => codigo?.match(/^(https:\/\/[^/]+\/[^/]+\/[^/]+)/)?.[1] ?? null;

const summary = (s: System): SystemSummary => ({
  id: s.id,
  nombre: s.nombre,
  iniciales: s.iniciales,
  color: s.color,
  descripcion: s.descripcion ?? '',
  web: s.produccion?.web ?? null,
  codigo: s.produccion?.codigo ?? null,
  repo: repoUrl(s.produccion?.codigo),
});

/** Etiqueta del grupo de una ficha dentro de su sección. */
export function groupLabel(section: Section, entry: Entry): string {
  if (section.agrupar === 'estado') return entry.estado === 'produccion' ? 'Publicadas' : 'En curso';
  if (section.agrupar === 'categoria') {
    // `nivel` es el nombre anterior de la categoría de un bloque (seccion, pantalla, flujo).
    const value = entry.data.categoria ?? entry.data.nivel;
    return (section.categorias as Record<string, string> | undefined)?.[value] ?? (value ? String(value) : 'Otros');
  }
  if (section.agrupar === 'grupo') return entry.data.grupo ?? 'General';
  return section.label;
}

/** Orden de los grupos de una sección: primero las categorías conocidas, después el resto por nombre. */
export function sortGroups<T extends { label: string }>(section: Section, groups: T[]): T[] {
  const known: string[] = Object.values((section.categorias as Record<string, string> | undefined) ?? {});
  if (section.agrupar === 'estado') known.push('En curso', 'Publicadas');
  return [...groups].sort((a, b) => (known.indexOf(a.label) + 1 || 99) - (known.indexOf(b.label) + 1 || 99) || a.label.localeCompare(b.label, 'es'));
}

export function buildNav(systemId: string): Nav {
  const system = loadSystem(systemId);
  const entries = loadEntries(system);
  const report = loadSyncReport(system);
  const pages = loadPages(system);
  // La metodología es documentación interna: solo la ven los sistemas que la activan.
  const docs = system.metodologia ? loadDocs() : [];
  const base = `/${system.id}`;

  const toItem = (entry: Entry): NavItem => {
    const source = Object.values(entry.platforms).flatMap((p) => p.superficies)[0];
    const section = SECTIONS.find((s) => s.id === entry.section)!;
    const found = entry.data.iniciativa ? entries.find((e) => e.id === `iniciativas/${entry.data.iniciativa}`) : null;
    return {
      href: entry.href,
      titulo: entry.titulo,
      resumen: entry.resumen,
      seccion: entry.section,
      estado: entry.estado,
      sync: report?.entradas?.[entry.id]?.estado ?? null,
      creado: entry.data.creado ?? null,
      actualizado: entry.data.actualizado ?? null,
      nuevo: isNew(entry.data.creado),
      md: `${entry.href}.md`,
      fuente: source && system.produccion?.codigo ? system.produccion.codigo + source.fuente : null,
      grupo: groupLabel(section, entry),
      plataformas: Object.fromEntries(Object.entries(entry.platforms).map(([p, info]) => [p, info.estado])),
      fuentes: ((report?.entradas?.[entry.id]?.fuentes ?? []) as NavItem['fuentes'])
        .filter((f) => f.superficie !== 'tokens')
        .map(({ clave, superficie, fuente, estado, motivo }) => ({ clave, superficie, fuente, estado, motivo })),
      iniciativa: found ? { titulo: found.titulo, href: found.href } : null,
    };
  };

  const page = (href: string, titulo: string, resumen: string, md: string | null, seccion: string): NavItem => ({
    href, titulo, resumen, seccion, md,
    estado: 'produccion', sync: null, creado: null, actualizado: null, nuevo: false, fuente: null, grupo: null, iniciativa: null, plataformas: {}, fuentes: [],
  });

  const pageItems = [
    ...pages.filter((p) => !KIT_PAGES.some((k) => k.slug === p.slug)).map((p) => page(p.slug ? `${base}/docs/${p.slug}` : `${base}/docs`, p.titulo, p.resumen, p.slug ? `${base}/docs/${p.slug}.md` : `${base}/docs.md`, 'docs')),
    // Páginas que el kit genera en todos los sistemas a partir de sus datos.
    ...KIT_PAGES.map((p) => page(`${base}/docs/${p.slug}`, p.titulo, p.resumen, null, 'docs')),
  ];
  const docItems = docs.map((d) => page(`${base}/metodologia/${d.slug}`, d.titulo, d.resumen, `/metodologia/${d.slug}.md`, 'metodologia'));

  const groups: NavGroup[] = [];
  // «Empezar»: las páginas propias del sistema, sin la Introducción, que ya está en «Secciones».
  if (pageItems.length > 1) groups.push({ id: 'docs', label: 'Empezar', href: null, items: pageItems.slice(1) });
  for (const section of CONTENT_SECTIONS) {
    const list = entries.filter((e) => e.section === section.id).map(toItem);
    const order = sortGroups(section, [...new Set(list.map((i) => i.grupo ?? ''))].map((label) => ({ label }))).map((g) => g.label);
    list.sort((a, b) => order.indexOf(a.grupo ?? '') - order.indexOf(b.grupo ?? '') || a.titulo.localeCompare(b.titulo, 'es'));
    groups.push({ id: section.id, label: section.label, href: `${base}/${section.id}`, items: list });
  }
  if (docItems.length) groups.push({ id: 'metodologia', label: 'Metodología', href: `${base}/metodologia`, items: docItems });

  const visible = SECTIONS.filter((s) => s.id !== 'metodologia' || system.metodologia);
  return {
    system: summary(system),
    systems: listSystems().map(summary),
    top: [
      { href: base, label: 'Inicio' },
      { href: `${base}/docs`, label: 'Docs' },
      { href: `${base}/componentes`, label: 'Componentes' },
      { href: `${base}/bloques`, label: 'Bloques' },
      { href: `${base}/graficos`, label: 'Gráficos' },
      { href: `${base}/iniciativas`, label: 'Iniciativas' },
    ],
    sections: [{ href: `${base}/docs`, label: 'Introducción' }, ...visible.map((s) => ({ href: `${base}/${s.id}`, label: s.label }))],
    groups,
    items: [pageItems[0], ...groups.flatMap((g) => g.items)],
    acciones: [
      ...visible.map((s) => ({ label: s.accion.label, prompt: s.accion.prompt.replaceAll('{sistema}', system.id) })),
      { label: 'Pedir un cambio', prompt: CAMBIO_PROMPT.replaceAll('{sistema}', system.id) },
    ],
    abrirEnAgentes: system.abrirEnAgentes === true,
  };
}

/** Anterior y siguiente en el orden de lectura de la barra lateral. */
export function neighbours(nav: Nav, href: string) {
  const index = nav.items.findIndex((i) => i.href === href);
  return { previous: index > 0 ? nav.items[index - 1] : null, next: index >= 0 && index < nav.items.length - 1 ? nav.items[index + 1] : null };
}
