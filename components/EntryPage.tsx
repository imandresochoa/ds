import { ArrowUpRightIcon } from 'lucide-react';
import Link from 'next/link';
import { Fragment } from 'react';
import { loadEntries, loadExperimentalTokens, loadProductionTokens, loadSyncReport, modeLabel, PLATFORM_SECTIONS, PLATFORMS, resolvedTokenValue, SECTIONS, STATUSES, SYNC_STATES, tokenModes, tokenValue } from '@/lib/core.mjs';
import { createSlugger, prepareMarkdown, type TocItem } from '@/lib/markdown';
import type { Entry, Nav, System } from '@/lib/nav';
import { sitePath } from '@/lib/site';
import { previewSurfaces } from '@/lib/surfaces';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
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
 * Ficha con el ritmo de una página de componente de Geist: cabecera corta (título, una línea, insignias discretas),
 * conmutador de plataforma si hay más de una, ejemplos compactos con el código plegado y, al final, lo que añade el
 * sistema (tokens, enlace con producción, usa y relacionados), en formato compacto para que no pese más que los ejemplos.
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
  const byIds = (ids: string[] = []) => ids.map((id) => all.find((e) => e.id === id)).filter(Boolean) as Entry[];
  // `usa`: las piezas que compone (el grafo del registry). `relacionados`: ver también.
  const uses = byIds(entry.data.usa as string[]);
  const related = byIds(entry.data.relacionados as string[]).filter((r) => !uses.includes(r));
  const item = nav.items.find((i) => i.href === entry.href)!;
  const sources = ((sync?.fuentes ?? []) as Source[]).filter((f) => f.superficie !== 'tokens');
  // Un bloque enseña sus ejemplos en el visor ancho (anchos de escritorio, tablet y móvil), no en la tarjeta compacta.
  const block = entry.section === 'bloques' ? { title: entry.titulo, md: `${entry.href}.md` } : undefined;
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
  const usesHeading = uses.length > 0 ? extra('Usa') : null;
  const relatedHeading = related.length > 0 ? extra('Relacionados') : null;
  const pieceLists = [{ heading: usesHeading, list: uses }, { heading: relatedHeading, list: related }].filter((g): g is { heading: TocItem; list: Entry[] } => g.heading !== null);
  const extras = [tokensHeading, productionHeading, usesHeading, relatedHeading].filter((t): t is TocItem => t !== null);
  const toc = [...(platformMd?.toc ?? []), ...(commonMd?.toc ?? []), ...extras];

  const badgeLink = 'inline-flex items-center gap-1 transition-colors hover:text-foreground [&_svg]:size-3';
  const badges = (
    <>
      <StatusBadge item={item} />
      {item.fuente && <a href={item.fuente} target="_blank" rel="noreferrer" className={badgeLink}>Código <ArrowUpRightIcon /></a>}
      {item.iniciativa && <Link href={item.iniciativa.href} className={badgeLink}>Iniciativa: {item.iniciativa.titulo}</Link>}
    </>
  );

  return (
    <DocsArticle nav={nav} href={entry.href} title={entry.titulo} description={entry.resumen} md={`${entry.href}.md`} badges={badges} toc={toc} wide={Boolean(block)}>
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

      {platformMd && <Markdown prepared={platformMd.parts} surfaces={surfaces} block={block} />}

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

      {commonMd && <div className={platformMd ? 'mt-12' : undefined}><Markdown prepared={commonMd.parts} surfaces={surfaces} block={block} /></div>}

      <div className={cn('ds-prose', extras.length > 0 && 'mt-12')}>
        {tokensHeading && (
          <>
            <Heading id={tokensHeading.id}>{tokensHeading.title}</Heading>
            <div className="mt-3 flex flex-wrap gap-1.5">
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
            <ul data-slot="production-sources" className="mt-3 divide-y border-y text-sm">
              {sources.map((f) => (
                <li key={f.clave} className="flex flex-col gap-0.5 py-2.5">
                  <div className="flex items-center gap-2">
                    <StatusDot item={{ estado: 'produccion', sync: f.estado }} className="size-1.5" />
                    <a href={`${system.produccion?.codigo ?? ''}${f.fuente}`} target="_blank" rel="noreferrer" className="min-w-0 truncate font-mono text-[0.8rem] hover:underline">{f.fuente}</a>
                    <span className="ml-auto shrink-0 text-xs text-muted-foreground">
                      {surfaceNames[f.superficie] ?? f.superficie} · {SYNC_STATES[f.estado as keyof typeof SYNC_STATES]?.label ?? f.estado}
                    </span>
                  </div>
                  <div className="pl-3.5 font-mono text-xs leading-relaxed text-muted-foreground">
                    {f.clases.length > 0 && <span className="mr-3">{f.clases.map((c) => `.${c}`).join('  ')}</span>}
                    {f.huella && <span className="mr-3" title="Huella de la fuente en el último sync">huella {f.huella}</span>}
                    {f.commitRevisado && <span title="Commit de producción en el que se revisó la ficha">revisada en {f.commitRevisado}</span>}
                  </div>
                  {f.motivo && <div className="pl-3.5 text-xs text-muted-foreground">{f.motivo}</div>}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-muted-foreground">
              Producción en el commit <code>{report.commit}</code> ({report.fechaCommit}). Sync del {report.generado.slice(0, 10)}.
              {report.sinCommit?.length > 0 && ' La instantánea incluye cambios de producción aún sin commit.'}
            </p>
            {sync.avisos.map((a: string) => <p key={a} className="mt-1 text-xs text-muted-foreground">Aviso: {a}</p>)}
          </>
        )}

        {pieceLists.map(({ heading, list }) => (
          <Fragment key={heading.id}>
            <Heading id={heading.id}>{heading.title}</Heading>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {list.map((r) => (
                <Link key={r.id} href={r.href} data-slot="card" title={r.resumen} className="flex min-w-0 flex-col rounded-lg border px-3 py-2 text-sm transition-colors hover:bg-accent/50">
                  <span className="flex items-center gap-2">
                    <span className="truncate font-medium">{r.titulo}</span>
                    {r.estado !== 'produccion' && <StatusDot item={{ estado: r.estado, sync: null }} className="size-1.5" />}
                    <span className="ml-auto shrink-0 text-xs text-muted-foreground">{SECTIONS.find((x) => x.id === r.section)?.label}</span>
                  </span>
                  <span className="truncate text-[0.8rem] text-muted-foreground">{r.resumen}</span>
                </Link>
              ))}
            </div>
          </Fragment>
        ))}

        <p className="mt-12 text-xs text-muted-foreground">
          <code>{entry.id}</code>
          {entry.data.actualizado && <> · Actualizado el {entry.data.actualizado}</>}
        </p>
      </div>
    </DocsArticle>
  );
}
