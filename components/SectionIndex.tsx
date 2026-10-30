'use client';

import Link from 'next/link';
import { useState } from 'react';
import { PLATFORMS, STATUSES } from '@/lib/meta.mjs';
import type { NavGroup } from '@/lib/nav';
import { StatusBadge } from './Status';

type Platforms = Record<string, Record<string, string>>;

/** Índice de una sección: filtros por estado (pastillas) y lista agrupada. */
export function SectionIndex({ groups, platforms }: { groups: NavGroup[]; platforms: Platforms }) {
  const [filter, setFilter] = useState('todas');
  const all = groups.flatMap((g) => g.items);
  const statuses = Object.keys(STATUSES).filter((s) => all.some((i) => i.estado === s));
  const visible = groups
    .map((g) => ({ ...g, items: g.items.filter((i) => filter === 'todas' || i.estado === filter) }))
    .filter((g) => g.items.length);

  return (
    <>
      <div className="ds-pills" role="tablist" aria-label="Filtrar por estado">
        {[['todas', 'Todas'] as const, ...statuses.map((s) => [s, STATUSES[s as keyof typeof STATUSES].label] as const)].map(([id, label]) => (
          <button key={id} type="button" role="tab" aria-selected={filter === id} className={`ds-pill${filter === id ? ' is-active' : ''}`} onClick={() => setFilter(id)}>
            {label}
            <small>{id === 'todas' ? all.length : all.filter((i) => i.estado === id).length}</small>
          </button>
        ))}
      </div>
      <div className="ds-content">
        {!visible.length && <p className="ds-note">Todavía no hay fichas en esta sección.</p>}
        {visible.map((group) => (
          <section key={group.label} className="ds-list-group">
            <h2 className="ds-list-label">{group.label}</h2>
            <ul className="ds-list">
              {group.items.map((item) => (
                <li key={item.href} className="ds-list-item">
                  <Link href={item.href}>
                    <span>
                      <strong>{item.titulo}</strong>
                      {item.resumen && <p>{item.resumen}</p>}
                    </span>
                    <span className="ds-list-side">
                      {platforms[item.href] && (
                        <span className="ds-platform-dots" title={Object.entries(platforms[item.href]).map(([p, s]) => `${PLATFORMS[p as keyof typeof PLATFORMS]}: ${STATUSES[s as keyof typeof STATUSES]?.label}`).join(' · ')}>
                          {Object.entries(platforms[item.href]).map(([p, s]) => <i key={p} className="ds-dot" data-s={s} />)}
                        </span>
                      )}
                      <StatusBadge estado={item.estado} />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </>
  );
}
