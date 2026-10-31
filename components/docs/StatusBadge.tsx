'use client';

import { localeMeta } from '@/lib/meta.mjs';
import type { NavItem } from '@/lib/nav';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { useLang, useT } from '@/components/site/I18nProvider';

type Toned = Pick<NavItem, 'estado' | 'sync'>;

/**
 * Tono de una ficha: resume estado y sync en un color. Verde, en producción y sincronizada; ámbar, hay que
 * revisarla; rojo, declara algo que ya no existe; azul, en desarrollo; violeta, exploración; gris, obsoleta.
 */
export function tone(item: Toned): 'ok' | 'aviso' | 'error' | 'desarrollo' | 'exploracion' | 'obsoleto' {
  if (item.estado === 'desarrollo' || item.estado === 'exploracion') return item.estado;
  if (item.estado === 'sin-iniciar') return 'obsoleto';
  if (item.sync === 'ausente' || item.sync === 'sin-repo') return 'error';
  if (item.sync === 'desajuste' || item.sync === 'nuevo') return 'aviso';
  return item.estado === 'obsoleto' ? 'obsoleto' : 'ok';
}

const DOT: Record<ReturnType<typeof tone>, string> = {
  ok: 'bg-estado-ok',
  aviso: 'bg-estado-aviso',
  error: 'bg-estado-error',
  desarrollo: 'bg-estado-desarrollo',
  exploracion: 'bg-estado-exploracion',
  obsoleto: 'bg-estado-obsoleto',
};

export function StatusDot({ item, className }: { item: Toned; className?: string }) {
  return <span aria-hidden="true" className={cn('inline-flex size-2 shrink-0 rounded-full', DOT[tone(item)], className)} />;
}

const label = (map: Record<string, { label: string }>, key: string | null) => (key ? map[key]?.label ?? key : null);

/** Insignia de estado junto a la descripción. Al pasar el ratón, el detalle: estado, sync, plataformas y fuentes. */
export function StatusBadge({ item }: { item: Pick<NavItem, 'estado' | 'sync' | 'plataformas' | 'fuentes'> }) {
  const { PLATFORMS, STATUSES, SYNC_STATES } = localeMeta(useLang());
  const t = useT().status;
  const status = STATUSES[item.estado as keyof typeof STATUSES];
  const sync = item.sync ? SYNC_STATES[item.sync as keyof typeof SYNC_STATES] : null;
  const platforms = Object.entries(item.plataformas).filter(([, s]) => s !== 'sin-iniciar');
  return (
    <HoverCard openDelay={100} closeDelay={100}>
      <HoverCardTrigger asChild>
        <Badge variant="secondary" className="cursor-default rounded-full" tabIndex={0}>
          <StatusDot item={item} className="size-1.5" />
          {status?.label ?? item.estado}
          {sync && item.sync !== 'ok' && <span className="text-muted-foreground">· {sync.label}</span>}
        </Badge>
      </HoverCardTrigger>
      <HoverCardContent align="start" className="w-80 text-sm">
        <dl className="grid gap-3">
          <div>
            <dt className="text-xs font-medium text-muted-foreground">{t.status}</dt>
            <dd className="mt-0.5 font-medium">{status?.label}</dd>
            <dd className="text-muted-foreground">{status?.descripcion}</dd>
          </div>
          {sync && (
            <div>
              <dt className="text-xs font-medium text-muted-foreground">{t.production}</dt>
              <dd className="mt-0.5 font-medium">{sync.label}</dd>
              <dd className="text-muted-foreground">{sync.descripcion}</dd>
            </div>
          )}
          {platforms.length > 0 && (
            <div>
              <dt className="text-xs font-medium text-muted-foreground">{t.platforms}</dt>
              <dd className="mt-0.5">{platforms.map(([p, s]) => `${PLATFORMS[p as keyof typeof PLATFORMS]}: ${label(STATUSES, s)}`).join(' · ')}</dd>
            </div>
          )}
          {item.fuentes.length > 0 && (
            <div>
              <dt className="text-xs font-medium text-muted-foreground">{t.sources}</dt>
              {item.fuentes.map((f) => (
                <dd key={f.clave} className="mt-1 flex items-start gap-2">
                  <StatusDot item={{ estado: 'produccion', sync: f.estado }} className="mt-1.5 size-1.5" />
                  <span className="min-w-0">
                    <code className="font-mono text-xs break-all">{f.fuente}</code>
                    {f.motivo && <span className="block text-xs text-muted-foreground">{f.motivo}</span>}
                  </span>
                </dd>
              ))}
            </div>
          )}
        </dl>
      </HoverCardContent>
    </HoverCard>
  );
}
