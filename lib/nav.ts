// Datos de navegación que el servidor prepara para la interfaz (cabecera, barra lateral, ⌘K y anterior/siguiente).
import { IDIOMAS, KIT_PAGES, SECTIONS, languagePrefix, listSystems, loadDocs, loadEntries, loadPages, loadSyncReport, loadSystem, localeMeta, localizeSystem, pageLanguage, systemLanguages } from './core.mjs';
import { messages, type Lang } from './i18n';

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
  /** El Lab de primitivos: la primera opción de «Nuevo». */
  lab: string;
  /** «Abrir en Claude/ChatGPT» envía la URL de la página a un servicio externo: solo si el sistema lo activa. */
  abrirEnAgentes: boolean;
  /** Idioma de la página y prefijo de sus URL ('' en el principal, '/en' en la traducción). */
  lang: Lang;
  prefix: string;
  /** Los idiomas del sistema y el prefijo de cada uno, para el conmutador. Con uno solo, no hay conmutador. */
  idiomas: { lang: Lang; prefix: string; corto: string; nombre: string }[];
};

export type Entry = ReturnType<typeof loadEntries>[number];
export type System = ReturnType<typeof loadSystem>;
type Section = (typeof SECTIONS)[number];

export { KIT_PAGES };

/** Lo que necesita una página para hablar en su idioma: el idioma, los textos, los metadatos y el prefijo de sus URL. */
export function pageLocale(systemId: string, traduccion: string | null = null) {
  const system = loadSystem(systemId);
  const lang = pageLanguage(system, traduccion) as Lang;
  return { lang, t: messages(lang), meta: localeMeta(lang), prefix: languagePrefix(system, lang), system: localizeSystem(system, lang) as System };
}

/** Una ficha creada en los últimos 30 días lleva el punto de «Nuevo». */
const NEW_DAYS = 30;
const isNew = (creado?: string | null) => Boolean(creado) && Date.now() - Date.parse(creado as string) < NEW_DAYS * 864e5;

/** Raíz del repo de código a partir de la URL base para ver archivos (`…/blob/main/`). */
const repoUrl = (codigo?: string | null) => codigo?.match(/^(https:\/\/[^/]+\/[^/]+\/[^/]+)/)?.[1] ?? null;

const summary = (system: System, lang: string): SystemSummary => {
  const s = localizeSystem(system, lang);
  return {
  id: s.id,
  nombre: s.nombre,
  iniciales: s.iniciales,
  color: s.color,
  descripcion: s.descripcion ?? '',
  web: s.produccion?.web ?? null,
  codigo: s.produccion?.codigo ?? null,
  repo: repoUrl(s.produccion?.codigo),
  };
};

/** Etiqueta del grupo de una ficha dentro de su sección. */
export function groupLabel(section: Section, entry: Entry, lang: string = 'es'): string {
  const t = messages(lang).nav;
  if (section.agrupar === 'estado') return entry.estado === 'produccion' ? t.published : t.inProgress;
  if (section.agrupar === 'categoria') {
    // `nivel` es el nombre anterior de la categoría de un bloque (seccion, pantalla, flujo).
    const value = entry.data.categoria ?? entry.data.nivel;
    return (section.categorias as Record<string, string> | undefined)?.[value] ?? (value ? String(value) : t.others);
  }
  if (section.agrupar === 'grupo') return entry.data.grupo ?? t.general;
  return section.label;
}

/** Orden de los grupos de una sección: primero las categorías conocidas, después el resto por nombre. */
export function sortGroups<T extends { label: string }>(section: Section, groups: T[], lang: string = 'es'): T[] {
  const known: string[] = Object.values((section.categorias as Record<string, string> | undefined) ?? {});
  if (section.agrupar === 'estado') known.push(messages(lang).nav.inProgress, messages(lang).nav.published);
  return [...groups].sort((a, b) => (known.indexOf(a.label) + 1 || 99) - (known.indexOf(b.label) + 1 || 99) || a.label.localeCompare(b.label, lang));
}

/**
 * Navegación de un sistema en un idioma. Sin `traduccion`, la del idioma principal en sus URL de siempre;
 * con `traduccion` ('en'), la de la traducción, con sus URL bajo /en.
 */
export function buildNav(systemId: string, traduccion: string | null = null): Nav {
  const system = loadSystem(systemId);
  const lang = pageLanguage(system, traduccion) as Lang;
  const meta = localeMeta(lang);
  const t = messages(lang);
  const entries = loadEntries(system, lang);
  const report = loadSyncReport(system);
  const pages = loadPages(system, lang);
  // La metodología es documentación interna: solo la ven los sistemas que la activan.
  const docs = system.metodologia ? loadDocs(lang) : [];
  const prefix = languagePrefix(system, lang);
  const base = `${prefix}/${system.id}`;

  const toItem = (entry: Entry): NavItem => {
    const source = Object.values(entry.platforms).flatMap((p) => p.superficies)[0];
    const section = meta.SECTIONS.find((s) => s.id === entry.section)!;
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
      grupo: groupLabel(section, entry, lang),
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
    ...meta.KIT_PAGES.map((p) => page(`${base}/docs/${p.slug}`, p.titulo, p.resumen, null, 'docs')),
  ];
  const docItems = docs.map((d) => page(`${base}/metodologia/${d.slug}`, d.titulo, d.resumen, `${prefix}/metodologia/${d.slug}.md`, 'metodologia'));

  const label = (id: string) => meta.SECTIONS.find((s) => s.id === id)!.label;
  const groups: NavGroup[] = [];
  // «Empezar»: las páginas propias del sistema, sin la Introducción, que ya está en «Secciones».
  if (pageItems.length > 1) groups.push({ id: 'docs', label: t.nav.start, href: null, items: pageItems.slice(1) });
  for (const section of meta.CONTENT_SECTIONS) {
    const list = entries.filter((e) => e.section === section.id).map(toItem);
    const order = sortGroups(section, [...new Set(list.map((i) => i.grupo ?? ''))].map((label) => ({ label })), lang).map((g) => g.label);
    list.sort((a, b) => order.indexOf(a.grupo ?? '') - order.indexOf(b.grupo ?? '') || a.titulo.localeCompare(b.titulo, lang));
    groups.push({ id: section.id, label: section.label, href: `${base}/${section.id}`, items: list });
  }
  if (docItems.length) groups.push({ id: 'metodologia', label: label('metodologia'), href: `${base}/metodologia`, items: docItems });

  const visible = meta.SECTIONS.filter((s) => s.id !== 'metodologia' || system.metodologia);
  const { todos } = systemLanguages(system);
  return {
    system: summary(system, lang),
    systems: listSystems().filter((s) => systemLanguages(s).todos.includes(lang)).map((s) => summary(s, lang)),
    top: [
      { href: base, label: t.nav.home },
      { href: `${base}/docs`, label: t.nav.docs },
      { href: `${base}/componentes`, label: label('componentes') },
      { href: `${base}/bloques`, label: label('bloques') },
      { href: `${base}/graficos`, label: label('graficos') },
      { href: `${base}/iniciativas`, label: label('iniciativas') },
    ],
    sections: [{ href: `${base}/docs`, label: t.nav.introduction }, ...visible.map((s) => ({ href: `${base}/${s.id}`, label: s.label }))],
    groups,
    items: [pageItems[0], ...groups.flatMap((g) => g.items)],
    acciones: [
      ...visible.map((s) => ({ label: s.accion.label, prompt: s.accion.prompt.replaceAll('{sistema}', system.id) })),
      { label: t.nav.requestChange, prompt: meta.CAMBIO_PROMPT.replaceAll('{sistema}', system.id) },
    ],
    lab: `${base}/lab`,
    abrirEnAgentes: system.abrirEnAgentes === true,
    lang,
    prefix,
    idiomas: todos.map((l) => ({ lang: l as Lang, prefix: languagePrefix(system, l), corto: IDIOMAS[l as keyof typeof IDIOMAS].corto, nombre: IDIOMAS[l as keyof typeof IDIOMAS].nombre })),
  };
}

/** Anterior y siguiente en el orden de lectura de la barra lateral. */
export function neighbours(nav: Nav, href: string) {
  const index = nav.items.findIndex((i) => i.href === href);
  return { previous: index > 0 ? nav.items[index - 1] : null, next: index >= 0 && index < nav.items.length - 1 ? nav.items[index + 1] : null };
}
