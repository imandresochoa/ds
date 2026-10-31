import { ArrowLeftIcon, ArrowRightIcon, LanguagesIcon } from 'lucide-react';
import Link from 'next/link';
import { messages } from '@/lib/i18n';
import type { TocItem } from '@/lib/markdown';
import { neighbours, type Nav } from '@/lib/nav';
import { Button } from '@/components/ui/button';
import { AgentCta } from './AgentCta';
import { DocsCopyPage } from './DocsCopyPage';
import { DocsToc } from './DocsToc';

/**
 * Página de Docs de ui.shadcn.com: título con «Copiar página» y anterior/siguiente, descripción, insignias,
 * contenido a 640 px y, a la derecha, «En esta página» y la tarjeta para agentes.
 * En una traducción, `traduccion` avisa si la página aún no está traducida ('falta': se lee el original, en su
 * idioma, `original`) o si el original cambió después de traducirla ('desfasada').
 */
export function DocsArticle({ nav, href, title, description, md, badges, toc = [], traduccion = null, original, children }: {
  nav: Nav;
  href: string;
  title: string;
  description?: string;
  md: string | null;
  badges?: React.ReactNode;
  toc?: TocItem[];
  traduccion?: string | null;
  original?: string;
  children: React.ReactNode;
}) {
  const { previous, next } = neighbours(nav, href);
  const t = messages(nav.lang);
  const source = original ?? nav.idiomas[0]?.lang ?? 'es';
  // Sin traducción, el título, la descripción y el contenido están en el idioma del original.
  const fallback = traduccion === 'falta' ? source : undefined;
  const notice = traduccion === 'falta' ? t.translation.missing(t.translation.languageName[source]) : traduccion === 'desfasada' ? t.translation.stale(t.translation.languageName[source]) : null;
  return (
    <div data-slot="docs" className="flex scroll-mt-24 items-stretch pb-8 text-[1.05rem] sm:text-[15px] xl:w-full">
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="h-(--top-spacing) shrink-0" />
        <div className="mx-auto flex w-full max-w-160 min-w-0 flex-1 flex-col gap-6 px-4 py-6 text-foreground md:px-0 lg:py-8">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-4 md:items-start">
              <h1 lang={fallback} className="scroll-m-24 text-3xl font-semibold tracking-tight">{title}</h1>
              <div className="docs-nav flex items-center gap-2">
                {md && (
                  <div className="hidden sm:block">
                    <DocsCopyPage md={md} nav={nav} />
                  </div>
                )}
                <div className="ml-auto flex gap-2">
                  {previous && (
                    <Button variant="secondary" size="icon" className="extend-touch-target size-8 shadow-none md:size-7" asChild>
                      <Link href={previous.href}><ArrowLeftIcon /><span className="sr-only">{t.docs.previous}</span></Link>
                    </Button>
                  )}
                  {next && (
                    <Button variant="secondary" size="icon" className="extend-touch-target size-8 shadow-none md:size-7" asChild>
                      <Link href={next.href}><span className="sr-only">{t.docs.next}</span><ArrowRightIcon /></Link>
                    </Button>
                  )}
                </div>
              </div>
            </div>
            {description && <p lang={fallback} className="text-[1.05rem] text-balance text-muted-foreground sm:text-base md:max-w-[80%]">{description}</p>}
          </div>
          {badges && <div className="-mt-2 flex flex-wrap items-center gap-2">{badges}</div>}
          {notice && (
            <p role="note" className="-mt-2 flex items-start gap-2 rounded-lg border px-3 py-2 text-sm text-muted-foreground">
              <LanguagesIcon className="mt-0.5 size-4 shrink-0" />
              {notice}
            </p>
          )}
          <div lang={fallback} className="w-full flex-1 pb-16 sm:pb-0">{children}</div>
          <div className="hidden h-16 w-full items-center gap-2 px-4 sm:flex sm:px-0">
            {previous && (
              <Button variant="secondary" size="sm" asChild className="shadow-none">
                <Link href={previous.href}><ArrowLeftIcon /> {previous.titulo}</Link>
              </Button>
            )}
            {next && (
              <Button variant="secondary" size="sm" className="ml-auto shadow-none" asChild>
                <Link href={next.href}>{next.titulo} <ArrowRightIcon /></Link>
              </Button>
            )}
          </div>
        </div>
      </div>
      <div className="sticky top-[calc(var(--header-height)+1px)] z-30 ml-auto hidden h-[90svh] w-(--sidebar-width) flex-col gap-4 overflow-hidden overscroll-none pb-8 xl:flex">
        <div className="h-(--top-spacing) shrink-0" />
        {toc.length > 0 && (
          <div className="no-scrollbar flex flex-col gap-8 overflow-y-auto px-8">
            <DocsToc toc={toc} />
          </div>
        )}
        <div className="hidden flex-1 flex-col gap-6 px-6 xl:flex">
          <AgentCta nav={nav} />
        </div>
      </div>
    </div>
  );
}
