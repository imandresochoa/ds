import { ArrowUpRightIcon } from 'lucide-react';
import Link from 'next/link';
import { loadEntries, loadExperimentalTokens, loadProductionTokens, loadSyncReport, modeLabel, PLATFORM_SECTIONS, PLATFORMS, resolvedTokenValue, SECTIONS, STATUSES, SYNC_STATES, tokenModes, tokenValue } from '@/lib/core.mjs';
import { createSlugger, prepareMarkdown, type TocItem } from '@/lib/markdown';
import type { Entry, Nav, System } from '@/lib/nav';
import { sitePath } from '@/lib/site';
import { previewSurfaces } from '@/lib/surfaces';
import { Badge } from '@/components/ui/badge';
import { CodeBlock } from './CodeBlock';
import { DocsArticle } from './docs/DocsArticle';
import { StatusBadge, StatusDot } from './docs/StatusBadge';
import { Markdown } from './Markdown';

const isColor = (value: string) => /^(#|rgba?\(|hsla?\(|hwb\(|(ok)?(lab|lch)\(|color\()/i.test(value.trim());

type TokenRow = { nombre: string; rol?: string };
/** Columna de los tokens de experimental/ en la tabla de una ficha de tokens. */
const EXPERIMENTAL = 'experimental';
type TokenValues = Record<string, string | Record<string, string>>;
type Source = { clave: string; plataforma: string; superficie: string; fuente: string; clases: string[]; estado: string; motivo?: string; huella?: string; commitRevisado?: string | null };

// Se escribe el valor tal cual está en producción; la muestra usa el valor con sus var() resueltas.
function TokenValue({ raw, resolved }: { raw?: string; resolved?: string }) {
  if (raw === undefined) return <span className="text-muted-foreground">—</span>;
  const color = resolved ?? raw;
  return (
    <span className="inline-flex items-center gap-2 font-mono text-[0.8rem]" title={resolved !== raw ? resolved : undefined}>
      {isColor(color) && <span className="size-3.5 shrink-0 rounded-sm border" style={{ background: color }} />}
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

/** Título de un apartado generado (no viene del Markdown): lleva id y entra en «En esta página». */
function Heading({ id, children }: { id: string; children: React.ReactNode }) {
  return <h2 id={id}>{children}</h2>;
}

/**
 * Ficha con la anatomía de una página de componente de shadcn: cabecera, insignias, conmutador de plataforma,
 * ejemplos en vivo con su código y, después, lo que el sistema añade (tokens, enlace con producción, relacionados).
 */
export function EntryPage({ system, entry, platform, nav }: { system: System; entry: Entry; platform: string; nav: Nav }) {
  const report = loadSyncReport(system);
  const sync = report?.entradas?.[entry.id];
  const tokenRows: TokenRow[] = (entry.data.tokens ?? []).map((t: string | TokenRow) => (typeof t === 'string' ? { nombre: t } : t));
  // Lo que aún no está en producción (experimental/, también lo que escribe el Lab) va en su propia columna.
  const experimental = loadExperimentalTokens(system);
  const withExperimental = experimental !== null && tokenRows.some((t) => experimental.values[t.nombre] !== undefined);
  const production = loadProductionTokens(system) as Record<string, TokenValues>;
  const tokens: Record<string, TokenValues> = withExperimental ? { ...production, [EXPERIMENTAL]: experimental.values as TokenValues } : production;
  const surfaces = previewSurfaces(system);
  const surfaceNames: Record<string, string> = { ...Object.fromEntries(Object.entries(system.produccion?.superficies ?? {}).map(([id, s]) => [id, (s as { nombre: string }).nombre])), [EXPERIMENTAL]: 'Experimental' };
  const surfaceIds = Object.keys(tokens);
  // Modos de cada superficie (claro, oscuro…) y los selectores que los activan, según el último sync.
  const modeSelectors = (id: string) => (id === EXPERIMENTAL ? experimental?.info.modos ?? null : report?.tokens?.[id]?.modos ?? null) as Record<string, string[]> | null;
  const modes = Object.fromEntries(surfaceIds.map((id) => [id, tokenModes(tokens[id], modeSelectors(id))]));
  const modeColumns = surfaceIds.flatMap((id) => (modes[id].length ? modes[id] : [null]).map((mode) => ({ id, mode })));
  const showPlatforms = PLATFORM_SECTIONS.includes(entry.section);
  // Solo se muestran las plataformas que existen; con una sola, no hay conmutador.
  const available = Object.entries(PLATFORMS).filter(([id]) => entry.platforms[id as keyof typeof entry.platforms].estado !== 'sin-iniciar' || id === platform);
  const current = entry.platforms[platform as keyof typeof entry.platforms];
  const all = loadEntries(system);
  const related = ((entry.data.relacionados ?? []) as string[]).map((id) => all.find((e) => e.id === id)).filter(Boolean) as Entry[];
  const item = nav.items.find((i) => i.href === entry.href)!;
  const sources = ((sync?.fuentes ?? []) as Source[]).filter((f) => f.superficie !== 'tokens');
  const startPrompt = `Implementa «${entry.titulo}» para ${PLATFORMS[platform as keyof typeof PLATFORMS]} en el sistema ${system.id}. Lee ${sitePath(entry.href)}.md y docs/metodologia/06-plataformas.md. Crea ${entry.file.replace(/index\.md$|\.md$/, '')}/${platform}.md con estado exploracion y no toques producción.`;

  // Un solo generador de ids para toda la página: los títulos repetidos («Reglas» en web.md y en index.md) no chocan.
  const slug = createSlugger();
  // En una ficha de un solo archivo, el cuerpo común es la versión web: solo falta si la web está sin iniciar.
  const hasPlatformBody = Boolean(current.body) || (platform === 'web' && current.estado !== 'sin-iniciar');
  const platformMd = showPlatforms && current.body ? prepareMarkdown(current.body, slug) : null;
  const commonMd = entry.body.trim() ? prepareMarkdown(entry.body, slug) : null;
  const extra = (title: string): TocItem => ({ id: slug(title), title, depth: 2 });
  const tokensHeading = entry.section !== 'tokens' && tokenRows.length > 0 ? extra('Tokens que usa') : null;
  const productionHeading = sources.length > 0 ? extra('Enlace con producción') : null;
  const relatedHeading = related.length > 0 ? extra('Relacionados') : null;
  const toc = [...(platformMd?.toc ?? []), ...(commonMd?.toc ?? []), ...[tokensHeading, productionHeading, relatedHeading].filter((t): t is TocItem => t !== null)];

  const badges = (
    <>
      <StatusBadge item={item} />
      {item.fuente && (
        <Badge asChild variant="secondary" className="rounded-full">
          <a href={item.fuente} target="_blank" rel="noreferrer">Código <ArrowUpRightIcon /></a>
        </Badge>
      )}
      {item.iniciativa && (
        <Badge asChild variant="secondary" className="rounded-full">
          <Link href={item.iniciativa.href}>Iniciativa: {item.iniciativa.titulo}</Link>
        </Badge>
      )}
    </>
  );

  return (
    <DocsArticle nav={nav} href={entry.href} title={entry.titulo} description={entry.resumen} md={`${entry.href}.md`} badges={badges} toc={toc}>
      {showPlatforms && available.length > 1 && (
        <nav aria-label="Plataforma" className="mb-4 inline-flex w-full items-center gap-6">
          {available.map(([id, label]) => {
            const href = id === 'web' ? entry.href : `${entry.href}/${id}`;
            const info = entry.platforms[id as keyof typeof entry.platforms];
            return (
              <Link
                key={id}
                href={href}
                data-active={id === platform}
                aria-current={id === platform ? 'page' : undefined}
                title={STATUSES[info.estado as keyof typeof STATUSES]?.label}
                className="relative inline-flex items-center justify-center gap-1.5 pt-1 pb-0.5 text-base font-medium text-muted-foreground transition-colors after:absolute after:inset-x-0 after:bottom-[-4px] after:h-0.5 after:bg-foreground after:opacity-0 after:transition-opacity hover:text-foreground data-[active=true]:text-foreground data-[active=true]:after:opacity-100"
              >
                <StatusDot item={{ estado: info.estado, sync: null }} className="size-1.5" />
                {label}
              </Link>
            );
          })}
        </nav>
      )}

      {showPlatforms && !hasPlatformBody && (
        <div className="mb-8 rounded-xl border p-6">
          <h3 className="font-semibold">{STATUSES[current.estado as keyof typeof STATUSES]?.label ?? 'Sin iniciar'} en {PLATFORMS[platform as keyof typeof PLATFORMS]}</h3>
          <p className="mt-1 text-sm text-muted-foreground">Esta ficha aún no tiene implementación para esta plataforma. Copia el prompt para que un agente prepare la primera versión en exploración.</p>
          <CodeBlock code={startPrompt} lang="prompt" className="mx-0 mt-4" />
        </div>
      )}

      {platformMd && <Markdown prepared={platformMd.parts} surfaces={surfaces} />}

      {entry.section === 'tokens' && tokenRows.length > 0 && (
        <div className="ds-prose">
          <p className="text-sm text-muted-foreground">
            {!withExperimental ? 'Valores leídos del código de producción en el último sync.' : surfaceIds.length > 1 ? 'Valores leídos del código de producción en el último sync. La columna Experimental sale de experimental/: todavía no está en producción.' : 'Valores de experimental/: todavía no están en producción.'} Cómo se usan, en su fundamento.
            {surfaceIds.filter((id) => modes[id].length).map((id) => (
              <span key={id}> {surfaceIds.length > 1 ? `${surfaceNames[id] ?? id}: ` : 'Un valor por modo: '}{modes[id].map((m) => `${modeLabel(m)}${modeSelectors(id)?.[m] ? ` (${modeSelectors(id)?.[m].join(', ')})` : ''}`).join(' · ')}.</span>
            ))}
          </p>
          <div className="ds-table-scroll">
            <table>
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
                      <td><code>--{t.nombre}</code>{theme?.includes('var(') && <div className="mt-1 text-xs text-muted-foreground">@theme: {theme}</div>}</td>
                      <td>{t.rol}</td>
                      {surfaceIds.map((id) => <TokenCells key={id} values={tokens[id] ?? {}} name={t.nombre} modes={modes[id]} />)}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {commonMd && <div className={platformMd ? 'mt-12' : undefined}><Markdown prepared={commonMd.parts} surfaces={surfaces} /></div>}

      <div className="ds-prose">
        {tokensHeading && (
          <>
            <Heading id={tokensHeading.id}>{tokensHeading.title}</Heading>
            <div className="mt-4 flex flex-wrap gap-2">
              {tokenRows.map((t) => {
                const id = surfaceIds.find((s) => tokens[s]?.[t.nombre] !== undefined);
                const list = id ? (modes[id].length ? modes[id] : [undefined]).map((mode) => ({ mode, raw: tokenValue(tokens[id][t.nombre], mode), color: resolvedTokenValue(tokens[id], t.nombre, mode) })) : [];
                const colors = [...new Set(list.map((v) => v.color).filter((c): c is string => !!c && isColor(c)))];
                return (
                  <Badge key={t.nombre} variant="outline" className="gap-1.5 rounded-full font-mono font-normal" title={list.map((v) => (v.mode ? `${modeLabel(v.mode)}: ${v.raw ?? '—'}` : v.raw)).join(' · ') || undefined}>
                    {colors.map((c) => <span key={c} className="size-2.5 rounded-full border" style={{ background: c }} />)}
                    --{t.nombre}
                  </Badge>
                );
              })}
            </div>
          </>
        )}

        {productionHeading && report && (
          <>
            <Heading id={productionHeading.id}>{productionHeading.title}</Heading>
            <div className="ds-table-scroll">
              <table>
                <thead>
                  <tr><th>Superficie</th><th>Fuente</th><th>Estado</th><th>Huella</th><th>Revisada en</th></tr>
                </thead>
                <tbody>
                  {sources.map((f) => (
                    <tr key={f.clave}>
                      <td>{surfaceNames[f.superficie] ?? f.superficie}</td>
                      <td>
                        <a href={`${system.produccion?.codigo ?? ''}${f.fuente}`} target="_blank" rel="noreferrer" className="font-mono text-[0.8rem]">{f.fuente}</a>
                        {f.clases.length > 0 && <div className="mt-1 font-mono text-xs text-muted-foreground">{f.clases.map((c) => `.${c}`).join('  ')}</div>}
                        {f.motivo && <div className="mt-1 text-xs text-muted-foreground">{f.motivo}</div>}
                      </td>
                      <td>
                        <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                          <StatusDot item={{ estado: 'produccion', sync: f.estado }} className="size-1.5" />
                          {SYNC_STATES[f.estado as keyof typeof SYNC_STATES]?.label ?? f.estado}
                        </span>
                      </td>
                      <td className="font-mono text-[0.8rem]">{f.huella ?? '—'}</td>
                      <td className="font-mono text-[0.8rem]">{f.commitRevisado ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-sm text-muted-foreground">
              Producción en el commit <code>{report.commit}</code> ({report.fechaCommit}). Sync del {report.generado.slice(0, 10)}.
              {report.sinCommit?.length > 0 && ' La instantánea incluye cambios de producción aún sin commit.'}
            </p>
            {sync.avisos.map((a: string) => <p key={a} className="text-sm text-muted-foreground">Aviso: {a}</p>)}
          </>
        )}

        {relatedHeading && (
          <>
            <Heading id={relatedHeading.id}>{relatedHeading.title}</Heading>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {related.map((r) => (
                <Link key={r.id} href={r.href} data-slot="card" className="flex flex-col gap-1 rounded-xl border p-4 text-sm transition-colors hover:bg-accent/50">
                  <span className="text-xs text-muted-foreground">{SECTIONS.find((x) => x.id === r.section)?.label}</span>
                  <span className="flex items-center gap-2 font-medium">
                    {r.titulo}
                    {r.estado !== 'produccion' && <StatusDot item={{ estado: r.estado, sync: null }} className="size-1.5" />}
                  </span>
                  <span className="line-clamp-2 text-muted-foreground">{r.resumen}</span>
                </Link>
              ))}
            </div>
          </>
        )}

        <p className="mt-16 text-xs text-muted-foreground">
          <code>{entry.id}</code>
          {entry.data.actualizado && <> · Actualizado el {entry.data.actualizado}</>}
        </p>
      </div>
    </DocsArticle>
  );
}
