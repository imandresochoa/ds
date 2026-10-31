'use client';

import { CheckIcon, TriangleAlertIcon, Undo2Icon, WandSparklesIcon } from 'lucide-react';
import { useMemo, useState } from 'react';
import { SPACING_STEPS, TEXT_STEPS, findPairs, isSafeValue, parseColor } from '@/lib/lab.mjs';
import { modeLabel, resolveVars } from '@/lib/tokens.mjs';
import { cn } from '@/lib/utils';
import { useLang, useT } from '@/components/site/I18nProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ColorInput } from './LabControls';

export type ContrastResult = { modo: string; texto: string; fondo: string; minimo: number; ratio: number | null; ok: boolean | null; sugerencia: { token: string; valor: string } | null };
type Values = Record<string, string>;

const decimal = (n: number, digits = 2) => n.toLocaleString('es', { maximumFractionDigits: digits });

/**
 * Los tokens del Lab como variables con prefijo (--lab-x) para las muestras. Con sus nombres de verdad
 * (--spacing, --text-sm, --radius) cambiarían también las utilidades de Tailwind de la interfaz del kit.
 */
function labVars(values: Values): React.CSSProperties {
  return Object.fromEntries(Object.entries(values).map(([name, value]) => [`--lab-${name}`, value.replace(/var\(\s*--/g, 'var(--lab-')])) as React.CSSProperties;
}

/** Valor de un token con sus var() resueltas contra los demás del mismo modo. */
const resolver = (values: Values) => (name: string) => {
  const raw = values[name];
  return raw === undefined ? undefined : resolveVars(raw, (other: string) => values[other], undefined, new Set([name]));
};

function Ratio({ result }: { result?: ContrastResult }) {
  const t = useT().lab;
  if (!result || result.ratio === null) return <span className="opacity-70">{t.notComputed}</span>;
  return (
    <span className="inline-flex items-center gap-1 tabular-nums" title={t.minimum(decimal(result.minimo, 1))}>
      {result.ok ? <CheckIcon className="size-3" /> : <TriangleAlertIcon className="size-3" />}
      {decimal(result.ratio)}:1
    </span>
  );
}

/** Un par de texto y fondo con su ratio: el fondo es el token, el texto es su -foreground. */
function PairTile({ fg, bg, label, result, border }: { fg?: string; bg?: string; label: string; result?: ContrastResult; border?: string }) {
  return (
    <div className="flex min-h-24 flex-col justify-between gap-2 rounded-lg p-3 text-xs" style={{ background: bg, color: fg, boxShadow: `inset 0 0 0 1px ${border ?? 'transparent'}` }}>
      <span className="text-2xl leading-none font-semibold">Aa</span>
      <span className="flex flex-col gap-0.5">
        <span className="truncate font-mono" title={label}>{label}</span>
        <Ratio result={result} />
      </span>
    </div>
  );
}

/** Pares de un modo, en rejilla. Sirve para «Generar» y para «Ajustar» (con los nombres del sistema). */
export function PairsGrid({ mode, values, results }: { mode: string; values: Values; results: ContrastResult[] }) {
  const t = useT().lab;
  const resolve = resolver(values);
  const pairs = findPairs(Object.keys(values)).filter((p) => p.minimo >= 4.5 && !(p.texto === 'muted-foreground' && p.fondo === 'background'));
  if (!pairs.length) return <p className="text-sm text-muted-foreground">{t.noPairs}</p>;
  const border = resolve('border');
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {pairs.map((p) => (
        <PairTile key={p.texto} label={p.fondo} fg={resolve(p.texto)} bg={resolve(p.fondo)} border={border} result={results.find((r) => r.modo === mode && r.texto === p.texto && r.fondo === p.fondo)} />
      ))}
    </div>
  );
}

function Specimen({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-xs font-medium" style={{ color: 'var(--lab-muted-foreground)' }}>{title}</h3>
      {children}
    </section>
  );
}

const pxOf = (rem?: string) => (rem?.endsWith('rem') ? parseFloat(rem) * 16 : null);

/**
 * Un modo de «Generar» con todas sus muestras: pares, escala neutra, texto, espaciado, radios y sombras.
 * Solo primitivos: el kit no trae componentes.
 */
export function ModePanel({ mode, values, comunes, neutral, results }: { mode: string; values: Values; comunes: Values; neutral: Values; results: ContrastResult[] }) {
  const t = useT().lab;
  const lang = useLang();
  const all = { ...comunes, ...values };
  const find = (texto: string, fondo: string) => results.find((r) => r.modo === mode && r.texto === texto && r.fondo === fondo);
  return (
    <div className="flex flex-col gap-8 rounded-xl border p-5 md:p-6" style={{ ...labVars(all), background: 'var(--lab-background)', color: 'var(--lab-foreground)', fontFamily: 'var(--lab-font-sans)', borderColor: 'var(--lab-border)' }}>
      <div className="flex items-center justify-between text-sm font-medium">
        {modeLabel(mode, lang)}
        <span className="font-mono text-xs font-normal" style={{ color: 'var(--lab-muted-foreground)' }}>{mode === 'light' ? ':root' : '.dark'}</span>
      </div>

      <Specimen title={t.pairs}>
        <PairsGrid mode={mode} values={values} results={results} />
        <div className="flex flex-col gap-1 text-sm">
          <span className="flex justify-between gap-2">{t.mainText} <span className="text-xs"><Ratio result={find('foreground', 'background')} /></span></span>
          <span className="flex justify-between gap-2" style={{ color: 'var(--lab-muted-foreground)' }}>{t.secondaryText} <span className="text-xs"><Ratio result={find('muted-foreground', 'background')} /></span></span>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span className="inline-flex h-9 items-center rounded-md px-3" style={{ outline: '2px solid var(--lab-ring)', outlineOffset: 2, border: '1px solid var(--lab-input)' }}>{t.focus}</span>
          <span className="flex-1">{t.ringOnBackground}</span>
          <Ratio result={find('ring', 'background')} />
        </div>
      </Specimen>

      <Specimen title={t.neutralScale}>
        <div className="grid grid-cols-11 overflow-hidden rounded-md" style={{ boxShadow: 'inset 0 0 0 1px var(--lab-border)' }}>
          {Object.entries(neutral).map(([step, value]) => <span key={step} title={`${step} · ${value}`} className="h-8" style={{ background: value }} />)}
        </div>
      </Specimen>

      <Specimen title={t.text}>
        <div className="flex flex-col gap-2">
          {Object.keys(TEXT_STEPS).reverse().map((step) => (
            <div key={step} className="flex items-baseline gap-3 overflow-hidden">
              <span className="w-24 shrink-0 font-mono text-[11px]" style={{ color: 'var(--lab-muted-foreground)' }}>{step} · {decimal(pxOf(comunes[`text-${step}`]) ?? 0, 1)}px</span>
              <span className="truncate" style={{ fontSize: `var(--lab-text-${step})`, lineHeight: 'var(--lab-leading-tight)' }}>Aa Bb Cc 123</span>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 'var(--lab-text-base)', lineHeight: 'var(--lab-leading-normal)' }}>
          {t.paragraph}
        </p>
        {comunes['font-serif'] && <p style={{ fontFamily: 'var(--lab-font-serif)', fontSize: 'var(--lab-text-xl)', lineHeight: 'var(--lab-leading-tight)' }}>Serif: Aa Bb Cc 123</p>}
        <p style={{ fontFamily: 'var(--lab-font-mono)', fontSize: 'var(--lab-text-sm)' }}>{t.monoSample}</p>
      </Specimen>

      <Specimen title={t.spacing}>
        <div className="flex flex-col gap-1.5">
          {SPACING_STEPS.map((n) => (
            <div key={n} className="flex items-center gap-3">
              <span className="w-24 shrink-0 font-mono text-[11px]" style={{ color: 'var(--lab-muted-foreground)' }}>{n} · {decimal((pxOf(comunes.spacing) ?? 0) * n, 1)}px</span>
              <span className="h-2 rounded-sm" style={{ width: `calc(var(--lab-spacing) * ${n})`, background: 'var(--lab-primary)' }} />
            </div>
          ))}
        </div>
      </Specimen>

      <Specimen title={t.radii}>
        <div className="flex flex-wrap gap-4">
          {['sm', 'md', 'lg', 'xl'].map((r) => (
            <div key={r} className="flex flex-col items-center gap-1.5">
              <span className="size-14" style={{ borderRadius: `var(--lab-radius-${r})`, background: 'var(--lab-muted)', boxShadow: 'inset 0 0 0 1px var(--lab-border)' }} />
              <span className="font-mono text-[11px]" style={{ color: 'var(--lab-muted-foreground)' }}>{r}</span>
            </div>
          ))}
        </div>
      </Specimen>

      {comunes['duration-normal'] && (
        <Specimen title={t.motion}>
          <div className="flex flex-col gap-3">
            {[
              ...['fast', 'normal', 'slow'].map((d) => ({ label: `duration-${d}`, duration: `var(--lab-duration-${d})`, ease: 'var(--lab-ease-out)' })),
              ...['in', 'out', 'in-out'].map((e) => ({ label: `ease-${e}`, duration: 'var(--lab-duration-slow)', ease: `var(--lab-ease-${e})` })),
            ].map((m) => (
              <div key={m.label} className="flex items-center gap-3">
                <span className="w-28 shrink-0 font-mono text-[11px]" style={{ color: 'var(--lab-muted-foreground)' }}>{m.label}</span>
                {/* La pista mide el ancho menos el punto: el punto recorre su propio ancho al 100 %. */}
                <span className="relative h-3 min-w-0 flex-1 rounded-full" style={{ background: 'var(--lab-muted)' }}>
                  <span className="absolute inset-y-0 left-0 right-3">
                    <span className="lab-move block h-full w-full" style={{ animationDuration: m.duration, animationTimingFunction: m.ease }}>
                      <span className="block size-3 rounded-full" style={{ background: 'var(--lab-primary)' }} />
                    </span>
                  </span>
                </span>
              </div>
            ))}
          </div>
        </Specimen>
      )}

      <Specimen title={t.shadows}>
        <div className="flex flex-wrap gap-6 pb-2">
          {['sm', 'md', 'lg'].map((s) => (
            <div key={s} className="flex flex-col items-center gap-2">
              <span className="size-16" style={{ borderRadius: 'var(--lab-radius-lg)', background: 'var(--lab-card)', boxShadow: `var(--lab-shadow-${s})` }} />
              <span className="font-mono text-[11px]" style={{ color: 'var(--lab-muted-foreground)' }}>{s}</span>
            </div>
          ))}
        </div>
      </Specimen>
    </div>
  );
}

/** Resumen del contraste: cuántos pares llegan y, de los que no, el ajuste más cercano que cumple. */
export function ContrastReport({ results, adjusted, onFix }: { results: ContrastResult[]; adjusted?: Record<string, Record<string, string>>; onFix: (mode: string, token: string, value: string) => void }) {
  const t = useT().lab;
  const lang = useLang();
  const measured = results.filter((r) => r.ok !== null);
  const failing = results.filter((r) => r.ok === false);
  // Al ajustar tokens que ya existen, un par que el preset no toca «ya estaba así»: se avisa, pero no bloquea.
  const previous = (r: ContrastResult) => adjusted !== undefined && ![r.texto, r.fondo].some((token) => adjusted[r.modo]?.[token] !== undefined);
  if (!measured.length) return null;
  return (
    <div className={cn('flex flex-col gap-3 rounded-xl border p-4 text-sm', failing.length ? 'border-estado-aviso/50 bg-estado-aviso/5' : 'bg-background')}>
      <p className="flex items-center gap-2 font-medium">
        {failing.length ? <TriangleAlertIcon className="size-4 text-estado-aviso" /> : <CheckIcon className="size-4 text-estado-ok" />}
        {failing.length ? t.summaryFailing(failing.length, measured.length) : t.summaryOk(measured.length)}
      </p>
      {failing.length > 0 && (
        <>
          <ul className="flex flex-col gap-2">
            {failing.map((r) => (
              <li key={`${r.modo}:${r.texto}:${r.fondo}`} className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="font-mono text-xs">{t.on(r.texto, r.fondo)}</span>
                <span className="text-xs text-muted-foreground">{t.contrastLine(modeLabel(r.modo, lang), decimal(r.ratio ?? 0), decimal(r.minimo, 1), previous(r))}</span>
                {r.sugerencia ? (
                  <Button size="sm" variant="outline" className="ml-auto h-7" onClick={() => onFix(r.modo, r.sugerencia!.token, r.sugerencia!.valor)}>
                    <WandSparklesIcon />
                    <span className="inline-flex items-center gap-1.5">{t.adjustToken(r.sugerencia.token)}<span className="size-3 rounded-sm border" style={{ background: r.sugerencia.valor }} /></span>
                  </Button>
                ) : (
                  <span className="ml-auto text-xs text-muted-foreground">{t.noFix}</span>
                )}
              </li>
            ))}
          </ul>
          <p className="text-xs text-muted-foreground">{t.copyAnyway}</p>
        </>
      )}
    </div>
  );
}

/** Tabla de «Ajustar»: los tokens del sistema por modo, editables. Lo cambiado se marca y se puede deshacer. */
export function AdjustTable({ modes, base, current, onChange }: { modes: string[]; base: Record<string, Values>; current: Record<string, Values>; onChange: (mode: string, name: string, value: string | null) => void }) {
  const [filter, setFilter] = useState('');
  const t = useT().lab;
  const lang = useLang();
  const first = modes[0];
  const rows = useMemo(() => {
    const resolve = resolver(base[first] ?? {});
    const names = Object.keys(base[first] ?? {}).filter((n) => n.includes(filter.trim().replace(/^--/, '').toLowerCase()));
    const isColor = (n: string) => parseColor(resolve(n)) !== null;
    return [...names.filter(isColor), ...names.filter((n) => !isColor(n))].map((name) => ({ name, color: isColor(name) }));
  }, [base, first, filter]);
  return (
    <div className="flex flex-col gap-3">
      <Input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder={t.filter} className="max-w-xs bg-background" aria-label={t.filterLabel} />
      <div className="overflow-x-auto rounded-xl border bg-background">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-xs text-muted-foreground">
              <th className="px-4 py-2 font-medium">Token</th>
              {modes.map((m) => <th key={m} className="px-4 py-2 font-medium">{modeLabel(m, lang)}</th>)}
              <th className="w-10" />
            </tr>
          </thead>
          <tbody>
            {rows.map(({ name, color }) => {
              const changed = modes.some((m) => current[m]?.[name] !== base[m]?.[name]);
              return (
                <tr key={name} className="border-b last:border-b-0">
                  <td className="px-4 py-2 align-middle font-mono text-xs whitespace-nowrap">
                    {changed && <span className="mr-1.5 inline-block size-1.5 rounded-full bg-nuevo align-middle" title={t.changed} />}--{name}
                  </td>
                  {modes.map((m) => {
                    const value = current[m]?.[name] ?? '';
                    const commit = (v: string) => onChange(m, name, v === base[m]?.[name] ? null : v);
                    return (
                      <td key={m} className="min-w-56 px-4 py-2">
                        {/* Un var(--x) se edita como texto: el selector de color lo convertiría en un valor fijo. */}
                        {color && parseColor(value) ? (
                          <ColorInput label={`--${name} · ${modeLabel(m, lang)}`} value={value} onChange={commit} />
                        ) : (
                          <Input aria-label={`--${name} · ${modeLabel(m, lang)}`} defaultValue={value} key={value} spellCheck={false} className="font-mono text-xs" onBlur={(e) => isSafeValue(e.target.value) && e.target.value !== value && commit(e.target.value)} />
                        )}
                      </td>
                    );
                  })}
                  <td className="pr-2">
                    {changed && (
                      <Button size="icon" variant="ghost" className="size-7" aria-label={t.undo(name)} onClick={() => modes.forEach((m) => onChange(m, name, null))}>
                        <Undo2Icon />
                      </Button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!rows.length && <p className="p-4 text-sm text-muted-foreground">{t.noMatch}</p>}
      </div>
    </div>
  );
}
