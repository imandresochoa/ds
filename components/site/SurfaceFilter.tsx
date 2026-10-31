'use client';

import { CheckIcon, ChevronsUpDownIcon } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { Nav, NavItem } from '@/lib/nav';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

/** Parámetro de la URL con la superficie elegida: se puede enlazar. */
const PARAM = 'superficie';

type SurfaceState = { surface: string | null; setSurface: (id: string | null) => void; surfaces: Nav['superficies'] };
const SurfaceContext = createContext<SurfaceState>({ surface: null, setSurface: () => {}, surfaces: [] });

export const useSurface = () => useContext(SurfaceContext);

/** Si una ficha se ve con la superficie elegida: es suya o es común (sin superficie). */
export const inSurface = (item: Pick<NavItem, 'superficies'>, surface: string | null) => !surface || !item.superficies.length || item.superficies.includes(surface);

/** Los grupos de la barra lateral, el menú móvil y ⌘K con las fichas de la superficie elegida, sin los que quedan vacíos. */
export function useSurfaceGroups(nav: Nav) {
  const { surface } = useSurface();
  return nav.groups.map((g) => ({ ...g, items: g.items.filter((i) => inSurface(i, surface)) })).filter((g) => g.items.length);
}

/**
 * La superficie elegida en la cabecera, para todo el sistema. Va en la URL (`?superficie=`), y se recuerda en el
 * navegador para que siga puesta al pasar de una página a otra. Las piezas de servidor (galerías, índices,
 * cobertura) marcan lo suyo con `data-superficies`, y una regla de CSS oculta lo que no es de la elegida.
 */
export function SurfaceProvider({ nav, children }: { nav: Nav; children: React.ReactNode }) {
  const pathname = usePathname();
  // undefined: aún sin leer la URL ni el navegador (en el servidor y en el primer render).
  const [surface, setState] = useState<string | null | undefined>(undefined);
  const valid = useCallback((id: string | null) => (id && nav.superficies.some((s) => s.id === id) ? id : null), [nav.superficies]);
  const key = `ds:superficie:${nav.system.id}`;
  const enabled = nav.superficies.length > 1;

  const setSurface = useCallback(
    (id: string | null) => {
      const next = valid(id);
      setState(next);
      try {
        if (next) window.localStorage.setItem(key, next);
        else window.localStorage.removeItem(key);
      } catch {}
    },
    [key, valid],
  );

  // Al cargar, manda la URL (un enlace con `?superficie=` queda como la elección); sin ella, lo último que se eligió aquí.
  useEffect(() => {
    if (!enabled) return;
    const fromUrl = valid(new URLSearchParams(window.location.search).get(PARAM));
    let stored: string | null = null;
    try {
      stored = window.localStorage.getItem(key);
    } catch {}
    if (fromUrl) setSurface(fromUrl);
    else setState(valid(stored));
  }, [enabled, key, valid, setSurface]);

  // La URL lleva siempre la elección: los enlaces internos no la conservan, así que se repone tras cada cambio de página.
  useEffect(() => {
    if (!enabled || surface === undefined) return;
    const url = new URL(window.location.href);
    if (url.searchParams.get(PARAM) === surface) return;
    if (surface) url.searchParams.set(PARAM, surface);
    else url.searchParams.delete(PARAM);
    window.history.replaceState(window.history.state, '', url);
  }, [enabled, surface, pathname]);

  return (
    <SurfaceContext.Provider value={{ surface: enabled ? (surface ?? null) : null, setSurface, surfaces: enabled ? nav.superficies : [] }}>
      {enabled && surface && <style>{`[data-superficies]:not([data-superficies~=${JSON.stringify(surface)}]){display:none!important}`}</style>}
      {children}
    </SurfaceContext.Provider>
  );
}

/** Selector de la cabecera, como el de equipo o proyecto de Vercel. Solo con dos superficies o más. */
export function SurfaceSwitcher({ className }: { className?: string }) {
  const { surface, setSurface, surfaces } = useSurface();
  if (surfaces.length < 2) return null;
  const current = surfaces.find((s) => s.id === surface);
  const option = (id: string | null, label: string) => (
    <DropdownMenuItem key={id ?? ''} onSelect={() => setSurface(id)}>
      {label}
      <CheckIcon className={cn('ml-auto', surface !== id && 'invisible')} />
    </DropdownMenuItem>
  );
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className={cn('h-8 gap-1.5 px-2 font-medium', className)}>
          <span className="max-w-36 truncate">{current?.nombre ?? 'Todas'}</span>
          <ChevronsUpDownIcon className="text-muted-foreground" />
          <span className="sr-only">Elegir superficie</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">Superficies</DropdownMenuLabel>
        {option(null, 'Todas')}
        <DropdownMenuSeparator />
        {surfaces.map((s) => option(s.id, s.nombre))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
