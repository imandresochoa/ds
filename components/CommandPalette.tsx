'use client';

import { CornerDownLeft, FileText } from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { NavItem, NavSection } from '@/lib/nav';
import { STROKE } from './icons';

export type PaletteAction = { label: string; icon: ReactNode; hint?: string; run: () => void };

const normalize = (text: string) => text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();

/** Paleta ⌘K: busca fichas y lanza acciones rápidas, como el buscador de Codex. */
export function CommandPalette({ items, sections, recents, actions, onNavigate, onClose }: {
  items: NavItem[];
  sections: NavSection[];
  recents: NavItem[];
  actions: PaletteAction[];
  onNavigate: (href: string) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const sectionLabel = (id: string) => sections.find((s) => s.id === id)?.label ?? id;

  const results = useMemo(() => {
    const q = normalize(query.trim());
    const pages = q
      ? items.filter((i) => normalize(`${i.titulo} ${i.resumen} ${sectionLabel(i.seccion)}`).includes(q)).slice(0, 9)
      : (recents.length ? recents : items).slice(0, 9);
    const acts = actions.filter((a) => !q || normalize(a.label).includes(q));
    return { pages, acts };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, items, recents, actions]);

  const flat = [...results.pages.map((p) => () => onNavigate(p.href)), ...results.acts.map((a) => a.run)];

  useEffect(() => inputRef.current?.focus(), []);
  useEffect(() => setActive(0), [query]);

  const onKey = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') onClose();
    if (event.key === 'ArrowDown') { event.preventDefault(); setActive((a) => Math.min(a + 1, flat.length - 1)); }
    if (event.key === 'ArrowUp') { event.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    if (event.key === 'Enter') { event.preventDefault(); flat[active]?.(); onClose(); }
    if ((event.ctrlKey || event.metaKey) && /^[1-9]$/.test(event.key)) {
      event.preventDefault();
      const page = results.pages[Number(event.key) - 1];
      if (page) { onNavigate(page.href); onClose(); }
    }
  };

  return (
    <>
      <div className="ds-overlay" onMouseDown={onClose} />
      <div className="ds-palette" role="dialog" aria-label="Buscar en el sistema" onKeyDown={onKey}>
        <input ref={inputRef} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar en el sistema" aria-label="Buscar" />
        <div className="ds-palette-list">
          {results.pages.length > 0 && <div className="ds-palette-label">{query ? 'Fichas' : recents.length ? 'Recientes' : 'Fichas'}</div>}
          {results.pages.map((page, index) => (
            <button key={page.href} type="button" className={`ds-palette-item${active === index ? ' is-active' : ''}`} onMouseEnter={() => setActive(index)} onClick={() => { onNavigate(page.href); onClose(); }}>
              <FileText size={16} strokeWidth={STROKE} />
              <span>{page.titulo}</span>
              <small>{sectionLabel(page.seccion)}</small>
              <span className="ds-kbd">⌃{index + 1}</span>
            </button>
          ))}
          {results.acts.length > 0 && <div className="ds-palette-label">Acciones rápidas</div>}
          {results.acts.map((action, i) => {
            const index = results.pages.length + i;
            return (
              <button key={action.label} type="button" className={`ds-palette-item${active === index ? ' is-active' : ''}`} onMouseEnter={() => setActive(index)} onClick={() => { action.run(); onClose(); }}>
                {action.icon}
                <span>{action.label}</span>
                {action.hint ? <span className="ds-kbd">{action.hint}</span> : <CornerDownLeft size={14} strokeWidth={STROKE} />}
              </button>
            );
          })}
          {!flat.length && <div className="ds-palette-label">Sin resultados</div>}
        </div>
      </div>
    </>
  );
}
