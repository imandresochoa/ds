import Link from 'next/link';
import { CodeBlock } from '@/components/CodeBlock';
import { CopyPromptButton } from '@/components/CopyPromptButton';
import { StatusDot } from '@/components/docs/StatusBadge';
import { PageActions, PageHeader, PageHeaderDescription, PageHeaderHeading } from '@/components/site/PageHeader';
import { SECTIONS, STATUSES, loadEntries, loadSystem } from '@/lib/core.mjs';
import { groupLabel, sortGroups } from '@/lib/nav';

const section = SECTIONS.find((s) => s.id === 'iniciativas')!;
export const metadata = { title: section.label, description: section.descripcion };

/** Iniciativas: el trabajo que viene, en tarjetas. Primero lo que está en curso; después, lo ya publicado. */
export default async function Iniciativas({ params }: { params: Promise<{ system: string }> }) {
  const { system: id } = await params;
  const entries = loadEntries(loadSystem(id));
  const initiatives = entries.filter((e) => e.section === 'iniciativas');
  const groups = sortGroups(section, [...new Set(initiatives.map((e) => groupLabel(section, e)))].map((label) => ({ label })));
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
              <h2 className="text-lg font-semibold">No hay iniciativas abiertas</h2>
              <p className="text-sm text-balance text-muted-foreground">Una iniciativa agrupa las piezas nuevas que atraviesan varias capas hasta que llegan a producción.</p>
              <CodeBlock code={prompt} lang="prompt" className="mx-0 mt-2 w-full text-left" />
            </div>
          )}
          {groups.map(({ label }) => (
            <section key={label} className="flex flex-col gap-4">
              <h2 className="text-lg font-semibold tracking-tight">{label}</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {initiatives.filter((e) => groupLabel(section, e) === label).map((e) => {
                  const pieces = entries.filter((p) => p.data.iniciativa === e.slug);
                  return (
                    <Link key={e.id} href={e.href} data-slot="card" className="flex flex-col gap-2 rounded-xl border bg-background p-6 text-sm transition-colors hover:bg-accent/50">
                      <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                        <StatusDot item={{ estado: e.estado, sync: null }} className="size-1.5" />
                        {STATUSES[e.estado as keyof typeof STATUSES]?.label ?? e.estado}
                      </span>
                      <span className="text-base font-medium">{e.titulo}</span>
                      <span className="line-clamp-3 text-muted-foreground">{e.resumen}</span>
                      <span className="mt-auto pt-2 text-xs text-muted-foreground">
                        {pieces.length ? `${pieces.length} ${pieces.length === 1 ? 'pieza' : 'piezas'}` : 'Sin piezas todavía'}
                        {e.data.actualizado && ` · Actualizada el ${e.data.actualizado}`}
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
}
