import { loadExperimentalTokens, loadProductionTokens, loadSyncReport, modeLabel, resolvedTokenValue, tokenModes, tokenValue } from '@/lib/core.mjs';
import type { System } from '@/lib/nav';
import { cn } from '@/lib/utils';

export const isColor = (value: string) => /^(#|rgba?\(|hsla?\(|hwb\(|(ok)?(lab|lch)\(|color\()/i.test(value.trim());

export type TokenRow = { nombre: string; rol?: string | null };
export type TokenValues = Record<string, string | Record<string, string>>;
/** Columna de los tokens de experimental/ en la tabla de tokens de un fundamento. */
const EXPERIMENTAL = 'experimental';

/**
 * Los valores con los que se pintan unos tokens: los de producción por superficie y, si alguno de `names` está en
 * experimental/ (también lo que escribe el Lab), una columna más con esos. Cada superficie, con sus modos.
 */
export function loadTokenColumns(system: System, names: string[]) {
  const report = loadSyncReport(system);
  const experimental = loadExperimentalTokens(system);
  const withExperimental = experimental !== null && names.some((n) => experimental.values[n] !== undefined);
  const production = loadProductionTokens(system) as Record<string, TokenValues>;
  const tokens: Record<string, TokenValues> = withExperimental ? { ...production, [EXPERIMENTAL]: experimental.values as TokenValues } : production;
  const surfaceIds = Object.keys(tokens);
  const surfaceNames: Record<string, string> = { ...Object.fromEntries(Object.entries(system.produccion?.superficies ?? {}).map(([id, s]) => [id, (s as { nombre: string }).nombre])), [EXPERIMENTAL]: 'Experimental' };
  // Modos de cada superficie (claro, oscuro…) y los selectores que los activan, según el último sync.
  const modeSelectors = (id: string) => (id === EXPERIMENTAL ? experimental?.info.modos ?? null : report?.tokens?.[id]?.modos ?? null) as Record<string, string[]> | null;
  const modes = Object.fromEntries(surfaceIds.map((id) => [id, tokenModes(tokens[id], modeSelectors(id))]));
  // Las variables de @theme que apuntan a otra (--color-x: var(--x)) dicen a cuál.
  const theme = (name: string) => surfaceIds.map((id) => report?.tokens?.[id]?.theme?.[name] as string | undefined).find(Boolean);
  return { tokens, surfaceIds, surfaceNames, modes, modeSelectors, withExperimental, theme };
}

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

/**
 * La tabla de los tokens que documenta un fundamento: nombre, rol y un valor por superficie y por modo. Los valores
 * salen del último sync y de experimental/; nunca se escriben a mano en la ficha.
 */
export function TokenTable({ system, rows, className }: { system: System; rows: TokenRow[]; className?: string }) {
  const { tokens, surfaceIds, surfaceNames, modes, modeSelectors, withExperimental, theme } = loadTokenColumns(system, rows.map((t) => t.nombre));
  const modeColumns = surfaceIds.flatMap((id) => (modes[id].length ? modes[id] : [null]).map((mode) => ({ id, mode })));
  const source = !surfaceIds.length
    ? 'Aún no hay valores: ejecuta npx ds sync o escribe los tokens en experimental/.'
    : !withExperimental
      ? 'Valores leídos del código de producción en el último sync.'
      : surfaceIds.length > 1
        ? 'Valores leídos del código de producción en el último sync. La columna Experimental sale de experimental/: todavía no está en producción.'
        : 'Valores de experimental/: todavía no están en producción.';
  return (
    <div className={cn('ds-prose', className)}>
      <p className="text-sm text-muted-foreground">
        {source}
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
            {rows.map((t) => {
              const bridge = theme(t.nombre);
              return (
                <tr key={t.nombre}>
                  <td className="whitespace-nowrap"><code>--{t.nombre}</code>{bridge?.includes('var(') && <div className="mt-1 text-xs text-muted-foreground">@theme: {bridge}</div>}</td>
                  <td>{t.rol}</td>
                  {surfaceIds.map((id) => <TokenCells key={id} values={tokens[id] ?? {}} name={t.nombre} modes={modes[id]} />)}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
