'use client';

import { PLATFORMS, STATUSES, SYNC_STATES } from '@/lib/meta.mjs';
import type { NavItem } from '@/lib/nav';

/**
 * Una sola pastilla con el estado de la ficha. El color resume estado + sync:
 * verde = en producción y sincronizada; ámbar = en producción pero hay que revisarla;
 * rojo = declara algo que ya no existe en producción. Al pasar el ratón, el detalle.
 */
export function tone(item: Pick<NavItem, 'estado' | 'sync'>): string {
  if (item.estado !== 'produccion' && item.estado !== 'obsoleto') return item.estado;
  if (item.sync === 'ausente' || item.sync === 'sin-repo') return 'error';
  if (item.sync === 'desajuste' || item.sync === 'nuevo') return 'aviso';
  return item.estado === 'obsoleto' ? 'obsoleto' : 'ok';
}

const label = (map: Record<string, { label: string }>, key: string | null) => (key ? map[key]?.label ?? key : null);

export function StatusPill({ item }: { item: NavItem }) {
  const status = STATUSES[item.estado as keyof typeof STATUSES];
  const sync = item.sync ? SYNC_STATES[item.sync as keyof typeof SYNC_STATES] : null;
  const platforms = Object.entries(item.plataformas).filter(([, s]) => s !== 'sin-iniciar');
  return (
    <div className="ds-status">
      <button type="button" className="ds-tag" data-tone={tone(item)} aria-describedby="ds-status-card">
        <i className="ds-dot" />
        {status?.label ?? item.estado}
      </button>
      <div className="ds-status-card" id="ds-status-card" role="tooltip">
        <dl>
          <dt>Estado</dt>
          <dd>{status?.label}<small>{status?.descripcion}</small></dd>
          {sync && (
            <>
              <dt>Producción</dt>
              <dd>{sync.label}<small>{sync.descripcion}</small></dd>
            </>
          )}
          {platforms.length > 0 && (
            <>
              <dt>Plataformas</dt>
              <dd>{platforms.map(([p, s]) => `${PLATFORMS[p as keyof typeof PLATFORMS]}: ${label(STATUSES, s)}`).join(' · ')}</dd>
            </>
          )}
          {item.fuentes.length > 0 && (
            <>
              <dt>Fuentes</dt>
              <dd>
                {item.fuentes.map((f) => (
                  <span key={f.clave} className="ds-status-source">
                    <i className="ds-dot" data-s={f.estado} />
                    <code>{f.fuente}</code>
                    {f.motivo && <small>{f.motivo}</small>}
                  </span>
                ))}
              </dd>
            </>
          )}
        </dl>
      </div>
    </div>
  );
}
