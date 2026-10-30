import { STATUSES, SYNC_STATES } from '@/lib/meta.mjs';

export function StatusBadge({ estado }: { estado: string }) {
  const info = STATUSES[estado as keyof typeof STATUSES];
  return (
    <span className="ds-badge" title={info?.descripcion}>
      <i className="ds-dot" data-s={estado} />
      {info?.label ?? estado}
    </span>
  );
}

export function SyncBadge({ estado }: { estado: string | null | undefined }) {
  if (!estado) return null;
  const info = SYNC_STATES[estado as keyof typeof SYNC_STATES];
  return (
    <span className="ds-badge" title={info?.descripcion}>
      <i className="ds-dot" data-s={estado} />
      {info?.label ?? estado}
    </span>
  );
}
