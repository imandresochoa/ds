'use client';

import { useEffect, useLayoutEffect, useRef, type ReactNode } from 'react';

export type MenuEntry =
  | { type?: 'item'; label: string; icon?: ReactNode; hint?: string; onSelect: () => void }
  | { type: 'sep' }
  | { type: 'label'; label: string };

/** Menú flotante anclado a un botón, con el estilo de los menús de Codex. */
export function Menu({ anchor, align = 'start', entries, onClose }: { anchor: DOMRect; align?: 'start' | 'end' | 'right' | 'up'; entries: MenuEntry[]; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const close = useRef(onClose);
  useEffect(() => {
    close.current = onClose;
  });

  useEffect(() => {
    const onClose = () => close.current();
    ref.current?.querySelector<HTMLButtonElement>('button')?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        const buttons = [...(ref.current?.querySelectorAll('button') ?? [])];
        const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
        buttons[(index + (event.key === 'ArrowDown' ? 1 : -1) + buttons.length) % buttons.length]?.focus();
      }
    };
    const onDown = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) onClose();
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('mousedown', onDown);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('mousedown', onDown);
    };
  }, []);

  // Se abre hacia arriba junto al rail (perfil) y nunca se sale de la ventana.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const box = el.getBoundingClientRect();
    if (box.bottom > window.innerHeight - 8) el.style.top = `${Math.max(8, window.innerHeight - 8 - box.height)}px`;
  }, []);

  const style =
    align === 'up'
      ? { left: anchor.right + 8, bottom: window.innerHeight - anchor.bottom }
      : align === 'right'
      ? { left: anchor.right + 8, top: anchor.top }
      : align === 'end'
        ? { right: window.innerWidth - anchor.right, top: anchor.bottom + 6 }
        : { left: anchor.left, top: anchor.bottom + 6 };

  return (
    <div ref={ref} className="ds-menu" role="menu" style={style}>
      {entries.map((entry, index) => {
        if (entry.type === 'sep') return <div key={index} className="ds-menu-sep" />;
        if (entry.type === 'label') return <div key={index} className="ds-menu-label">{entry.label}</div>;
        return (
          <button
            key={index}
            type="button"
            role="menuitem"
            className="ds-menu-item"
            onClick={() => {
              onClose();
              entry.onSelect();
            }}
          >
            {entry.icon}
            {entry.label}
            {entry.hint && <small>{entry.hint}</small>}
          </button>
        );
      })}
    </div>
  );
}
