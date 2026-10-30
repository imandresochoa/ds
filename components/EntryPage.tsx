import Link from 'next/link';
import { loadEntries, loadProductionTokens, loadSyncReport, modeLabel, PLATFORMS, resolvedTokenValue, SECTIONS, STATUSES, tokenModes, tokenValue } from '@/lib/core.mjs';
import type { Entry, System } from '@/lib/nav';
import { sitePath } from '@/lib/site';
import { previewSurfaces } from '@/lib/surfaces';
import { CodeBlock } from './CodeBlock';
import { Markdown } from './Markdown';
import { StatusBadge, SyncBadge } from './Status';

const isColor = (value: string) => /^(#|rgba?\(|hsla?\(|hwb\(|(ok)?(lab|lch)\(|color\()/i.test(value.trim());
const PLATFORM_SECTIONS = ['componentes', 'patrones'];

type TokenRow = { nombre: string; rol?: string };
type TokenValues = Record<string, string | Record<string, string>>;
type Source = { clave: string; plataforma: string; superficie: string; fuente: string; clases: string[]; estado: string; motivo?: string; huella?: string; commitRevisado?: string | null };

// Se escribe el valor tal cual está en producción; la muestra usa el valor con sus var() resueltas.
function TokenValue({ raw, resolved }: { raw?: string; resolved?: string }) {
  if (raw === undefined) return <span style={{ color: 'var(--ds-text-3)' }}>—</span>;
  const color = resolved ?? raw;
  return (
    <span className="ds-mono" title={resolved !== raw ? resolved : undefined}>
      {isColor(color) && <i className="ds-swatch" style={{ background: color }} />}
      {raw}
    </span>
  );
}

// Una celda por modo, una al lado de otra. Si el token vale lo mismo en todos, una sola celda que los abarca.
function TokenCells({ values, name, modes }: { values: TokenValues; name: string; modes: string[] }) {
  const cells = (modes.length ? modes : [undefined]).map((mode) => ({ raw: tokenValue(values[name], mode), resolved: resolvedTokenValue(values, name, mode) }));
  if (cells.every((c) => c.raw === cells[0].raw && c.resolved === cells[0].resolved)) return <td colSpan={cells.length}><TokenValue {...cells[0]} /></td>;
  return <>{cells.map((c, i) => <td key={modes[i]}><TokenValue {...c} /></td>)}</>;
}

export function EntryPage({ system, entry, platform }: { system: System; entry: Entry; platform: string }) {
  const report = loadSyncReport(system);
  const sync = report?.entradas?.[entry.id];
  const tokens = loadProductionTokens(system) as Record<string, TokenValues>;
  const surfaces = previewSurfaces(system);
  const surfaceNames = Object.fromEntries(Object.entries(system.produccion?.superficies ?? {}).map(([id, s]) => [id, (s as { nombre: string }).nombre]));
  const surfaceIds = Object.keys(tokens);
  // Modos de cada superficie (claro, oscuro…) y los selectores que los activan, según el último sync.
  const modeSelectors = (id: string) => (report?.tokens?.[id]?.modos ?? null) as Record<string, string[]> | null;
  const modes = Object.fromEntries(surfaceIds.map((id) => [id, tokenModes(tokens[id], modeSelectors(id))]));
  const modeColumns = surfaceIds.flatMap((id) => (modes[id].length ? modes[id] : [null]).map((mode) => ({ id, mode })));
  const section = SECTIONS.find((s) => s.id === entry.section);
  const showPlatforms = PLATFORM_SECTIONS.includes(entry.section);
  // Solo se muestran las plataformas que existen; con una sola, no hay pestañas.
  const available = Object.entries(PLATFORMS).filter(([id]) => entry.platforms[id as keyof typeof entry.platforms].estado !== 'sin-iniciar' || id === platform);
  const current = entry.platforms[platform as keyof typeof entry.platforms];
  const all = loadEntries(system);
  const related = ((entry.data.relacionados ?? []) as string[]).map((id) => all.find((e) => e.id === id)).filter(Boolean) as Entry[];
  const tokenRows: TokenRow[] = (entry.data.tokens ?? []).map((t: string | TokenRow) => (typeof t === 'string' ? { nombre: t } : t));
  const startPrompt = `Implementa «${entry.titulo}» para ${PLATFORMS[platform as keyof typeof PLATFORMS]} en el sistema ${system.id}. Lee ${sitePath(entry.href)}.md y docs/metodologia/06-plataformas.md. Crea ${entry.file.replace(/index\.md$|\.md$/, '')}/${platform}.md con estado exploracion y no toques producción.`;

  return (
    <article className="ds-page">
      <header>
        <h1 className="ds-title">{entry.titulo}</h1>
        {entry.resumen && <p className="ds-summary">{entry.resumen}</p>}
      </header>

      {showPlatforms && available.length > 1 && (
        <nav className="ds-pills" aria-label="Plataforma">
          {available.map(([id, label]) => {
            const href = id === 'web' ? entry.href : `${entry.href}/${id}`;
            const info = entry.platforms[id as keyof typeof entry.platforms];
            return (
              <Link key={id} href={href} className={`ds-pill${id === platform ? ' is-active' : ''}`} aria-current={id === platform ? 'page' : undefined} title={STATUSES[info.estado as keyof typeof STATUSES]?.label}>
                <i className="ds-dot" data-s={info.estado} />
                {label}
              </Link>
            );
          })}
        </nav>
      )}

      <div className="ds-content">
        {/* En una ficha de un solo archivo, el cuerpo común es la versión web: solo falta si la web está sin iniciar. */}
        {showPlatforms && (current.body || (platform === 'web' && current.estado !== 'sin-iniciar') ? (
          current.body && <Markdown source={current.body} surfaces={surfaces} />
        ) : (
          <div className="ds-empty">
            <h3>{STATUSES[current.estado as keyof typeof STATUSES]?.label ?? 'Sin iniciar'} en {PLATFORMS[platform as keyof typeof PLATFORMS]}</h3>
            <p>Esta ficha aún no tiene implementación para esta plataforma. Copia el prompt para que un agente prepare la primera versión en exploración.</p>
            <CodeBlock code={startPrompt} lang="prompt" />
          </div>
        ))}

        {entry.section === 'tokens' && tokenRows.length > 0 && (
          <div className="ds-table-wrap">
            <p className="ds-note" style={{ margin: '0 0 8px' }}>
              Valores leídos del código de producción en el último sync. Cómo se usan, en su fundamento.
              {surfaceIds.filter((id) => modes[id].length).map((id) => (
                <span key={id}> {surfaceIds.length > 1 ? `${surfaceNames[id] ?? id}: ` : 'Un valor por modo: '}{modes[id].map((m) => `${modeLabel(m)}${modeSelectors(id)?.[m] ? ` (${modeSelectors(id)?.[m].join(', ')})` : ''}`).join(' · ')}.</span>
              ))}
            </p>
            <table className="ds-table">
              <thead>
                <tr>
                  <th>Token</th>
                  <th>Rol</th>
                  {modeColumns.map(({ id, mode }) => <th key={`${id}:${mode}`}>{mode ? (surfaceIds.length > 1 ? `${surfaceNames[id] ?? id} · ${modeLabel(mode)}` : modeLabel(mode)) : surfaceNames[id] ?? id}</th>)}
                </tr>
              </thead>
              <tbody>
                {tokenRows.map((t) => {
                  // Las variables de @theme que apuntan a otra (--color-x: var(--x)) dicen a cuál.
                  const theme = surfaceIds.map((id) => report?.tokens?.[id]?.theme?.[t.nombre] as string | undefined).find(Boolean);
                  return (
                    <tr key={t.nombre}>
                      <td className="ds-mono">--{t.nombre}{theme?.includes('var(') && <div className="ds-note">@theme: {theme}</div>}</td>
                      <td>{t.rol}</td>
                      {surfaceIds.map((id) => <TokenCells key={id} values={tokens[id] ?? {}} name={t.nombre} modes={modes[id]} />)}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {entry.body.trim() && <Markdown source={entry.body} surfaces={surfaces} />}

        {entry.section !== 'tokens' && tokenRows.length > 0 && (
          <>
            <h2 className="ds-section-title">Tokens que usa</h2>
            <div className="ds-chips">
              {tokenRows.map((t) => {
                const id = surfaceIds.find((s) => tokens[s]?.[t.nombre] !== undefined);
                const list = id ? (modes[id].length ? modes[id] : [undefined]).map((mode) => ({ mode, raw: tokenValue(tokens[id][t.nombre], mode), color: resolvedTokenValue(tokens[id], t.nombre, mode) })) : [];
                const colors = [...new Set(list.map((v) => v.color).filter((c): c is string => !!c && isColor(c)))];
                return (
                  <span key={t.nombre} className="ds-chip" title={list.map((v) => (v.mode ? `${modeLabel(v.mode)}: ${v.raw ?? '—'}` : v.raw)).join(' · ') || undefined}>
                    {colors.map((c) => <i key={c} className="ds-swatch" style={{ background: c }} />)}
                    --{t.nombre}
                  </span>
                );
              })}
            </div>
          </>
        )}

        {sync && (sync.fuentes as Source[]).some((f) => f.superficie !== 'tokens') && (
          <>
            <h2 className="ds-section-title" id="produccion">Enlace con producción</h2>
            <div className="ds-table-wrap">
              <table className="ds-table">
                <thead>
                  <tr><th>Superficie</th><th>Fuente</th><th>Estado</th><th>Huella</th><th>Revisada en</th></tr>
                </thead>
                <tbody>
                  {(sync.fuentes as Source[]).filter((f) => f.superficie !== 'tokens').map((f) => (
                    <tr key={f.clave}>
                      <td>{surfaceNames[f.superficie] ?? f.superficie}</td>
                      <td>
                        {f.superficie === 'tokens' ? <span className="ds-mono">{f.fuente}</span> : <a className="ds-mono" href={`${system.produccion?.codigo ?? ''}${f.fuente}`} target="_blank" rel="noreferrer">{f.fuente}</a>}
                        {f.clases.length > 0 && <div className="ds-note">{f.clases.map((c) => `.${c}`).join('  ')}</div>}
                        {f.motivo && <div className="ds-note">{f.motivo}</div>}
                      </td>
                      <td><SyncBadge estado={f.estado} /></td>
                      <td className="ds-mono">{f.huella ?? '—'}</td>
                      <td className="ds-mono">{f.commitRevisado ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="ds-note">
              Producción en el commit <span className="ds-mono">{report.commit}</span> ({report.fechaCommit}). Sync del {report.generado.slice(0, 10)}.
              {report.sinCommit?.length > 0 && ' La instantánea incluye cambios de producción aún sin commit.'}
            </p>
            {sync.avisos.map((a: string) => <p key={a} className="ds-note">Aviso: {a}</p>)}
          </>
        )}

        {related.length > 0 && (
          <>
            <h2 className="ds-section-title">Relacionados</h2>
            <ul className="ds-list">
              {related.map((r) => (
                <li key={r.id} className="ds-list-item">
                  <Link href={r.href}>
                    <span><strong>{SECTIONS.find((x) => x.id === r.section)?.label} › {r.titulo}</strong><p>{r.resumen}</p></span>
                    <StatusBadge estado={r.estado} />
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}

        <p className="ds-footnote">
          <span className="ds-mono">{entry.id}</span>
          {entry.data.actualizado && <> · Actualizado el {entry.data.actualizado}</>}
        </p>
      </div>
    </article>
  );
}
