import Link from 'next/link';
import { SECTION_ICONS, STROKE } from '@/components/icons';
import { StatusBadge, SyncBadge } from '@/components/Status';
import { CodeBlock } from '@/components/CodeBlock';
import { CONTENT_SECTIONS, SECTIONS, STATUSES, loadEntries, loadSyncReport, loadSystem } from '@/lib/core.mjs';
import { sitePath } from '@/lib/site';

export async function generateMetadata({ params }: { params: Promise<{ system: string }> }) {
  const { system } = await params;
  return { title: `Inicio · ${loadSystem(system).nombre}` };
}

type Coverage = { total: number; documentadas: number; sinDocumentar: string[] };

// Claves de la cobertura del informe: «<superficie>» (clases), «tokens:<superficie>» y «componentes:<superficie>».
const COVERAGE_KINDS: Record<string, { label: string; done: string; item: (name: string) => string }> = {
  clases: { label: 'clases', done: 'documentadas', item: (name) => `.${name}` },
  tokens: { label: 'tokens', done: 'documentados', item: (name) => `--${name}` },
  componentes: { label: 'componentes', done: 'documentados', item: (name) => name },
};
const coverageKind = (key: string) => (key.includes(':') ? key.split(':') : ['clases', key]) as [string, string];

// Inicio: página distribuidora dentro del shell. Lleva a cada capa y resume el enlace con producción.
// La portada animada vive en /<sistema>; esta es la que abre el rail.
export default async function SystemHome({ params }: { params: Promise<{ system: string }> }) {
  const { system: id } = await params;
  const system = loadSystem(id);
  const entries = loadEntries(system);
  const report = loadSyncReport(system);
  const synced = entries.filter((e) => report?.entradas?.[e.id]?.estado);
  const drift = entries.filter((e) => ['desajuste', 'ausente'].includes(report?.entradas?.[e.id]?.estado));
  const coverage = (report?.cobertura ?? {}) as Record<string, Coverage>;
  const surfaces = (system.produccion?.superficies ?? {}) as Record<string, { nombre: string }>;
  const latest = [...entries].sort((a, b) => (b.data.creado ?? '').localeCompare(a.data.creado ?? '')).slice(0, 6);
  const sections = SECTIONS.filter((s) => s.id !== 'inicio' && s.id !== 'metodologia');

  return (
    <div className="ds-page">
      <h1 className="ds-title">{system.nombre}</h1>
      <p className="ds-summary">{system.descripcion}</p>

      <div className="ds-content">
        <div className="ds-cards" style={{ marginTop: 24 }}>
          {sections.map((section) => {
            const Icon = SECTION_ICONS[section.id];
            const list = entries.filter((e) => e.section === section.id);
            const counts = Object.keys(STATUSES).map((s) => [s, list.filter((e) => e.estado === s).length] as const).filter(([, n]) => n);
            return (
              <Link key={section.id} href={`/${id}/${section.id}`} className="ds-card">
                <span className="ds-card-head"><Icon size={16} strokeWidth={STROKE} />{section.label}</span>
                <p>{section.descripcion}</p>
                <span className="ds-card-foot">
                  {counts.length ? counts.map(([s, n]) => <span key={s} className="ds-badge" title={STATUSES[s as keyof typeof STATUSES].label}><i className="ds-dot" data-s={s} />{n}</span>) : <span className="ds-badge">Sin fichas</span>}
                </span>
              </Link>
            );
          })}
        </div>

        <h2 className="ds-section-title" id="produccion">Enlace con producción</h2>
        {report ? (
          <>
            <div className="ds-stats">
              <div className="ds-stat"><b>{synced.length - drift.length}/{synced.length}</b><span>fichas sincronizadas</span></div>
              <div className="ds-stat"><b>{drift.length}</b><span>cambiaron en producción</span></div>
              {Object.entries(coverage).map(([key, c]) => {
                const [kind, surface] = coverageKind(key);
                const k = COVERAGE_KINDS[kind] ?? COVERAGE_KINDS.clases;
                return (
                  <div key={key} className="ds-stat">
                    <b>{c.documentadas}/{c.total}</b>
                    <span>{k.label} de {surfaces[surface]?.nombre ?? surface} {k.done}</span>
                  </div>
                );
              })}
            </div>
            <p className="ds-note">
              Producción en el commit <span className="ds-mono">{report.commit}</span> ({report.fechaCommit}). Último sync: {report.generado.slice(0, 16).replace('T', ' ')} UTC.
              {report.sinCommit?.length > 0 && ` Incluye ${report.sinCommit.length} archivos de producción aún sin commit.`}
            </p>
            {drift.length > 0 && (
              <ul className="ds-list" style={{ marginTop: 12 }}>
                {drift.map((e) => (
                  <li key={e.id} className="ds-list-item">
                    <Link href={e.href}><span><strong>{e.titulo}</strong><p>{e.id}</p></span><SyncBadge estado={report.entradas[e.id].estado} /></Link>
                  </li>
                ))}
              </ul>
            )}
            {Object.entries(coverage).map(([key, c]) => {
              if (!c.sinDocumentar.length) return null;
              const [kind, surface] = coverageKind(key);
              const k = COVERAGE_KINDS[kind] ?? COVERAGE_KINDS.clases;
              return (
                <details key={key} style={{ marginTop: 12 }}>
                  <summary className="ds-note" style={{ cursor: 'pointer' }}>{k.label[0].toUpperCase() + k.label.slice(1)} de {surfaces[surface]?.nombre ?? surface} sin ficha ({c.sinDocumentar.length})</summary>
                  <div className="ds-chips" style={{ marginTop: 10 }}>{c.sinDocumentar.map((name) => <span key={name} className="ds-chip">{k.item(name)}</span>)}</div>
                </details>
              );
            })}
          </>
        ) : (
          <p className="ds-note">Aún no hay sync. Ejecuta <span className="ds-inline-code">npx ds sync</span>.</p>
        )}

        <h2 className="ds-section-title">Para agentes</h2>
        <div className="ds-cards">
          <a className="ds-card" href={sitePath(`/${id}/design.md`)}><span className="ds-card-head">design.md</span><p>Reglas, API de clases, tokens y estados en un solo archivo. Es el punto de entrada.</p></a>
          <a className="ds-card" href={sitePath('/llms.txt')}><span className="ds-card-head">llms.txt</span><p>Índice de todas las fichas en Markdown, de todos los sistemas.</p></a>
          <a className="ds-card" href={sitePath(`/${id}/registry.json`)}><span className="ds-card-head">registry.json</span><p>Datos estructurados: estado, plataformas, fuentes y huellas de cada ficha.</p></a>
        </div>
        <p className="ds-note" style={{ marginBottom: 10 }}>Cada página tiene su versión <span className="ds-inline-code">.md</span> en la misma ruta. Prompt base:</p>
        <CodeBlock lang="prompt" code={`Trabaja con el sistema de diseño ${system.nombre}. Lee primero ${sitePath(`/${id}/design.md`)} y ${sitePath('/llms.txt')}. Usa solo lo que esté «En producción» salvo que te pida lo contrario. Si algo no está documentado, no lo inventes: dilo.`} />

        <h2 className="ds-section-title">Añadidos recientemente</h2>
        <ul className="ds-list">
          {latest.map((e) => (
            <li key={e.id} className="ds-list-item">
              <Link href={e.href}>
                <span><strong>{e.titulo}</strong><p>{CONTENT_SECTIONS.find((s) => s.id === e.section)?.label} · {e.data.creado}</p></span>
                <StatusBadge estado={e.estado} />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
