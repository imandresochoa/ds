import Link from 'next/link';
import { Preview } from '@/components/Preview';
import { Announcement, CategoryNav, PageActions, PageHeader, PageHeaderDescription, PageHeaderHeading, PageNav } from '@/components/site/PageHeader';
import { Button } from '@/components/ui/button';
import { CONTENT_SECTIONS, SECTIONS, loadEntries, loadSystem } from '@/lib/core.mjs';
import { buildNav, entrySurfaces, surfacesAttr } from '@/lib/nav';
import { entryPreviews } from '@/lib/previews';
import { previewSurfaces } from '@/lib/surfaces';

/** Secciones cuyas fichas pueden salir en el escaparate de la home. */
const SHOWCASE_SECTIONS = ['componentes', 'bloques', 'graficos'];
const SHOWCASE_SIZE = 9;

export async function generateMetadata({ params }: { params: Promise<{ system: string }> }) {
  const { system } = await params;
  const s = loadSystem(system);
  return { title: { absolute: s.nombre }, description: s.descripcion };
}

/**
 * Home de un sistema con la forma de ui.shadcn.com: titular, descripción, dos acciones y, debajo, un escaparate
 * con los ejemplos en vivo de las fichas destacadas (`destacado: true`) o, si no hay, de las que tienen ejemplo.
 */
export default async function Home({ params }: { params: Promise<{ system: string }> }) {
  const { system: id } = await params;
  const system = loadSystem(id);
  const nav = buildNav(id);
  const entries = loadEntries(system);
  const surfaces = previewSurfaces(system);
  const latest = nav.items.filter((i) => i.creado && i.seccion !== 'docs').sort((a, b) => (b.creado ?? '').localeCompare(a.creado ?? ''))[0];

  const candidates = entries.filter((e) => SHOWCASE_SECTIONS.includes(e.section));
  const featured = candidates.filter((e) => e.data.destacado === true);
  const pool = (featured.length ? featured : [...candidates].sort((a, b) => Number(b.estado === 'produccion') - Number(a.estado === 'produccion')))
    .map((entry) => {
      const preview = entryPreviews(entry)[0];
      const surface = preview && (surfaces[preview.superficie ?? ''] ?? Object.values(surfaces)[0]);
      return preview && surface ? { entry, preview, surface } : null;
    })
    .filter((x) => x !== null)
    .slice(0, SHOWCASE_SIZE);

  const counts = Object.fromEntries(CONTENT_SECTIONS.map((s) => [s.id, entries.filter((e) => e.section === s.id).length]));

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader>
        {latest && <Announcement href={latest.href}>{latest.nuevo ? 'Nuevo: ' : ''}{latest.titulo}</Announcement>}
        <PageHeaderHeading className="max-w-4xl">{system.nombre}</PageHeaderHeading>
        {system.descripcion && <PageHeaderDescription>{system.descripcion}</PageHeaderDescription>}
        <PageActions>
          <Button asChild size="sm">
            <Link href={`/${id}/docs`}>Empezar</Link>
          </Button>
          <Button asChild size="sm" variant="ghost">
            <Link href={`/${id}/componentes`}>Ver componentes</Link>
          </Button>
        </PageActions>
      </PageHeader>
      <PageNav className="hidden md:flex">
        <CategoryNav items={CONTENT_SECTIONS.map((s) => ({ href: `/${id}/${s.id}`, label: s.label }))} />
      </PageNav>
      <div className="container-wrapper section-soft flex-1 pb-6">
        <div className="container overflow-hidden">
          {pool.length > 0 ? (
            <section className="columns-1 gap-6 pt-6 md:columns-2 md:pt-0 xl:columns-3 *:mb-6 *:break-inside-avoid">
              {pool.map(({ entry, preview, surface }) => (
                <div key={entry.id} data-slot="card" data-superficies={surfacesAttr([entrySurfaces(entry)])} className="flex flex-col overflow-hidden rounded-xl border bg-background">
                  <Preview html={preview.html} surface={surface} background={preview.fondo ?? undefined} minHeight={160} vista={preview.vista} mode={preview.modo} />
                  <Link href={entry.href} className="flex items-center justify-between gap-2 border-t px-4 py-3 text-sm hover:bg-accent/50">
                    <span className="font-medium">{entry.titulo}</span>
                    <span className="text-xs text-muted-foreground">{SECTIONS.find((s) => s.id === entry.section)?.label}</span>
                  </Link>
                </div>
              ))}
            </section>
          ) : (
            // Sin ejemplos todavía: la estructura del sistema, sección a sección.
            <section className="grid gap-4 pt-6 md:grid-cols-2 md:pt-0 xl:grid-cols-3">
              {CONTENT_SECTIONS.map((s) => (
                <Link key={s.id} href={`/${id}/${s.id}`} data-slot="card" className="flex flex-col gap-2 rounded-xl border bg-background p-6 text-sm transition-colors hover:bg-accent/50">
                  <span className="flex items-baseline justify-between gap-2">
                    <span className="text-base font-medium">{s.label}</span>
                    <span className="text-xs text-muted-foreground">{counts[s.id] ? `${counts[s.id]} ${counts[s.id] === 1 ? 'ficha' : 'fichas'}` : 'Por llenar'}</span>
                  </span>
                  <span className="text-muted-foreground">{s.descripcion}</span>
                </Link>
              ))}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
