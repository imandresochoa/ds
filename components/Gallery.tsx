import Link from 'next/link';
import { SECTIONS, loadEntries, loadSystem } from '@/lib/core.mjs';
import { buildNav, groupLabel, sortGroups, type Entry } from '@/lib/nav';
import { entryPreviews } from '@/lib/previews';
import { previewSurfaces } from '@/lib/surfaces';
import { Button } from '@/components/ui/button';
import { BlockViewer } from './BlockViewer';
import { CodeBlock, CopyButton } from './CodeBlock';
import { CopyPromptButton } from './CopyPromptButton';
import { StatusDot } from './docs/StatusBadge';
import { highlight } from './Markdown';
import { Preview } from './Preview';
import { Announcement, CategoryNav, PageActions, PageHeader, PageHeaderDescription, PageHeaderHeading, PageNav } from './site/PageHeader';

type Section = (typeof SECTIONS)[number];

/** Ancla de una categoría en la galería. */
const anchor = (label: string) => label.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-');

/** Fichas de una sección agrupadas por categoría, en el orden de `categorias`. */
function byCategory(section: Section, entries: Entry[]) {
  const labels = [...new Set(entries.map((e) => groupLabel(section, e)))];
  return sortGroups(section, labels.map((label) => ({ label, entries: entries.filter((e) => groupLabel(section, e) === label).sort((a, b) => a.titulo.localeCompare(b.titulo, 'es')) })));
}

/** Cabecera de las páginas anchas: lo último que ha llegado, el titular de la sección y sus acciones. */
function GalleryHeader({ systemId, section, entries, browse }: { systemId: string; section: Section; entries: Entry[]; browse: string }) {
  const nav = buildNav(systemId);
  const latest = nav.items.filter((i) => i.seccion === section.id && i.creado).sort((a, b) => (b.creado ?? '').localeCompare(a.creado ?? ''))[0];
  return (
    <PageHeader>
      {latest && <Announcement href={latest.href}>{latest.nuevo ? 'Nuevo: ' : ''}{latest.titulo}</Announcement>}
      <PageHeaderHeading>{section.titular ?? section.label}</PageHeaderHeading>
      <PageHeaderDescription>{section.descripcion}</PageHeaderDescription>
      <PageActions>
        {entries.length > 0 && (
          <Button asChild size="sm">
            <a href="#galeria">{browse}</a>
          </Button>
        )}
        <CopyPromptButton prompt={section.accion.prompt.replaceAll('{sistema}', systemId)} label={section.accion.label} variant={entries.length ? 'ghost' : 'default'} />
      </PageActions>
    </PageHeader>
  );
}

/** Una sección vacía es estructura por llenar: se explica qué va aquí y cómo pedírselo al agente. */
function EmptyGallery({ systemId, section }: { systemId: string; section: Section }) {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center gap-3 rounded-xl border border-dashed bg-background p-8 text-center md:p-12">
      <h2 className="text-lg font-semibold">Todavía no hay {section.label.toLowerCase()}</h2>
      <p className="text-sm text-balance text-muted-foreground">
        Esta sección es estructura: se llena con lo que ya existe en tu producto o con lo que diseñéis desde cero. Copia el prompt y pídeselo a tu agente.
      </p>
      <CodeBlock code={section.accion.prompt.replaceAll('{sistema}', systemId)} lang="prompt" className="mx-0 mt-2 w-full text-left" />
    </div>
  );
}

/** Ficha sin ejemplo en vivo: se enlaza igualmente, con su estado. */
function EntryCard({ entry }: { entry: Entry }) {
  return (
    <Link href={entry.href} data-slot="card" className="flex flex-col gap-1 rounded-xl border bg-background p-6 text-sm transition-colors hover:bg-accent/50">
      <span className="flex items-center gap-2 font-medium">
        {entry.titulo}
        {entry.estado !== 'produccion' && <StatusDot item={{ estado: entry.estado, sync: null }} className="size-1.5" />}
      </span>
      <span className="text-muted-foreground">{entry.resumen}</span>
      <span className="mt-2 text-xs text-muted-foreground">Sin ejemplo en vivo todavía.</span>
    </Link>
  );
}

/** Página ancha de Bloques o Gráficos, con la forma de Blocks y Charts en ui.shadcn.com. */
export async function GalleryPage({ systemId, sectionId }: { systemId: string; sectionId: 'bloques' | 'graficos' }) {
  const system = loadSystem(systemId);
  const section = SECTIONS.find((s) => s.id === sectionId)!;
  const entries = loadEntries(system).filter((e) => e.section === sectionId);
  const surfaces = previewSurfaces(system);
  const groups = byCategory(section, entries);
  const blocks = sectionId === 'bloques';

  const shown = await Promise.all(
    entries.map(async (entry) => {
      const preview = entryPreviews(entry)[0];
      const surface = preview && (surfaces[preview.superficie ?? ''] ?? Object.values(surfaces)[0]);
      return [entry.id, preview && surface ? { preview, surface, codeHtml: await highlight(preview.html, 'html') } : null] as const;
    }),
  );
  const live = Object.fromEntries(shown);

  return (
    <div className="flex flex-1 flex-col">
      <GalleryHeader systemId={systemId} section={section} entries={entries} browse={blocks ? 'Ver bloques' : 'Ver gráficos'} />
      {groups.length > 0 && (
        <PageNav id="galeria">
          <CategoryNav items={groups.map((g) => ({ href: `#${anchor(g.label)}`, label: g.label }))} />
        </PageNav>
      )}
      <div className="container-wrapper section-soft flex-1 pb-12 md:py-12">
        <div className="container">
          {!entries.length && <EmptyGallery systemId={systemId} section={section} />}
          <div className="flex flex-col gap-12 md:gap-24">
            {groups.map((group) => (
              <section key={group.label} id={anchor(group.label)} className="flex scroll-mt-24 flex-col gap-6">
                {groups.length > 1 && <h2 className="text-lg font-semibold tracking-tight">{group.label}</h2>}
                {blocks ? (
                  <div className="flex flex-col gap-12 md:gap-24">
                    {group.entries.map((entry) => {
                      const item = live[entry.id];
                      if (!item) return <EntryCard key={entry.id} entry={entry} />;
                      return (
                        <BlockViewer
                          key={entry.id}
                          id={entry.slug}
                          title={entry.titulo}
                          href={entry.href}
                          md={`${entry.href}.md`}
                          html={item.preview.html}
                          code={item.preview.html}
                          codeHtml={item.codeHtml}
                          surface={item.surface}
                          background={item.preview.fondo ?? undefined}
                          vista={item.preview.vista}
                          mode={item.preview.modo}
                        />
                      );
                    })}
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {group.entries.map((entry) => {
                      const item = live[entry.id];
                      if (!item) return <EntryCard key={entry.id} entry={entry} />;
                      return (
                        <div key={entry.id} id={entry.slug} data-slot="chart" className="relative flex scroll-mt-24 flex-col overflow-hidden rounded-xl border bg-background">
                          <div className="flex items-center gap-2 border-b py-2 pr-12 pl-4">
                            <Link href={entry.href} className="text-sm font-medium underline-offset-2 hover:underline">{entry.titulo}</Link>
                            <CopyButton value={item.preview.html} className="top-1.5 bg-transparent" />
                          </div>
                          <Preview html={item.preview.html} surface={item.surface} background={item.preview.fondo ?? undefined} minHeight={240} vista={item.preview.vista} mode={item.preview.modo} />
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
