import { notFound } from 'next/navigation';
import { AgentsPage } from '@/components/docs/AgentsPage';
import { DocsArticle } from '@/components/docs/DocsArticle';
import { ProductionPage } from '@/components/docs/ProductionPage';
import { Markdown } from '@/components/Markdown';
import { loadPages, loadSystem } from '@/lib/core.mjs';
import { prepareMarkdown } from '@/lib/markdown';
import { buildNav, KIT_PAGES } from '@/lib/nav';
import { previewSurfaces } from '@/lib/surfaces';

type Params = { system: string; slug?: string[] };

export const dynamicParams = false;
export function generateStaticParams({ params }: { params: { system: string } }) {
  const own = loadPages(loadSystem(params.system)).filter((p) => !KIT_PAGES.some((k) => k.slug === p.slug));
  return [...own.map((p) => ({ slug: p.slug ? [p.slug] : [] })), ...KIT_PAGES.map((p) => ({ slug: [p.slug] }))];
}

function find(systemId: string, slug: string) {
  const kit = KIT_PAGES.find((p) => p.slug === slug);
  if (kit) return { kit, page: null };
  return { kit: null, page: loadPages(loadSystem(systemId)).find((p) => p.slug === slug) ?? null };
}

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { system, slug = [] } = await params;
  const { kit, page } = find(system, slug.join('/'));
  return { title: kit?.titulo ?? page?.titulo, description: kit?.resumen ?? page?.resumen };
}

/** Páginas de Docs: la Introducción, las páginas propias del sistema (content/docs/) y las que genera el kit. */
export default async function DocsPage({ params }: { params: Promise<Params> }) {
  const { system: id, slug = [] } = await params;
  const system = loadSystem(id);
  const nav = buildNav(id);
  const { kit, page } = find(id, slug.join('/'));
  if (!kit && !page) notFound();
  const href = `/${id}/docs${slug.length ? `/${slug.join('/')}` : ''}`;

  if (kit) {
    return (
      <DocsArticle nav={nav} href={href} title={kit.titulo} description={kit.resumen} md={null}>
        {kit.slug === 'produccion' ? <ProductionPage system={system} /> : <AgentsPage system={system} />}
      </DocsArticle>
    );
  }

  const { parts, toc } = prepareMarkdown(page!.body);
  return (
    <DocsArticle nav={nav} href={href} title={page!.titulo} description={page!.resumen} md={`${href}.md`} toc={toc}>
      <Markdown prepared={parts} surfaces={previewSurfaces(system)} />
    </DocsArticle>
  );
}
