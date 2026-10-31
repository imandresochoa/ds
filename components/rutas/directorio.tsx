import Link from 'next/link';
import { SystemMark } from '@/components/site/icons';
import { listSystems, localeMeta, localizeSystem, siteLanguage, systemsIn } from '@/lib/core.mjs';
import { messages } from '@/lib/i18n';
import { loadDirectoryIndex } from '@/lib/registry.mjs';
import { sitePath } from '@/lib/site';

// Con un solo sistema (lo normal en un repo de sistema), redirige a su home. Con varios (un repo de directorio),
// es el Directorio: una tarjeta por sistema con su cobertura y el enlace a su registry. En /en, solo los sistemas
// traducidos; si no hay ninguno, lleva a la portada del idioma principal.
export function Directory({ traduccion = null }: { traduccion?: string | null }) {
  const lang = traduccion ?? siteLanguage();
  const t = messages(lang);
  const { STATUSES } = localeMeta(lang);
  const prefix = traduccion ? `/${traduccion}` : '';
  const systems = (traduccion ? systemsIn(traduccion) : listSystems()).map((s) => localizeSystem(s, lang));
  const directory = loadDirectoryIndex();
  const llms = `${prefix}/llms.txt`;
  if (traduccion && !systems.length) return <meta httpEquiv="refresh" content={`0;url=${sitePath('/')}`} />;
  return (
    <main className="mx-auto flex min-h-svh w-full max-w-3xl flex-col justify-center gap-8 px-4 py-16 sm:px-6">
      {systems.length === 1 && !directory && <meta httpEquiv="refresh" content={`0;url=${sitePath(`${prefix}/${systems[0].id}`)}`} />}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">{directory?.nombre ?? t.site.title}</h1>
        {directory?.descripcion && <p className="text-muted-foreground">{directory.descripcion}</p>}
        <p className="text-muted-foreground">
          {t.directory.agentsStart} <a href={sitePath(llms)} className="font-medium text-foreground underline underline-offset-4">{sitePath(llms)}</a>
          {directory && (
            <>
              {' '}{t.directory.or} <a href={sitePath('/directorio.json')} className="font-medium text-foreground underline underline-offset-4">{sitePath('/directorio.json')}</a>
            </>
          )}
          .
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {systems.map((s) => {
          const summary = directory?.sistemas.find((d) => d.id === s.id);
          const enProduccion = summary?.fichas.estados.produccion ?? 0;
          return (
            <div key={s.id} data-slot="card" className="flex flex-col gap-4 rounded-xl border p-4">
              <Link href={`${prefix}/${s.id}`} className="flex items-center gap-4 rounded-lg transition-colors hover:text-foreground/80">
                <SystemMark system={s} className="size-10 rounded-lg text-sm" />
                <span className="flex min-w-0 flex-col">
                  <span className="font-medium">{s.nombre}</span>
                  {s.descripcion && <span className="line-clamp-2 text-sm text-muted-foreground">{s.descripcion}</span>}
                </span>
              </Link>
              {summary && (
                <dl className="grid gap-1 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">{t.directory.entries}</dt>
                    <dd>
                      {summary.fichas.total} · {enProduccion} {STATUSES.produccion.label.toLowerCase()}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">{t.directory.sync}</dt>
                    <dd>{summary.sync ? t.directory.synced(summary.sync.estados.ok ?? 0, summary.sync.total) : t.directory.unlinked}</dd>
                  </div>
                  {summary.cobertura?.map((c) => (
                    <div key={`${c.tipo}:${c.superficie}`} className="flex justify-between gap-4">
                      <dt className="text-muted-foreground">
                        {c.nombre} · {t.directory.coverage[c.tipo] ?? c.tipo}
                      </dt>
                      <dd>
                        {t.directory.documented(c.documentadas, c.total)}
                      </dd>
                    </div>
                  ))}
                </dl>
              )}
              {summary && (
                <div className="mt-auto flex gap-4 text-sm">
                  <a href={sitePath(summary.registry)} className="font-mono text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">registry.json</a>
                  <a href={sitePath(summary.design)} className="font-mono text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">design.md</a>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}
