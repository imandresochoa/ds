// Datos de navegación que el servidor prepara para el shell (rail, sidebar, paleta y títulos).
import { CONTENT_SECTIONS, SECTIONS, listSystems, loadDocs, loadEntries, loadSyncReport, loadSystem } from './core.mjs';

export type NavItem = {
  href: string;
  titulo: string;
  resumen: string;
  seccion: string;
  estado: string;
  sync: string | null;
  creado: string | null;
  actualizado: string | null;
  md: string | null;
  fuente: string | null;
  grupo: string | null;
  iniciativa: { titulo: string; href: string } | null;
  plataformas: Record<string, string>;
  // clave: plataforma, superficie y fuente (única en la ficha). Varias superficies pueden citar el mismo archivo.
  fuentes: { clave: string; superficie: string; fuente: string; estado: string; motivo?: string }[];
};
export type NavGroup = { label: string; items: NavItem[] };
export type NavSection = {
  id: string;
  label: string;
  icon: string;
  href: string;
  descripcion: string;
  accion: { label: string; prompt: string } | null;
  groups: NavGroup[];
};
export type SystemSummary = { id: string; nombre: string; iniciales: string; color: string; web: string | null; codigo: string | null };
export type Nav = { system: SystemSummary; systems: SystemSummary[]; sections: NavSection[]; items: NavItem[] };

export type Entry = ReturnType<typeof loadEntries>[number];
export type System = ReturnType<typeof loadSystem>;

const summary = (s: System): SystemSummary => ({
  id: s.id,
  nombre: s.nombre,
  iniciales: s.iniciales,
  color: s.color,
  web: s.produccion?.web ?? null,
  codigo: s.produccion?.codigo ?? null,
});

const groupLabel = (section: (typeof SECTIONS)[number], entry: Entry): string => {
  if (section.grupos) return (section.grupos as Record<string, string | undefined>)[entry.data[section.agrupar as string]] ?? 'Sin clasificar';
  if (section.agrupar === 'estado') return entry.estado === 'produccion' ? 'Publicadas' : 'En curso';
  return entry.data.grupo ?? 'General';
};

export function buildNav(systemId: string): Nav {
  const system = loadSystem(systemId);
  const entries = loadEntries(system);
  const report = loadSyncReport(system);
  // La metodología es documentación interna: solo la ven los sistemas que la activan.
  const docs = system.metodologia ? loadDocs() : [];

  const toItem = (entry: Entry): NavItem => {
    const source = Object.values(entry.platforms).flatMap((p) => p.superficies)[0];
    return {
      href: entry.href,
      titulo: entry.titulo,
      resumen: entry.resumen,
      seccion: entry.section,
      estado: entry.estado,
      sync: report?.entradas?.[entry.id]?.estado ?? null,
      creado: entry.data.creado ?? null,
      actualizado: entry.data.actualizado ?? null,
      md: `${entry.href}.md`,
      fuente: source && system.produccion?.codigo ? system.produccion.codigo + source.fuente : null,
      grupo: entry.section === 'iniciativas' ? null : groupLabel(SECTIONS.find((s) => s.id === entry.section)!, entry),
      plataformas: Object.fromEntries(Object.entries(entry.platforms).map(([p, info]) => [p, info.estado])),
      fuentes: ((report?.entradas?.[entry.id]?.fuentes ?? []) as NavItem['fuentes'])
        .filter((f) => f.superficie !== 'tokens')
        .map(({ clave, superficie, fuente, estado, motivo }) => ({ clave, superficie, fuente, estado, motivo })),
      iniciativa: (() => {
        const found = entry.data.iniciativa ? entries.find((e) => e.id === `iniciativas/${entry.data.iniciativa}`) : null;
        return found ? { titulo: found.titulo, href: found.href } : null;
      })(),
    };
  };

  const items: NavItem[] = entries.map(toItem);
  const docItems: NavItem[] = docs.map((doc) => ({
    href: `/${system.id}/metodologia/${doc.slug}`,
    titulo: doc.titulo,
    resumen: doc.resumen,
    seccion: 'metodologia',
    estado: 'produccion',
    sync: null,
    creado: null,
    actualizado: null,
    md: `/metodologia/${doc.slug}.md`,
    fuente: null,
    grupo: null,
    iniciativa: null,
    plataformas: {},
    fuentes: [],
  }));

  const sections: NavSection[] = SECTIONS.filter((s) => s.id !== 'metodologia' || system.metodologia).map((section) => {
    const href = `/${system.id}/${section.id}`;
    let groups: NavGroup[] = [];
    if (section.id === 'metodologia') {
      groups = [{ label: 'Guías', items: docItems }];
    } else if (CONTENT_SECTIONS.some((s) => s.id === section.id)) {
      const order: string[] = Object.values((section.grupos as Record<string, string> | undefined) ?? {});
      const map = new Map<string, NavItem[]>();
      for (const entry of entries.filter((e) => e.section === section.id)) {
        const label = groupLabel(section, entry);
        map.set(label, [...(map.get(label) ?? []), toItem(entry)]);
      }
      groups = [...map.entries()]
        .sort(([a], [b]) => (order.indexOf(a) + 1 || 99) - (order.indexOf(b) + 1 || 99) || a.localeCompare(b, 'es'))
        .map(([label, list]) => ({ label, items: list }));
    }
    return {
      id: section.id,
      label: section.label,
      icon: section.icon,
      href,
      descripcion: section.descripcion ?? '',
      accion: section.accion ? { label: section.accion.label, prompt: section.accion.prompt.replaceAll('{sistema}', system.id) } : null,
      groups,
    };
  });

  return { system: summary(system), systems: listSystems().map(summary), sections, items: [...items, ...docItems] };
}
