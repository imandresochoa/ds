import Link from 'next/link';
import { loadEntries, loadSyncReport, SYNC_STATES } from '@/lib/core.mjs';
import { entrySurfaces, surfacesAttr, type System } from '@/lib/nav';
import { Badge } from '@/components/ui/badge';
import { StatusDot } from './StatusBadge';

type Coverage = { total: number; documentadas: number; sinDocumentar: string[] };

// Claves de la cobertura del informe: «<superficie>» (clases), «tokens:<superficie>» y «componentes:<superficie>».
const COVERAGE_KINDS: Record<string, { label: string; done: string; item: (name: string) => string }> = {
  clases: { label: 'clases', done: 'documentadas', item: (name) => `.${name}` },
  tokens: { label: 'tokens', done: 'documentados', item: (name) => `--${name}` },
  componentes: { label: 'componentes', done: 'documentados', item: (name) => name },
};
const coverageKind = (key: string) => {
  const [kind, surface] = (key.includes(':') ? key.split(':') : ['clases', key]) as [string, string];
  return { ...(COVERAGE_KINDS[kind] ?? COVERAGE_KINDS.clases), surface };
};

/** Estado del enlace con producción: lo que calcula `npx ds sync`, en una página. */
export function ProductionPage({ system }: { system: System }) {
  const entries = loadEntries(system);
  const report = loadSyncReport(system);
  if (!report) {
    return (
      <div className="ds-prose">
        <p>Aún no hay sync. Ejecuta <code>npx ds sync</code> en el repo del sistema: copia el CSS de producción, lee sus tokens y calcula una huella por ficha.</p>
      </div>
    );
  }
  const synced = entries.filter((e) => report.entradas?.[e.id]?.estado);
  const drift = entries.filter((e) => ['desajuste', 'ausente', 'nuevo'].includes(report.entradas?.[e.id]?.estado));
  const coverage = (report.cobertura ?? {}) as Record<string, Coverage>;
  const surfaces = (system.produccion?.superficies ?? {}) as Record<string, { nombre: string }>;
  // Los totales de fichas, del sistema entero y, con varias superficies, de cada una (sus fichas y las comunes).
  // El selector de la cabecera enseña los del sistema con «Todas» y los de la superficie elegida con una.
  const totals = (list: typeof entries, only?: 'todas' | 'superficie', surface?: string) => {
    const own = list.filter((e) => synced.includes(e));
    const pending = own.filter((e) => drift.includes(e));
    return [
      { value: `${own.length - pending.length}/${own.length}`, label: 'fichas sincronizadas', surface, only },
      { value: String(pending.length), label: 'fichas por revisar', surface, only },
    ];
  };
  const surfaceIds = Object.keys(surfaces);
  const stats = [
    ...(surfaceIds.length > 1
      ? [
          ...totals(entries, 'todas'),
          ...surfaceIds.flatMap((id) => totals(entries.filter((e) => { const own = entrySurfaces(e); return !own.length || own.includes(id); }), 'superficie', id)),
        ]
      : totals(entries)),
    ...Object.entries(coverage).map(([key, c]) => {
      const k = coverageKind(key);
      return { value: `${c.documentadas}/${c.total}`, label: `${k.label} de ${surfaces[k.surface]?.nombre ?? k.surface} ${k.done}`, surface: k.surface, only: undefined };
    }),
  ];

  return (
    <div className="ds-prose">
      <div className="grid gap-3 sm:grid-cols-2">
        {stats.map((s) => (
          <div key={`${s.label}:${s.surface ?? ''}`} data-slot="card" data-superficies={s.surface} data-solo={s.only} className="flex flex-col gap-1 rounded-xl border p-4">
            <span className="text-2xl font-semibold tracking-tight tabular-nums">{s.value}</span>
            <span className="text-sm text-muted-foreground">{s.label}</span>
          </div>
        ))}
      </div>
      <p className="text-sm text-muted-foreground">
        Producción en el commit <code>{report.commit}</code> ({report.fechaCommit}). Último sync: {report.generado.slice(0, 16).replace('T', ' ')} UTC.
        {report.sinCommit?.length > 0 && ` Incluye ${report.sinCommit.length} archivos de producción aún sin commit.`}
      </p>

      {drift.length > 0 && (
        <div data-superficies={surfacesAttr(drift.map(entrySurfaces))}>
          <h2 id="por-revisar">Por revisar</h2>
          <div className="ds-table-scroll">
            <table>
              <thead><tr><th>Ficha</th><th>Estado</th></tr></thead>
              <tbody>
                {drift.map((e) => (
                  <tr key={e.id} data-superficies={surfacesAttr([entrySurfaces(e)])}>
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
        </div>
      )}

      {Object.entries(coverage).filter(([, c]) => c.sinDocumentar.length > 0).map(([key, c]) => {
        const k = coverageKind(key);
        return (
          <div key={key} data-superficies={k.surface}>
            <h2 id={`sin-ficha-${key.replace(':', '-')}`}>{k.label[0].toUpperCase() + k.label.slice(1)} de {surfaces[k.surface]?.nombre ?? k.surface} sin ficha</h2>
            <p className="text-sm text-muted-foreground">{c.sinDocumentar.length} {k.label} de producción que ninguna ficha documenta. Es la lista de tareas pendientes.</p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {c.sinDocumentar.map((name) => <Badge key={name} variant="outline" className="rounded-full font-mono font-normal">{k.item(name)}</Badge>)}
            </div>
          </div>
        );
      })}
    </div>
  );
}
