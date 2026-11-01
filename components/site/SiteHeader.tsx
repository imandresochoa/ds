'use client';

import { ChevronsUpDownIcon, CodeIcon, FlaskConicalIcon, PlusIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Nav } from '@/lib/nav';
import { cn } from '@/lib/utils';
import { useCopy } from '@/lib/use-copy';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { CommandMenu } from './CommandMenu';
import { GitHubIcon, SystemMark } from './icons';
import { MobileNav } from './MobileNav';
import { ModeSwitcher } from './ModeSwitcher';
import { SurfaceSwitcher, useSurface } from './SurfaceFilter';

/**
 * Cabecera como la de Geist: la marca del sistema (y su selector de superficie, si hay varias), la búsqueda, el repo,
 * el tema y «Nuevo». Sin enlaces de navegación: la navegación es la barra lateral.
 */
export function SiteHeader({ nav }: { nav: Nav }) {
  return (
    <header className="sticky top-0 z-50 w-full bg-background">
      <div className="container-wrapper px-6">
        <div className="flex h-(--header-height) items-center **:data-[slot=separator]:h-4!">
          <MobileNav nav={nav} className="flex lg:hidden" />
          <SystemSwitcher nav={nav} className="hidden lg:flex" />
          <SurfaceCrumb />
          <div className="ml-auto flex items-center gap-2 md:flex-1 md:justify-end">
            <div className="hidden w-full flex-1 md:flex md:w-auto md:flex-none">
              <CommandMenu nav={nav} />
            </div>
            <Separator orientation="vertical" className="ml-2 hidden lg:block" />
            {nav.system.repo && (
              <>
                <RepoLink href={nav.system.repo} />
                <Separator orientation="vertical" />
              </>
            )}
            <ModeSwitcher />
            <Separator orientation="vertical" />
            <NewMenu nav={nav} />
          </div>
        </div>
      </div>
    </header>
  );
}

/** Tras la marca, como el proyecto tras el equipo en Vercel: «/» y el selector de superficie. Solo con dos o más. */
function SurfaceCrumb() {
  const { surfaces } = useSurface();
  if (surfaces.length < 2) return null;
  return (
    <div className="hidden items-center lg:flex">
      <span className="mx-1 text-lg font-light text-muted-foreground/50 select-none" aria-hidden>/</span>
      <SurfaceSwitcher />
    </div>
  );
}

/** Marca y nombre del sistema; llevan al inicio. Con más de un sistema, abren la lista para cambiar. */
function SystemSwitcher({ nav, className }: { nav: Nav; className?: string }) {
  const router = useRouter();
  const brand = (
    <>
      <SystemMark system={nav.system} />
      <span className="max-w-48 truncate">{nav.system.nombre}</span>
    </>
  );
  if (nav.systems.length < 2) {
    return (
      <Button asChild variant="ghost" size="sm" className={cn('h-8 gap-2 px-1.5 font-semibold', className)}>
        <Link href={`/${nav.system.id}`}>{brand}</Link>
      </Button>
    );
  }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className={cn('h-8 gap-2 px-1.5 font-semibold', className)}>
          {brand}
          <ChevronsUpDownIcon className="text-muted-foreground" />
          <span className="sr-only">Cambiar de sistema</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel>Sistemas</DropdownMenuLabel>
        {nav.systems.map((s) => (
          <DropdownMenuItem key={s.id} onSelect={() => router.push(`/${s.id}`)}>
            <SystemMark system={s} />
            {s.nombre}
            {s.id === nav.system.id && <span className="ml-auto text-xs text-muted-foreground">Actual</span>}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function RepoLink({ href }: { href: string }) {
  const github = href.includes('github.com');
  return (
    <Button asChild size="sm" variant="ghost" className="h-8 shadow-none">
      <a href={href} target="_blank" rel="noreferrer">
        {github ? <GitHubIcon /> : <CodeIcon />}
        <span className="sr-only">Código en producción</span>
      </a>
    </Button>
  );
}

/** «Nuevo»: el Lab de primitivos y los prompts para que un agente cree cada pieza siguiendo la metodología. */
function NewMenu({ nav }: { nav: Nav }) {
  const { copy } = useCopy();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" className="h-[31px] rounded-lg">
          <PlusIcon />
          Nuevo
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem asChild>
          <Link href={nav.lab}>
            <FlaskConicalIcon />
            Lab de primitivos
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">Copia un prompt para tu agente</DropdownMenuLabel>
        {nav.acciones.slice(0, -1).map((a) => (
          <DropdownMenuItem key={a.label} onSelect={() => void copy(a.prompt, 'Prompt copiado para tu agente')}>{a.label}</DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        {nav.acciones.slice(-1).map((a) => (
          <DropdownMenuItem key={a.label} onSelect={() => void copy(a.prompt, 'Prompt copiado para tu agente')}>{a.label}</DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
