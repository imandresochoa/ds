import { notFound } from 'next/navigation';
import { CodeBlock } from '@/components/CodeBlock';
import { CopyPromptButton } from '@/components/CopyPromptButton';
import { EntryGrid, type CardItem, type CardKind } from '@/components/docs/EntryCard';
import { SECTIONS, loadEntries, loadSystem } from '@/lib/core.mjs';
import { buildNav, sortGroups, surfacesAttr, type Entry, type NavItem } from '@/lib/nav';
import { firstPreview } from '@/lib/previews';
import { previewSurfaces } from '@/lib/surfaces';

/** Miniatura de cada sección: los componentes y el resto, a escala fija; bloques y gráficos, con su ancho de vista. */
const KINDS: Record<string, CardKind> = { bloques: 'bloque', graficos: 'grafico', iniciativas: 'texto', metodologia: 'texto' };

export const dynamicParams = false;
export const generateStaticParams = ({ params }: { params: { system: string } }) =>
  SECTIONS.filter((s) => s.id !== 'metodologia' || loadSystem(params.system).metodologia).map((s) => ({ section: s.id }));

export async function generateMetadata({ params }: { params: Promise<{ system: string; section: string }> }) {
  const { section } = await params;
  const info = SECTIONS.find((s) => s.id === section);
  return { title: info?.label, description: info?.descripcion };
}

/** Ancla de un grupo dentro del índice. */
const anchor = (label: string) => label.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-');

/** Datos de una iniciativa bajo su resumen: cuántas piezas agrupa y cuándo se actualizó. */
function initiativeMeta(entry: Entry, entries: Entry[]) {
  const pieces = entries.filter((p) => p.data.iniciativa === entry.slug).length;
  const count = pieces ? `${pieces} ${pieces === 1 ? 'pieza' : 'piezas'}` : 'Sin piezas todavía';
  return entry.data.actualizado ? `${count} · Actualizada el ${entry.data.actualizado}` : count;
}

/**
 * Índice de una sección, con la densidad de los índices de Geist y de shadcn: cabecera corta y una tarjeta por
 * ficha con su primer ejemplo en vivo. Componentes va en orden alfabético; las secciones que agrupan (categorías
 * de Bloques y Gráficos, grupos de Fundamentos y Tokens, estado de las Iniciativas) llevan un título por grupo.
 */
export default async function SectionPage({ params }: { params: Promise<{ system: string; section: string }> }) {
  const { system: id, section: sectionId } = await params;
  const section = SECTIONS.find((s) => s.id === sectionId);
  if (!section) notFound();
  const system = loadSystem(id);
  const nav = buildNav(id);
  const entries = loadEntries(system);
  const surfaces = previewSurfaces(system);
  const kind = KINDS[section.id] ?? 'componente';
  const prompt = section.accion.prompt.replaceAll('{sistema}', id);

  // Las fichas de la barra lateral, por orden alfabético.
  const navItems = nav.groups.find((g) => g.id === section.id)?.items ?? [];
  const card = (item: NavItem): CardItem => {
    const entry = entries.find((e) => e.href === item.href);
    const live = entry && kind !== 'texto' ? firstPreview(entry, surfaces) : null;
    return {
      href: item.href,
      titulo: item.titulo,
      resumen: item.resumen,
      estado: item.estado,
      sync: item.sync,
      nuevo: item.nuevo,
      superficies: item.superficies,
      preview: live ? { html: live.preview.html, surface: live.surface, background: live.preview.fondo ?? undefined, mode: live.preview.modo } : null,
      meta: entry && section.id === 'iniciativas' ? initiativeMeta(entry, entries) : undefined,
      sinEstado: section.id === 'metodologia',
    };
  };
  // Los grupos, en el orden de `categorias` (la barra lateral no agrupa); dentro, por nombre.
  const labels = sortGroups(section, [...new Set(navItems.map((i) => i.grupo ?? ''))].map((label) => ({ label }))).map((g) => g.label);
  const grouped = 'agrupar' in section && (labels.length > 1 || section.agrupar === 'estado');
  const groups = grouped ? labels.map((label) => ({ label, items: navItems.filter((i) => (i.grupo ?? '') === label) })) : [{ label: '', items: navItems }];

  return (
    <div data-slot="docs" className="flex flex-col pb-16">
      <div className="h-(--top-spacing) shrink-0" />
      <div className="mx-auto flex w-full max-w-6xl min-w-0 flex-col gap-10 px-4 py-6 md:px-6 lg:py-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
          <div className="flex min-w-0 flex-col gap-2">
            <h1 className="scroll-m-24 text-3xl font-semibold tracking-tight">{section.label}</h1>
            <p className="max-w-2xl text-base text-balance text-muted-foreground">{section.descripcion}</p>
          </div>
          {navItems.length > 0 && (
            <div className="shrink-0 **:data-[slot=button]:shadow-none">
              <CopyPromptButton prompt={prompt} label={section.accion.label} variant="outline" />
            </div>
          )}
        </header>
        {!navItems.length && (
          <div className="flex max-w-2xl flex-col gap-3 rounded-xl border border-dashed p-6 md:p-8">
            <h2 className="font-semibold">Todavía no hay {section.label.toLowerCase()}</h2>
            <p className="text-sm text-balance text-muted-foreground">
              Esta sección es estructura: se llena con lo que ya existe en tu producto o con lo que diseñéis desde cero. Copia el prompt y pídeselo a tu agente.
            </p>
            <CodeBlock code={prompt} lang="prompt" className="mx-0 mt-2 w-full text-left" />
          </div>
        )}
        {groups.map((group) =>
          group.label ? (
            <section key={group.label} id={anchor(group.label)} data-superficies={surfacesAttr(group.items.map((i) => i.superficies))} className="flex scroll-mt-24 flex-col gap-4">
              <h2 className="flex items-baseline gap-2 text-base font-semibold">
                {group.label}
                <span className="text-sm font-normal text-muted-foreground">{group.items.length}</span>
              </h2>
              <EntryGrid items={group.items.map(card)} kind={kind} />
            </section>
          ) : (
            <EntryGrid key="todas" items={group.items.map(card)} kind={kind} />
          ),
        )}
      </div>
    </div>
  );
}
