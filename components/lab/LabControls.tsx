'use client';

import { XIcon } from 'lucide-react';
import { useEffect, useId, useState } from 'react';
import { CURVAS, DEFAULT_PRESET, ESCALAS, isSafeValue, parseColor, toHex, type Ajustes, type Preset } from '@/lib/lab.mjs';
import { modeLabel } from '@/lib/tokens.mjs';
import { useLang, useT } from '@/components/site/I18nProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

const FONT = /^[\p{L}\p{N}\s"',._-]*$/u;
const decimal = (n: number, digits = 2) => n.toLocaleString('es', { maximumFractionDigits: digits });

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4 border-b pb-6 last:border-b-0 last:pb-0">
      <h2 className="text-sm font-semibold">{title}</h2>
      {children}
    </section>
  );
}

/** Campo de texto que solo pasa el valor cuando es válido; mientras no lo es, lo marca y conserva lo escrito. */
function DraftInput({ value, valid, onCommit, className, ...props }: { value: string; valid: (v: string) => boolean; onCommit: (v: string) => void } & Omit<React.ComponentProps<'input'>, 'value' | 'onChange'>) {
  const [draft, setDraft] = useState(value);
  useEffect(() => setDraft(value), [value]);
  const ok = valid(draft);
  return (
    <Input
      {...props}
      className={className}
      value={draft}
      aria-invalid={!ok || undefined}
      spellCheck={false}
      onChange={(e) => {
        setDraft(e.target.value);
        if (valid(e.target.value)) onCommit(e.target.value);
      }}
      onBlur={() => !ok && setDraft(value)}
    />
  );
}

/** Color con el selector del navegador y el valor escrito (hex, rgb(), hsl() u oklch()). */
export function ColorInput({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) {
  const hex = toHex(value) ?? '#000000';
  const t = useT();
  return (
    <div className="flex items-center gap-2">
      <input
        type="color"
        aria-label={`${label}: ${t.lab.selector}`}
        value={hex}
        onChange={(e) => onChange(e.target.value)}
        className="size-9 shrink-0 cursor-pointer rounded-md border bg-transparent p-1 [&::-moz-color-swatch]:rounded-sm [&::-moz-color-swatch]:border-0 [&::-webkit-color-swatch]:rounded-sm [&::-webkit-color-swatch]:border-0 [&::-webkit-color-swatch-wrapper]:p-0"
      />
      <DraftInput aria-label={label} value={value} valid={(v) => isSafeValue(v) && parseColor(v) !== null} onCommit={onChange} className="font-mono text-xs" />
    </div>
  );
}

function ColorField({ label, hint, value, onChange }: { label: string; hint: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-col gap-2">
      <Label>{label}</Label>
      <ColorInput label={label} value={value} onChange={onChange} />
      <p className="text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}

function FontField({ label, value, placeholder, onChange }: { label: string; value: string; placeholder?: string; onChange: (v: string) => void }) {
  const id = useId();
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      <DraftInput id={id} value={value} placeholder={placeholder} valid={(v) => FONT.test(v) && v.length <= 200} onCommit={(v) => onChange(v.trim())} className="text-xs" />
    </div>
  );
}

function SliderField({ label, value, min, max, step, format, onChange }: { label: string; value: number; min: number; max: number; step: number; format: (n: number) => string; onChange: (n: number) => void }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <span className="font-mono text-xs text-muted-foreground tabular-nums">{format(value)}</span>
      </div>
      <Slider aria-label={label} value={[value]} min={min} max={max} step={step} onValueChange={([n]) => onChange(n)} />
    </div>
  );
}

/** Controles de «Generar»: los primitivos de los que salen todos los tokens. */
export function GenerateControls({ preset, onChange, onRemoveAdjustment }: { preset: Preset; onChange: (next: Preset) => void; onRemoveAdjustment: (mode: string, name: string) => void }) {
  const set = <K extends keyof Preset>(key: K, value: Preset[K]) => onChange({ ...preset, [key]: value });
  const { color, texto, sombra } = preset;
  // Un preset anterior al movimiento no lo trae: los controles parten de los valores por defecto.
  const movimiento = preset.movimiento ?? DEFAULT_PRESET.movimiento!;
  const t = useT().lab;
  const lang = useLang();
  const adjustments = Object.entries(preset.ajustes as Ajustes).flatMap(([mode, values]) => Object.entries(values).map(([name, value]) => ({ mode, name, value })));
  return (
    <div className="flex flex-col gap-6">
      <Group title={t.color}>
        <ColorField label={t.neutral} hint={t.neutralHint} value={color.neutro} onChange={(v) => set('color', { ...color, neutro: v })} />
        <ColorField label={t.brand} hint={t.brandHint} value={color.marca} onChange={(v) => set('color', { ...color, marca: v })} />
        <ColorField label={t.error} hint={t.errorHint} value={color.error} onChange={(v) => set('color', { ...color, error: v })} />
      </Group>
      <Group title={t.text}>
        <FontField label="Sans" value={texto.sans} onChange={(v) => v && set('texto', { ...texto, sans: v })} />
        <FontField label="Serif" value={texto.serif} placeholder={t.optional} onChange={(v) => set('texto', { ...texto, serif: v })} />
        <FontField label="Mono" value={texto.mono} onChange={(v) => v && set('texto', { ...texto, mono: v })} />
        <p className="text-xs text-muted-foreground">{t.fontsNote}</p>
        <SliderField label={t.baseSize} value={texto.base} min={12} max={22} step={1} format={(n) => `${n} px`} onChange={(n) => set('texto', { ...texto, base: n })} />
        <div className="flex flex-col gap-3">
          <Label>{t.scale}</Label>
          <ToggleGroup type="single" variant="outline" size="sm" value={String(texto.escala)} onValueChange={(v) => v && set('texto', { ...texto, escala: Number(v) })} className="w-full">
            {Object.keys(ESCALAS).map((ratio) => ({ ratio, name: t.scales[ratio] })).map(({ ratio, name }) => (
              <ToggleGroupItem key={ratio} value={ratio} title={name} className="flex-1 font-mono text-xs">{decimal(Number(ratio), 3)}</ToggleGroupItem>
            ))}
          </ToggleGroup>
          <p className="text-xs text-muted-foreground">{t.scales[String(texto.escala)] ?? t.ownRatio}{t.scaleNote(decimal(texto.escala, 3))}</p>
        </div>
        <SliderField label={t.lineHeight} value={texto.interlineado} min={1} max={2} step={0.05} format={(n) => decimal(n)} onChange={(n) => set('texto', { ...texto, interlineado: n })} />
      </Group>
      <Group title={t.spacing}>
        <SliderField label={t.baseUnit} value={preset.espaciado} min={2} max={8} step={1} format={(n) => `${n} px`} onChange={(n) => set('espaciado', n)} />
      </Group>
      <Group title={t.radii}>
        <SliderField label={t.baseRadius} value={preset.radio} min={0} max={24} step={1} format={(n) => `${n} px`} onChange={(n) => set('radio', n)} />
      </Group>
      <Group title={t.shadows}>
        <SliderField label={t.opacity} value={sombra.opacidad} min={0} max={0.4} step={0.01} format={(n) => `${Math.round(n * 100)} %`} onChange={(n) => set('sombra', { ...sombra, opacidad: n })} />
        <SliderField label={t.blur} value={sombra.difuminado} min={0.25} max={3} step={0.05} format={(n) => `× ${decimal(n)}`} onChange={(n) => set('sombra', { ...sombra, difuminado: n })} />
      </Group>
      <Group title={t.motion}>
        <SliderField label={t.baseDuration} value={movimiento.duracion} min={80} max={500} step={10} format={(n) => `${n} ms`} onChange={(n) => set('movimiento', { ...movimiento, duracion: n })} />
        <SliderField label={t.scale} value={movimiento.escala} min={1.2} max={2} step={0.1} format={(n) => `× ${decimal(n)}`} onChange={(n) => set('movimiento', { ...movimiento, escala: n })} />
        <p className="text-xs text-muted-foreground">
          {t.durationNote(Math.round(movimiento.duracion / movimiento.escala), movimiento.duracion, Math.round(movimiento.duracion * movimiento.escala))}
        </p>
        <div className="flex flex-col gap-3">
          <Label>{t.curves}</Label>
          <ToggleGroup type="single" variant="outline" size="sm" value={movimiento.curva} onValueChange={(v) => v && set('movimiento', { ...movimiento, curva: v })} className="w-full">
            {Object.entries(CURVAS).map(([id, c]) => (
              <ToggleGroupItem key={id} value={id} className="flex-1 text-xs">{t.easings[id] ?? c.label}</ToggleGroupItem>
            ))}
          </ToggleGroup>
          <p className="text-xs text-muted-foreground">{t.easeNote}</p>
        </div>
      </Group>
      {adjustments.length > 0 && (
        <Group title={t.manual}>
          <ul className="flex flex-col gap-2">
            {adjustments.map((a) => (
              <li key={`${a.mode}:${a.name}`} className="flex items-center gap-2 text-xs">
                <span className="size-3.5 shrink-0 rounded-sm border" style={{ background: parseColor(a.value) ? a.value : undefined }} />
                <span className="min-w-0 flex-1 truncate font-mono" title={a.value}>--{a.name} · {modeLabel(a.mode, lang)}</span>
                <Button size="icon" variant="ghost" className="size-6" aria-label={t.removeAdjustment(a.name, modeLabel(a.mode, lang))} onClick={() => onRemoveAdjustment(a.mode, a.name)}>
                  <XIcon />
                </Button>
              </li>
            ))}
          </ul>
        </Group>
      )}
    </div>
  );
}
