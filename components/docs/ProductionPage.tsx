import Link from 'next/link';
import { loadEntries, loadSyncReport, localeMeta } from '@/lib/core.mjs';
import { messages } from '@/lib/i18n';
import type { Nav, System } from '@/lib/nav';
import { Badge } from '@/components/ui/badge';
import { StatusDot } from './StatusBadge';

type Coverage = { total: number; documentadas: number; sinDocumentar: string[] };

// Claves de la cobertura del informe: «<superficie>» (clases), «tokens:<superficie>» y «componentes:<superficie>».
const COVERAGE_ITEMS: Record<string, (name: string) => string> = { clases: (name) => `.${name}`, tokens: (name) => `--${name}`, componentes: (name) => name };

/** Estado del enlace con producción: lo que calcula `npx ds sync`, en una página. */
export function ProductionPage({ system, nav }: { system: System; nav: Nav }) {
  const t = messages(nav.lang).production;
  const { SYNC_STATES } = localeMeta(nav.lang);
  const coverageKind = (key: string) => {
    const [kind, surface] = (key.includes(':') ? key.split(':') : ['clases', key]) as [string, string];
    const known = t.kinds[kind] ? kind : 'clases';
    return { ...t.kinds[known], item: COVERAGE_ITEMS[known], surface };
  };
  const entries = loadEntries(system, nav.lang);
  const report = loadSyncReport(system);
  if (!report) {
    return (
      <div className="ds-prose">
        <p>{t.noSync}</p>
      </div>
    );
  }
  const synced = entries.filter((e) => report.entradas?.[e.id]?.estado);
  const drift = entries.filter((e) => ['desajuste', 'ausente', 'nuevo'].includes(report.entradas?.[e.id]?.estado));
  const coverage = (report.cobertura ?? {}) as Record<string, Coverage>;
  const surfaces = (system.produccion?.superficies ?? {}) as Record<string, { nombre: string }>;
  const stats = [
    { value: `${synced.length - drift.length}/${synced.length}`, label: t.synced },
    { value: String(drift.length), label: t.toReview },
    ...Object.entries(coverage).map(([key, c]) => {
      const k = coverageKind(key);
      return { value: `${c.documentadas}/${c.total}`, label: t.coverage(k.label, surfaces[k.surface]?.nombre ?? k.surface, k.done) };
    }),
  ];

  return (
    <div className="ds-prose">
      <div className="grid gap-3 sm:grid-cols-2">
        {stats.map((s) => (
          <div key={s.label} data-slot="card" className="flex flex-col gap-1 rounded-xl border p-4">
            <span className="text-2xl font-semibold tracking-tight tabular-nums">{s.value}</span>
            <span className="text-sm text-muted-foreground">{s.label}</span>
          </div>
        ))}
      </div>
      <p className="text-sm text-muted-foreground">
        {t.commit(<code>{report.commit}</code>, report.fechaCommit, report.generado.slice(0, 16).replace('T', ' '))}
        {report.sinCommit?.length > 0 && t.uncommitted(report.sinCommit.length)}
      </p>

      {drift.length > 0 && (
        <>
          <h2 id="por-revisar">{t.review}</h2>
          <div className="ds-table-scroll">
            <table>
              <thead><tr><th>{t.entry}</th><th>{t.state}</th></tr></thead>
              <tbody>
                {drift.map((e) => (
                  <tr key={e.id}>
                    <td><Link href={e.href}>{e.titulo}</Link> <span className="font-mono text-xs text-muted-foreground">{e.id}</span></td>
                    <td>
                      <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                        <StatusDot item={{ estado: 'produccion', sync: report.entradas[e.id].estado }} className="size-1.5" />
                        {SYNC_STATES[report.entradas[e.id].estado as keyof typeof SYNC_STATES]?.label}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {Object.entries(coverage).filter(([, c]) => c.sinDocumentar.length > 0).map(([key, c]) => {
        const k = coverageKind(key);
        return (
          <div key={key}>
            <h2 id={`sin-ficha-${key.replace(':', '-')}`}>{t.undocumentedTitle(k.label, surfaces[k.surface]?.nombre ?? k.surface)}</h2>
            <p className="text-sm text-muted-foreground">{t.undocumentedText(c.sinDocumentar.length, k.label)}</p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {c.sinDocumentar.map((name) => <Badge key={name} variant="outline" className="rounded-full font-mono font-normal">{k.item(name)}</Badge>)}
            </div>
          </div>
        );
      })}
    </div>
  );
}
