// Las páginas de un sistema, una vez para todos los idiomas. Cada archivo de app/(principal)/[system]/… y de
// app/(en)/en/[system]/… es una línea que llama a estas funciones: sin `traduccion`, el idioma principal del sistema
// en sus URL de siempre; con `traduccion` ('en'), la traducción, con las URL bajo /en.
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AgentsPage } from '@/components/docs/AgentsPage';
import { DocsArticle } from '@/components/docs/DocsArticle';
import { DocsSidebar } from '@/components/docs/DocsSidebar';
import { PageList } from '@/components/docs/PageList';
import { ProductionPage } from '@/components/docs/ProductionPage';
import { StatusDot } from '@/components/docs/StatusBadge';
import { CodeBlock } from '@/components/CodeBlock';
import { CopyPromptButton } from '@/components/CopyPromptButton';
import { EntryPage } from '@/components/EntryPage';
import { GalleryPage } from '@/components/Gallery';
import { Lab, type LabBase } from '@/components/lab/Lab';
import { Markdown } from '@/components/Markdown';
import { Preview } from '@/components/Preview';
import { I18nProvider } from '@/components/site/I18nProvider';
import { Announcement, CategoryNav, PageActions, PageHeader, PageHeaderDescription, PageHeaderHeading, PageNav } from '@/components/site/PageHeader';
import { SiteFooter } from '@/components/site/SiteFooter';
import { SiteHeader } from '@/components/site/SiteHeader';
import { Button } from '@/components/ui/button';
import { PLATFORM_SECTIONS, listSystems, loadDocs, loadEntries, loadExperimentalTokens, loadPages, loadProductionTokens, loadSyncReport, loadSystem, systemLanguages, tokenModes } from '@/lib/core.mjs';
import { prepareMarkdown } from '@/lib/markdown';
import { buildNav, groupLabel, pageLocale, sortGroups } from '@/lib/nav';
import { entryPreviews } from '@/lib/previews';
import { sitePath } from '@/lib/site';
import { previewSurfaces } from '@/lib/surfaces';

type Traduccion = string | null;
type P<T> = { params: Promise<T> };

/** ¿Existe el sistema en este idioma? Con output: 'export', las rutas de relleno (`_`) no lo cumplen y dan 404. */
const exists = (id: string, traduccion: Traduccion) =>
  listSystems().some((s) => s.id === id && (!traduccion || systemLanguages(s).traducciones.includes(traduccion)));

/** Con output: 'export', Next no acepta una lista vacía de parámetros: se genera una ruta de relleno que da 404. */
const orFiller = <T,>(list: T[], filler: T) => (list.length ? list : [filler]);

// --- Layout del sistema --------------------------------------------------------------------------------------------

export const systemParams = (traduccion: Traduccion) => () =>
  orFiller(listSystems().filter((s) => exists(s.id, traduccion)).map((s) => ({ system: s.id })), { system: '_' });

/** Estructura de ui.shadcn.com: cabecera fija, contenido y pie. */
export const systemLayout = (traduccion: Traduccion) =>
  async function SystemLayout({ children, params }: { children: React.ReactNode } & P<{ system: string }>) {
    const { system } = await params;
    if (!exists(system, traduccion)) notFound();
    const nav = buildNav(system, traduccion);
    return (
      <I18nProvider lang={nav.lang}>
        <div data-slot="layout" className="relative z-10 flex min-h-svh flex-col bg-background">
          <SiteHeader nav={nav} />
          <main className="flex min-h-0 flex-1 flex-col">{children}</main>
          <SiteFooter nav={nav} />
        </div>
      </I18nProvider>
    );
  };

/** Docs a tres columnas: barra lateral, contenido y «En esta página» (lo pone cada página). */
export const docsLayout = (traduccion: Traduccion) =>
  async function DocsLayout({ children, params }: { children: React.ReactNode } & P<{ system: string }>) {
    const { system } = await params;
    if (!exists(system, traduccion)) notFound();
    return (
      <div className="container-wrapper flex flex-1 flex-col px-2">
        <div
          className="min-h-min flex-1 items-start px-0 [--top-spacing:0] lg:grid lg:grid-cols-[var(--sidebar-width)_minmax(0,1fr)] lg:[--top-spacing:calc(var(--spacing)*4)]"
          style={{ '--sidebar-width': 'calc(var(--spacing) * 72)' } as React.CSSProperties}
        >
          <DocsSidebar nav={buildNav(system, traduccion)} />
          <div className="h-full w-full">{children}</div>
        </div>
      </div>
    );
  };

// --- Home ----------------------------------------------------------------------------------------------------------

/** Secciones cuyas fichas pueden salir en el escaparate de la home. */
const SHOWCASE_SECTIONS = ['componentes', 'bloques', 'graficos'];
const SHOWCASE_SIZE = 9;

export const homeMetadata = (traduccion: Traduccion) => async ({ params }: P<{ system: string }>) => {
  const { system } = await params;
  if (!exists(system, traduccion)) return {};
  const s = pageLocale(system, traduccion).system;
  return { title: { absolute: s.nombre }, description: s.descripcion };
};

/**
 * Home de un sistema con la forma de ui.shadcn.com: titular, descripción, dos acciones y, debajo, un escaparate
 * con los ejemplos en vivo de las fichas destacadas (`destacado: true`) o, si no hay, de las que tienen ejemplo.
 */
export const homePage = (traduccion: Traduccion) =>
  async function Home({ params }: P<{ system: string }>) {
    const { system: id } = await params;
    if (!exists(id, traduccion)) notFound();
    const { lang, t, meta, system } = pageLocale(id, traduccion);
    const nav = buildNav(id, traduccion);
    const base = `${nav.prefix}/${id}`;
    const entries = loadEntries(system, lang);
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

    const counts = Object.fromEntries(meta.CONTENT_SECTIONS.map((s) => [s.id, entries.filter((e) => e.section === s.id).length]));

    return (
      <div className="flex flex-1 flex-col">
        <PageHeader>
          {latest && <Announcement href={latest.href}>{latest.nuevo ? t.home.newPrefix : ''}{latest.titulo}</Announcement>}
          <PageHeaderHeading className="max-w-4xl">{system.nombre}</PageHeaderHeading>
          {system.descripcion && <PageHeaderDescription>{system.descripcion}</PageHeaderDescription>}
          <PageActions>
            <Button asChild size="sm">
              <Link href={`${base}/docs`}>{t.home.start}</Link>
            </Button>
            <Button asChild size="sm" variant="ghost">
              <Link href={`${base}/componentes`}>{t.home.seeComponents}</Link>
            </Button>
          </PageActions>
        </PageHeader>
        <PageNav className="hidden md:flex">
          <CategoryNav items={meta.CONTENT_SECTIONS.map((s) => ({ href: `${base}/${s.id}`, label: s.label }))} />
        </PageNav>
        <div className="container-wrapper section-soft flex-1 pb-6">
          <div className="container overflow-hidden">
            {pool.length > 0 ? (
              <section className="columns-1 gap-6 pt-6 md:columns-2 md:pt-0 xl:columns-3 *:mb-6 *:break-inside-avoid">
                {pool.map(({ entry, preview, surface }) => (
                  <div key={entry.id} data-slot="card" className="flex flex-col overflow-hidden rounded-xl border bg-background">
                    <Preview html={preview.html} surface={surface} background={preview.fondo ?? undefined} minHeight={160} />
                    <Link href={entry.href} className="flex items-center justify-between gap-2 border-t px-4 py-3 text-sm hover:bg-accent/50">
                      <span className="font-medium">{entry.titulo}</span>
                      <span className="text-xs text-muted-foreground">{meta.SECTIONS.find((s) => s.id === entry.section)?.label}</span>
                    </Link>
                  </div>
                ))}
              </section>
            ) : (
              // Sin ejemplos todavía: la estructura del sistema, sección a sección.
              <section className="grid gap-4 pt-6 md:grid-cols-2 md:pt-0 xl:grid-cols-3">
                {meta.CONTENT_SECTIONS.map((s) => (
                  <Link key={s.id} href={`${base}/${s.id}`} data-slot="card" className="flex flex-col gap-2 rounded-xl border bg-background p-6 text-sm transition-colors hover:bg-accent/50">
                    <span className="flex items-baseline justify-between gap-2">
                      <span className="text-base font-medium">{s.label}</span>
                      <span className="text-xs text-muted-foreground">{counts[s.id] ? t.home.entries(counts[s.id]) : t.home.toFill}</span>
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
  };

// --- Índice de una sección -----------------------------------------------------------------------------------------

/** Bloques, Gráficos e Iniciativas tienen su propia página ancha (galería); aquí, el resto de secciones. */
const docsSections = (traduccion: Traduccion, system: string) => pageLocale(system, traduccion).meta.SECTIONS.filter((s) => !s.galeria && s.id !== 'iniciativas');

export const sectionParams = (traduccion: Traduccion) => ({ params }: { params: { system: string } }) =>
  orFiller(exists(params.system, traduccion) ? docsSections(traduccion, params.system).filter((s) => s.id !== 'metodologia' || loadSystem(params.system).metodologia).map((s) => ({ section: s.id })) : [], { section: '_' });

export const sectionMetadata = (traduccion: Traduccion) => async ({ params }: P<{ system: string; section: string }>) => {
  const { system, section } = await params;
  if (!exists(system, traduccion)) return {};
  const info = pageLocale(system, traduccion).meta.SECTIONS.find((s) => s.id === section);
  return { title: info?.label, description: info?.descripcion };
};

/** Índice de una sección con la forma del índice de componentes de shadcn: «Nuevos» arriba y todas las fichas. */
export const sectionPage = (traduccion: Traduccion) =>
  async function SectionPage({ params }: P<{ system: string; section: string }>) {
    const { system: id, section: sectionId } = await params;
    if (!exists(id, traduccion)) notFound();
    const section = docsSections(traduccion, id).find((s) => s.id === sectionId);
    if (!section) notFound();
    const { t } = pageLocale(id, traduccion);
    const nav = buildNav(id, traduccion);
    const items = nav.groups.find((g) => g.id === section.id)?.items ?? [];
    const fresh = items.filter((i) => i.nuevo);
    const groups = section.agrupar === 'grupo' ? [...new Set(items.map((i) => i.grupo ?? ''))] : [];

    return (
      <DocsArticle nav={nav} href={`${nav.prefix}/${id}/${section.id}`} title={section.label} description={section.descripcion} md={null}>
        <div className="ds-prose">
          {!items.length && <p className="text-muted-foreground">{t.docs.emptySection(section.accion.label)}</p>}
          {fresh.length > 0 && (
            <>
              <h2 id="nuevos">{t.docs.fresh}</h2>
              <PageList items={fresh} lang={nav.lang} />
            </>
          )}
          {groups.length > 1 ? (
            groups.map((g) => (
              <div key={g}>
                <h2 id={g}>{g}</h2>
                <PageList items={items.filter((i) => i.grupo === g)} lang={nav.lang} />
              </div>
            ))
          ) : (
            items.length > 0 && (
              <>
                {fresh.length > 0 && <h2 id="todos">{t.docs.all}</h2>}
                <PageList items={items} lang={nav.lang} />
              </>
            )
          )}
        </div>
      </DocsArticle>
    );
  };

// --- Ficha y metodología ---------------------------------------------------------------------------------------------

type EntryParams = { system: string; section: string; entry: string };

// Los parámetros llegan solo desde los layouts (aquí, `system`): se generan sección y ficha juntas.
export const entryParams = (traduccion: Traduccion) => ({ params }: { params: { system: string } }) => {
  if (!exists(params.system, traduccion)) return [{ section: '_', entry: '_' }];
  const { lang, system } = pageLocale(params.system, traduccion);
  const docs = system.metodologia ? loadDocs(lang).map((d) => ({ section: 'metodologia', entry: d.slug })) : [];
  return orFiller([...docs, ...loadEntries(system, lang).map((e) => ({ section: e.section, entry: e.slug }))], { section: '_', entry: '_' });
};

function findEntry(traduccion: Traduccion, { system: id, section, entry }: EntryParams) {
  const { lang, system } = pageLocale(id, traduccion);
  if (section === 'metodologia') return { doc: system.metodologia ? loadDocs(lang).find((d) => d.slug === entry) ?? null : null, item: null };
  return { doc: null, item: loadEntries(system, lang).find((e) => e.section === section && e.slug === entry) ?? null };
}

export const entryMetadata = (traduccion: Traduccion) => async ({ params }: P<EntryParams>) => {
  const p = await params;
  if (!exists(p.system, traduccion)) return {};
  const { doc, item } = findEntry(traduccion, p);
  const prefix = traduccion ? `/${traduccion}` : '';
  const md = doc ? sitePath(`${prefix}/metodologia/${doc.slug}.md`) : item ? sitePath(`${item.href}.md`) : undefined;
  return { title: doc?.titulo ?? item?.titulo, description: doc?.resumen ?? item?.resumen, alternates: md ? { types: { 'text/markdown': md } } : undefined };
};

export const entryPage = (traduccion: Traduccion) =>
  async function Page({ params }: P<EntryParams>) {
    const p = await params;
    if (!exists(p.system, traduccion)) notFound();
    const { doc, item } = findEntry(traduccion, p);
    const nav = buildNav(p.system, traduccion);
    if (doc) {
      const { parts, toc } = prepareMarkdown(doc.body);
      return (
        <DocsArticle nav={nav} href={`${nav.prefix}/${p.system}/metodologia/${doc.slug}`} title={doc.titulo} description={doc.resumen} md={`${nav.prefix}/metodologia/${doc.slug}.md`} toc={toc} traduccion={doc.traduccion} original="es">
          <Markdown prepared={parts} />
        </DocsArticle>
      );
    }
    if (!item || !nav.groups.some((g) => g.id === p.section)) notFound();
    return <EntryPage system={pageLocale(p.system, traduccion).system} entry={item} platform="web" nav={nav} />;
  };

// --- Ficha en iOS y Android ------------------------------------------------------------------------------------------

type PlatformParams = EntryParams & { platform: string };

export const platformParams = (traduccion: Traduccion) => ({ params }: { params: { system: string } }) => {
  const list = exists(params.system, traduccion)
    ? loadEntries(loadSystem(params.system))
        .filter((e) => PLATFORM_SECTIONS.includes(e.section))
        .flatMap((e) => ['ios', 'android'].map((platform) => ({ section: e.section, entry: e.slug, platform })))
    : [];
  return orFiller(list, { section: '_', entry: '_', platform: '_' });
};

const findPlatformEntry = (traduccion: Traduccion, p: PlatformParams) => {
  const { lang, system } = pageLocale(p.system, traduccion);
  return loadEntries(system, lang).find((e) => e.section === p.section && e.slug === p.entry);
};

export const platformMetadata = (traduccion: Traduccion) => async ({ params }: P<PlatformParams>) => {
  const p = await params;
  if (!exists(p.system, traduccion)) return {};
  const item = findPlatformEntry(traduccion, p);
  return { title: item ? `${item.titulo} · ${p.platform === 'ios' ? 'iOS' : 'Android'}` : undefined };
};

export const platformPage = (traduccion: Traduccion) =>
  async function PlatformPage({ params }: P<PlatformParams>) {
    const p = await params;
    if (!exists(p.system, traduccion)) notFound();
    const item = findPlatformEntry(traduccion, p);
    if (!item || !['ios', 'android'].includes(p.platform)) notFound();
    return <EntryPage system={pageLocale(p.system, traduccion).system} entry={item} platform={p.platform} nav={buildNav(p.system, traduccion)} />;
  };

// --- Páginas de Docs -------------------------------------------------------------------------------------------------

type DocsParams = { system: string; slug?: string[] };

export const docsParams = (traduccion: Traduccion) => ({ params }: { params: { system: string } }) => {
  if (!exists(params.system, traduccion)) return [{ slug: ['_'] }];
  const { lang, system, meta } = pageLocale(params.system, traduccion);
  const own = loadPages(system, lang).filter((p) => !meta.KIT_PAGES.some((k) => k.slug === p.slug));
  return [...own.map((p) => ({ slug: p.slug ? [p.slug] : [] })), ...meta.KIT_PAGES.map((p) => ({ slug: [p.slug] }))];
};

function findPage(traduccion: Traduccion, systemId: string, slug: string) {
  const { lang, system, meta } = pageLocale(systemId, traduccion);
  const kit = meta.KIT_PAGES.find((p) => p.slug === slug);
  if (kit) return { kit, page: null };
  return { kit: null, page: loadPages(system, lang).find((p) => p.slug === slug) ?? null };
}

export const docsMetadata = (traduccion: Traduccion) => async ({ params }: P<DocsParams>) => {
  const { system, slug = [] } = await params;
  if (!exists(system, traduccion)) return {};
  const { kit, page } = findPage(traduccion, system, slug.join('/'));
  return { title: kit?.titulo ?? page?.titulo, description: kit?.resumen ?? page?.resumen };
};

/** Páginas de Docs: la Introducción, las páginas propias del sistema (content/docs/) y las que genera el kit. */
export const docsPage = (traduccion: Traduccion) =>
  async function DocsPage({ params }: P<DocsParams>) {
    const { system: id, slug = [] } = await params;
    if (!exists(id, traduccion)) notFound();
    const { system } = pageLocale(id, traduccion);
    const nav = buildNav(id, traduccion);
    const { kit, page } = findPage(traduccion, id, slug.join('/'));
    if (!kit && !page) notFound();
    const href = `${nav.prefix}/${id}/docs${slug.length ? `/${slug.join('/')}` : ''}`;

    if (kit) {
      return (
        <DocsArticle nav={nav} href={href} title={kit.titulo} description={kit.resumen} md={null}>
          {kit.slug === 'produccion' ? <ProductionPage system={system} nav={nav} /> : <AgentsPage system={system} nav={nav} />}
        </DocsArticle>
      );
    }

    const { parts, toc } = prepareMarkdown(page!.body);
    return (
      <DocsArticle nav={nav} href={href} title={page!.titulo} description={page!.resumen} md={`${href}.md`} toc={toc} traduccion={page!.traduccion}>
        <Markdown prepared={parts} surfaces={previewSurfaces(system)} />
      </DocsArticle>
    );
  };

// --- Galerías: Bloques y Gráficos -------------------------------------------------------------------------------------

export const galleryMetadata = (traduccion: Traduccion, sectionId: 'bloques' | 'graficos' | 'iniciativas') => async ({ params }: P<{ system: string }>) => {
  const { system } = await params;
  if (!exists(system, traduccion)) return {};
  const section = pageLocale(system, traduccion).meta.SECTIONS.find((s) => s.id === sectionId)!;
  return { title: section.label, description: section.descripcion };
};

export const galleryPage = (traduccion: Traduccion, sectionId: 'bloques' | 'graficos') =>
  async function Gallery({ params }: P<{ system: string }>) {
    const { system } = await params;
    if (!exists(system, traduccion)) notFound();
    return <GalleryPage systemId={system} sectionId={sectionId} traduccion={traduccion} />;
  };

// --- Iniciativas ------------------------------------------------------------------------------------------------------

/** Iniciativas: el trabajo que viene, en tarjetas. Primero lo que está en curso; después, lo ya publicado. */
export const initiativesPage = (traduccion: Traduccion) =>
  async function Iniciativas({ params }: P<{ system: string }>) {
    const { system: id } = await params;
    if (!exists(id, traduccion)) notFound();
    const { lang, t, meta, system } = pageLocale(id, traduccion);
    const section = meta.SECTIONS.find((s) => s.id === 'iniciativas')!;
    const entries = loadEntries(system, lang);
    const initiatives = entries.filter((e) => e.section === 'iniciativas');
    const groups = sortGroups(section, [...new Set(initiatives.map((e) => groupLabel(section, e, lang)))].map((label) => ({ label })), lang);
    const prompt = section.accion.prompt.replaceAll('{sistema}', id);

    return (
      <div className="flex flex-1 flex-col">
        <PageHeader>
          <PageHeaderHeading>{section.titular}</PageHeaderHeading>
          <PageHeaderDescription>{section.descripcion}</PageHeaderDescription>
          <PageActions>
            <CopyPromptButton prompt={prompt} label={section.accion.label} variant={initiatives.length ? 'ghost' : 'default'} />
          </PageActions>
        </PageHeader>
        <div className="container-wrapper section-soft flex-1 pb-12 md:py-12">
          <div className="container flex flex-col gap-12">
            {!initiatives.length && (
              <div className="mx-auto flex max-w-2xl flex-col items-center gap-3 rounded-xl border border-dashed bg-background p-8 text-center md:p-12">
                <h2 className="text-lg font-semibold">{t.initiatives.none}</h2>
                <p className="text-sm text-balance text-muted-foreground">{t.initiatives.noneText}</p>
                <CodeBlock code={prompt} lang="prompt" className="mx-0 mt-2 w-full text-left" />
              </div>
            )}
            {groups.map(({ label }) => (
              <section key={label} className="flex flex-col gap-4">
                <h2 className="text-lg font-semibold tracking-tight">{label}</h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {initiatives.filter((e) => groupLabel(section, e, lang) === label).map((e) => {
                    const pieces = entries.filter((p) => p.data.iniciativa === e.slug);
                    return (
                      <Link key={e.id} href={e.href} data-slot="card" className="flex flex-col gap-2 rounded-xl border bg-background p-6 text-sm transition-colors hover:bg-accent/50">
                        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                          <StatusDot item={{ estado: e.estado, sync: null }} className="size-1.5" />
                          {meta.STATUSES[e.estado as keyof typeof meta.STATUSES]?.label ?? e.estado}
                        </span>
                        <span className="text-base font-medium">{e.titulo}</span>
                        <span className="line-clamp-3 text-muted-foreground">{e.resumen}</span>
                        <span className="mt-auto pt-2 text-xs text-muted-foreground">
                          {pieces.length ? t.initiatives.pieces(pieces.length) : t.initiatives.noPieces}
                          {e.data.actualizado && t.initiatives.updated(e.data.actualizado)}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>
    );
  };

// --- Lab de primitivos ------------------------------------------------------------------------------------------------

type Values = Record<string, string | Record<string, string>>;

export const labMetadata = (traduccion: Traduccion) => async ({ params }: P<{ system: string }>) => {
  const { system } = await params;
  if (!exists(system, traduccion)) return {};
  const { t } = pageLocale(system, traduccion);
  return { title: t.lab.title, description: t.lab.metaDescription };
};

export const labPage = (traduccion: Traduccion) =>
  async function LabPage({ params }: P<{ system: string }>) {
    const { system: id } = await params;
    if (!exists(id, traduccion)) notFound();
    const { t, system } = pageLocale(id, traduccion);
    const report = loadSyncReport(system);
    const production = loadProductionTokens(system) as Record<string, Values>;
    const names = system.produccion?.superficies ?? {};
    // Lo que se puede ajustar: los tokens de cada superficie de producción, sin los puentes de @theme
    // (--color-x: var(--x)), que cambian con su token.
    const bases: LabBase[] = Object.entries(production).map(([surface, values]) => {
      const theme = (report?.tokens?.[surface]?.theme ?? {}) as Record<string, string>;
      const own = Object.fromEntries(Object.entries(values).filter(([name]) => !theme[name]?.includes('var(')));
      const declared = (report?.tokens?.[surface]?.modos ?? null) as Record<string, string[]> | null;
      return { id: surface, nombre: names[surface]?.nombre ?? surface, valores: own, modos: tokenModes(own, declared), selectores: declared };
    });
    // Y los de experimental/ escritos a mano (desde una web o Figma). Si los generó el Lab, se vuelven a abrir en «Generar».
    const experimental = loadExperimentalTokens(system);
    if (experimental && !experimental.preset) bases.push({ id: 'experimental', nombre: t.lab.experimental, valores: experimental.values as Values, modos: tokenModes(experimental.values, experimental.info.modos), selectores: experimental.info.modos });

    return (
      <div className="flex flex-1 flex-col">
        <PageHeader>
          <PageHeaderHeading>{t.lab.title}</PageHeaderHeading>
          <PageHeaderDescription>{t.lab.description}</PageHeaderDescription>
        </PageHeader>
        <Lab systemId={system.id} bases={bases} saved={experimental?.preset ?? null} production={Boolean(system.produccion)} />
      </div>
    );
  };
