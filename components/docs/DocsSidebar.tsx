'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLayoutEffect, useRef } from 'react';
import type { Nav, NavItem } from '@/lib/nav';
import { useSurfaceGroups } from '@/components/site/SurfaceFilter';
import { StatusDot } from './StatusBadge';

// Densidad de Geist: título de grupo y elementos al mismo tamaño, el título con más peso y sin enlace.
const BUTTON = 'relative flex min-h-8 w-fit items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm leading-5 text-muted-foreground outline-hidden ring-ring transition-colors after:absolute after:inset-x-0 after:-inset-y-px after:z-0 after:rounded-md hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 data-[active=true]:bg-accent data-[active=true]:font-medium data-[active=true]:text-foreground';
// El fondo se ajusta al texto, pero se pulsa en todo el ancho de la barra.
const HIT = <span className="absolute inset-0 flex w-(--sidebar-menu-width) bg-transparent" />;
const LABEL = 'flex h-8 shrink-0 items-center px-2 text-sm font-medium text-foreground';

/**
 * La única navegación del sistema, como la de Geist: grupos fijos (Empezar y una sección por grupo) con sus páginas,
 * las de la superficie elegida. El título de un grupo no es un enlace; su índice es el primer elemento, «Vista general».
 */
export function DocsSidebar({ nav }: { nav: Nav }) {
  const pathname = usePathname().replace(/\/$/, '');
  const ref = useRef<HTMLDivElement>(null);
  const groups = useSurfaceGroups(nav);

  // Al cambiar de página, la activa queda a la vista.
  useLayoutEffect(() => {
    const container = ref.current;
    const active = container?.querySelector<HTMLElement>('[data-active="true"]');
    if (!container || !active) return;
    const box = container.getBoundingClientRect();
    const item = active.getBoundingClientRect();
    if (item.top < box.top || item.bottom > box.bottom) container.scrollTop += item.top - box.top - (container.clientHeight - item.height) / 2;
  }, [pathname]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <aside className="sticky top-[calc(var(--header-height)+0.6rem)] z-30 hidden h-[calc(100svh-var(--header-height)-0.6rem)] w-(--sidebar-width) flex-col overflow-hidden overscroll-none bg-transparent [--sidebar-menu-width:--spacing(60)] lg:flex">
      <div className="absolute top-12 right-2 bottom-0 hidden h-full w-px bg-[linear-gradient(to_bottom,transparent_0%,var(--border)_10%,var(--border)_90%,transparent_100%)] lg:flex" />
      <nav ref={ref} aria-label="Documentación" className="no-scrollbar flex min-h-0 w-(--sidebar-menu-width) flex-1 flex-col gap-5 overflow-x-hidden overflow-y-auto pt-10 pb-12 pl-2.5">
        {groups.map((g) => (
          <div key={g.id} className="flex w-full min-w-0 flex-col px-2">
            <div className={LABEL}>{g.label}</div>
            <ul className="flex w-full min-w-0 flex-col">
              {g.href && (
                <li>
                  <Link href={g.href} data-active={pathname === g.href} className={BUTTON}>
                    {HIT}
                    Vista general
                  </Link>
                </li>
              )}
              {g.items.map((item) => (
                <SidebarItem key={item.href} item={item} active={item.href.endsWith('/docs') ? pathname === item.href : isActive(item.href)} />
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}

/** Una página. Punto azul si es nueva; punto de su color si no está en producción o el sync avisa. */
function SidebarItem({ item, active }: { item: NavItem; active: boolean }) {
  const flagged = item.estado !== 'produccion' || (item.sync !== null && item.sync !== 'ok');
  return (
    <li>
      <Link href={item.href} data-active={active} className={BUTTON}>
        {HIT}
        {item.titulo}
        {item.nuevo && <span className="flex size-2 shrink-0 rounded-full bg-nuevo" title="Nuevo" />}
        {!item.nuevo && flagged && item.seccion !== 'docs' && item.seccion !== 'metodologia' && <StatusDot item={item} className="size-1.5 shrink-0" />}
      </Link>
    </li>
  );
}
