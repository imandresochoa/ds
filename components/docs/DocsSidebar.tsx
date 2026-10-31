'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLayoutEffect, useRef } from 'react';
import type { Nav, NavItem } from '@/lib/nav';
import { useSurfaceGroups } from '@/components/site/SurfaceFilter';
import { StatusDot } from './StatusBadge';

const BUTTON = 'relative flex h-[30px] w-fit items-center gap-2 overflow-visible rounded-md border border-transparent p-2 text-left text-[0.8rem] font-medium outline-hidden ring-ring transition-[width,height,padding] after:absolute after:inset-x-0 after:-inset-y-1 after:z-0 after:rounded-md hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 data-[active=true]:border-accent data-[active=true]:bg-accent data-[active=true]:text-accent-foreground';
const LABEL = 'flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium text-muted-foreground';

/** Barra lateral de Docs de ui.shadcn.com: «Secciones» y un grupo por sección con sus páginas (las de la superficie elegida). */
export function DocsSidebar({ nav }: { nav: Nav }) {
  const pathname = usePathname().replace(/\/$/, '');
  const ref = useRef<HTMLDivElement>(null);
  const groups = useSurfaceGroups(nav);

  // Al cambiar de página, la activa queda a la vista.
  useLayoutEffect(() => {
    const container = ref.current;
    const active = container?.querySelector<HTMLElement>('[data-active="true"][data-page]');
    if (!container || !active) return;
    const box = container.getBoundingClientRect();
    const item = active.getBoundingClientRect();
    if (item.top < box.top || item.bottom > box.bottom) container.scrollTop += item.top - box.top - (container.clientHeight - item.height) / 2;
  }, [pathname]);

  const isSection = (href: string) => (href.endsWith('/docs') ? pathname === href : pathname === href || pathname.startsWith(`${href}/`));

  return (
    <aside className="sticky top-[calc(var(--header-height)+0.6rem)] z-30 hidden h-[calc(100svh-10rem)] w-(--sidebar-width) flex-col overflow-hidden overscroll-none bg-transparent [--sidebar-menu-width:--spacing(56)] lg:flex">
      <div className="absolute top-12 right-2 bottom-0 hidden h-full w-px bg-[linear-gradient(to_bottom,transparent_0%,var(--border)_10%,var(--border)_90%,transparent_100%)] lg:flex" />
      <div ref={ref} className="no-scrollbar flex min-h-0 w-(--sidebar-menu-width) flex-1 flex-col gap-2 overflow-x-hidden overflow-y-auto pl-2.5">
        <div className="relative flex w-full min-w-0 flex-col p-2 pt-12">
          <div className={LABEL}>Secciones</div>
          <ul className="flex w-full min-w-0 flex-col gap-1">
            {nav.sections.map((s) => (
              <li key={s.href}>
                <Link href={s.href} data-active={isSection(s.href)} className={BUTTON}>
                  <span className="absolute inset-0 flex w-(--sidebar-menu-width) bg-transparent" />
                  {s.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        {groups.map((g) => (
          <div key={g.id} className="relative flex w-full min-w-0 flex-col p-2">
            <div className={LABEL}>{g.label}</div>
            <ul className="flex w-full min-w-0 flex-col gap-0.5">
              {g.items.map((item) => <SidebarItem key={item.href} item={item} active={pathname === item.href || pathname.startsWith(`${item.href}/`)} />)}
            </ul>
          </div>
        ))}
      </div>
    </aside>
  );
}

/** Una página. Punto azul si es nueva; punto de su color si no está en producción o el sync avisa. */
function SidebarItem({ item, active }: { item: NavItem; active: boolean }) {
  const flagged = item.estado !== 'produccion' || (item.sync !== null && item.sync !== 'ok');
  return (
    <li>
      <Link href={item.href} data-active={active} data-page className={BUTTON}>
        <span className="absolute inset-0 flex w-(--sidebar-menu-width) bg-transparent" />
        {item.titulo}
        {item.nuevo && <span className="flex size-2 rounded-full bg-nuevo" title="Nuevo" />}
        {!item.nuevo && flagged && item.seccion !== 'docs' && item.seccion !== 'metodologia' && <StatusDot item={item} className="size-1.5" />}
      </Link>
    </li>
  );
}
