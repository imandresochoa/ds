'use client';

import { InfoIcon, LinkIcon, RotateCcwIcon, SparklesIcon } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { DEFAULT_PRESET, MODOS, baseByMode, checkContrast, decodePreset, deriveTokens, encodePreset, presetCss, type Preset } from '@/lib/lab.mjs';
import { modeLabel } from '@/lib/tokens.mjs';
import { useCopy } from '@/lib/use-copy';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { GenerateControls } from './LabControls';
import { AdjustTable, ContrastReport, ModePanel, PairsGrid, type ContrastResult } from './LabPreview';

/** Tokens que el sistema ya tiene (de una superficie de producción o de experimental/), para «Ajustar». */
export type LabBase = { id: string; nombre: string; valores: Record<string, string | Record<string, string>>; modos: string[]; selectores: Record<string, string[]> | null };
type Tab = 'generar' | 'ajustar';

const fresh = (): Preset => structuredClone(DEFAULT_PRESET as Preset);

/** Cambia (o quita, con null) un ajuste a mano de un modo. */
function withAdjustment(preset: Preset, mode: string, name: string, value: string | null): Preset {
  const values = { ...preset.ajustes[mode] };
  if (value === null) delete values[name];
  else values[name] = value;
  const ajustes = { ...preset.ajustes, [mode]: values };
  if (!Object.keys(values).length) delete ajustes[mode];
  return { ...preset, ajustes };
}

/**
 * Lab de primitivos. «Generar» crea los tokens con los nombres de shadcn a partir de unos pocos primitivos;
 * «Ajustar» cambia los que el sistema ya tiene. No escribe nada: el estado vive en la URL (?preset=) y el agente
 * lo aplica con `npx ds preset aplicar`.
 */
export function Lab({ systemId, bases, saved, production }: { systemId: string; bases: LabBase[]; saved: string | null; production: boolean }) {
  const { copy } = useCopy();
  const [tab, setTab] = useState<Tab>(() => (bases.length && !saved ? 'ajustar' : 'generar'));
  const [gen, setGen] = useState<Preset>(() => {
    if (!saved) return fresh();
    try {
      const { preset } = decodePreset(saved);
      return preset.modo === 'generar' ? preset : fresh();
    } catch {
      return fresh();
    }
  });
  const [adj, setAdj] = useState<Preset>(() => ({ ...fresh(), modo: 'ajustar', base: bases[0]?.id ?? null }));

  // Un enlace con ?preset= abre el Lab con ese estado.
  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get('preset');
    if (!code) return;
    try {
      const { preset, avisos } = decodePreset(code);
      if (preset.modo === 'ajustar') {
        if (!bases.length) return void toast.error('El enlace ajusta tokens, pero este sistema aún no tiene ninguno.');
        setAdj({ ...preset, base: bases.some((b) => b.id === preset.base) ? preset.base : bases[0].id });
        setTab('ajustar');
      } else {
        setGen(preset);
        setTab('generar');
      }
      if (avisos.length) toast.warning(`Se han descartado valores del enlace: ${avisos.join('; ')}.`);
    } catch {
      toast.error('El preset del enlace no se puede leer.');
    }
  }, [bases]);

  const current = tab === 'generar' ? gen : adj;
  const code = useMemo(() => encodePreset(current), [current]);
  // La URL sigue al estado, para copiarla o recargar sin perder nada. Mientras no se toque nada, se queda limpia.
  const firstCode = useRef<string | null>(null);
  useEffect(() => {
    if (firstCode.current === null) firstCode.current = code;
    if (code === firstCode.current && !window.location.search) return;
    window.history.replaceState(null, '', `${window.location.pathname}?preset=${code}`);
  }, [code]);

  const derived = useMemo(() => deriveTokens(gen), [gen]);
  const base = bases.find((b) => b.id === adj.base) ?? bases[0];
  const baseModes = base ? (base.modos.length ? base.modos : ['base']) : [];
  const original = useMemo(() => (base ? baseByMode(base.valores, base.modos) : {}), [base]);
  const adjusted = useMemo(() => (base ? baseByMode(base.valores, base.modos, adj.ajustes) : {}), [base, adj.ajustes]);
  const results = useMemo(() => checkContrast(tab === 'generar' ? derived.modos : adjusted) as ContrastResult[], [tab, derived, adjusted]);
  const css = useMemo(() => (tab === 'ajustar' ? presetCss(current, { selectores: base?.selectores ?? null, originales: original }) : presetCss(current)), [current, tab, base, original]);

  const adjust = useCallback((mode: string, name: string, value: string | null) => (tab === 'generar' ? setGen : setAdj)((p) => withAdjustment(p, mode, name, value)), [tab]);
  const link = () => `${window.location.origin}${window.location.pathname}?preset=${code}`;
  const prompt = () =>
    `Aplica este preset del Lab al sistema ${systemId}${production ? ' dentro de una iniciativa, sin tocar producción' : ''}: npx ds preset aplicar "${link()}". ` +
    'Sigue la skill montar-sistema, apartado «Aplicar un preset del Lab». Si avisa de pares por debajo de AA, pregúntame antes de aceptarlos.';

  return (
    <>
      <div className="container-wrapper">
        <div className="container flex flex-wrap items-center justify-between gap-3 py-4">
          <ToggleGroup type="single" variant="outline" size="sm" value={tab} onValueChange={(v) => v && setTab(v as Tab)}>
            <ToggleGroupItem value="generar" className="px-3">Generar</ToggleGroupItem>
            <ToggleGroupItem value="ajustar" className="px-3" disabled={!bases.length} title={bases.length ? undefined : 'El sistema aún no tiene tokens'}>Ajustar tokens</ToggleGroupItem>
          </ToggleGroup>
          <div className="flex flex-wrap items-center gap-2 **:data-[slot=button]:shadow-none">
            <Button size="sm" variant="ghost" onClick={() => (tab === 'generar' ? setGen(fresh()) : setAdj((p) => ({ ...p, ajustes: {} })))}>
              <RotateCcwIcon />
              Restablecer
            </Button>
            <Button size="sm" variant="outline" onClick={() => copy(link(), 'Enlace copiado')}>
              <LinkIcon />
              Copiar enlace
            </Button>
            <Button size="sm" onClick={() => copy(prompt(), 'Prompt copiado. Pégalo en tu agente.')}>
              <SparklesIcon />
              Copiar para tu agente
            </Button>
          </div>
        </div>
      </div>

      <div className="container-wrapper section-soft flex-1 pb-12 md:py-12">
        <div className="container flex flex-col gap-6">
          <p className="flex gap-2 text-sm text-muted-foreground">
            <InfoIcon className="mt-0.5 size-4 shrink-0" />
            {production
              ? 'Este sistema ya tiene producción. Lo que cambies aquí no la toca: el agente lo deja en una iniciativa, con el CSS en experimental/.'
              : 'El Lab no escribe nada. Copia el preset para tu agente: lo aplica en experimental/ y crea las fichas de tokens en exploración.'}
          </p>
          <ContrastReport results={results} adjusted={tab === 'ajustar' ? adj.ajustes : undefined} onFix={(mode, token, value) => adjust(mode, token, value)} />

          {tab === 'generar' && (
            <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[18rem_minmax(0,1fr)]">
              <aside className="rounded-xl border bg-background p-5 lg:sticky lg:top-[calc(var(--header-height)+1.5rem)] lg:max-h-[calc(100svh-var(--header-height)-3rem)] lg:overflow-y-auto">
                <GenerateControls preset={gen} onChange={setGen} onRemoveAdjustment={(mode, name) => adjust(mode, name, null)} />
              </aside>
              <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                {MODOS.map((mode) => <ModePanel key={mode} mode={mode} values={derived.modos[mode]} comunes={derived.comunes} neutral={derived.neutral} results={results} />)}
              </div>
            </div>
          )}

          {tab === 'ajustar' && base && (
            <div className="flex flex-col gap-6">
              {bases.length > 1 && (
                <ToggleGroup type="single" variant="outline" size="sm" value={base.id} onValueChange={(v) => v && setAdj((p) => ({ ...p, base: v, ajustes: {} }))} className="w-fit">
                  {bases.map((b) => <ToggleGroupItem key={b.id} value={b.id} className="px-3">{b.nombre}</ToggleGroupItem>)}
                </ToggleGroup>
              )}
              <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                {baseModes.map((mode) => (
                  <div key={mode} className="flex flex-col gap-3 rounded-xl border bg-background p-5">
                    <h3 className="text-sm font-medium">{modeLabel(mode)}</h3>
                    <PairsGrid mode={mode} values={adjusted[mode] ?? {}} results={results} />
                  </div>
                ))}
              </div>
              <AdjustTable modes={baseModes} base={original} current={adjusted} onChange={adjust} />
            </div>
          )}

          <details className="rounded-xl border bg-background">
            <summary className="cursor-pointer px-4 py-3 text-sm font-medium">
              {tab === 'ajustar' && base?.id === 'experimental' ? 'Cambios que npx ds preset aplicar hará en el CSS de experimental/, en la hoja que declara cada token' : 'CSS que escribirá npx ds preset aplicar en experimental/tokens.css'}
            </summary>
            <pre className="overflow-x-auto border-t p-4 font-mono text-xs leading-relaxed">{css}</pre>
          </details>
        </div>
      </div>
    </>
  );
}
