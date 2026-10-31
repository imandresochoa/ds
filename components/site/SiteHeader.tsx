'use client';

import { CodeIcon, FlaskConicalIcon, PlusIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { Nav } from '@/lib/nav';
import { cn } from '@/lib/utils';
import { useCopy } from '@/lib/use-copy';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { CommandMenu } from './CommandMenu';
import { GitHubIcon, SystemMark } from './icons';
import { MobileNav } from './MobileNav';
import { ModeSwitcher } from './ModeSwitcher';
import { SurfaceSwitcher } from './SurfaceFilter';

/** Cabecera de ui.shadcn.com: navegación superior, búsqueda, repo, tema y «Nuevo». Con varias superficies, su selector. */
export function SiteHeader({ nav }: { nav: Nav }) {
  return (
    <header className="sticky top-0 z-50 w-full bg-background">
      <div className="container-wrapper px-6">
        <div className="flex h-(--header-height) items-center **:data-[slot=separator]:h-4!">
          <MobileNav nav={nav} className="flex lg:hidden" />
          <SystemSwitcher nav={nav} className="mr-2 hidden lg:flex" />
          <SurfaceSwitcher className="mr-2 -ml-1 hidden lg:flex" />
          <MainNav items={nav.top} className="hidden lg:flex" />
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

function MainNav({ items, className }: { items: Nav['top']; className?: string }) {
  const pathname = usePathname().replace(/\/$/, '');
  return (
    <nav className={cn('items-center gap-0', className)}>
      {items.map((item) => (
        <Button key={item.href} variant="ghost" asChild size="sm" className="px-2.5">
          <Link href={item.href} data-active={pathname === item.href} className="relative items-center">
            {item.label}
          </Link>
        </Button>
      ))}
    </nav>
  );
}

/** Marca del sistema. Con más de un sistema, abre la lista para cambiar. */
function SystemSwitcher({ nav, className }: { nav: Nav; className?: string }) {
  const router = useRouter();
  const mark = <SystemMark system={nav.system} />;
  if (nav.systems.length < 2) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button asChild variant="ghost" size="icon" className={cn('size-8', className)}>
            <Link href={`/${nav.system.id}`}>
              {mark}
              <span className="sr-only">{nav.system.nombre}</span>
            </Link>
          </Button>
        </TooltipTrigger>
        <TooltipContent>{nav.system.nombre}</TooltipContent>
      </Tooltip>
    );
  }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className={cn('size-8', className)}>
          {mark}
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
