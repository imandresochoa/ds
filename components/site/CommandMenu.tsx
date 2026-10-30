'use client';

import { ArrowRightIcon, BotIcon, BracesIcon, CornerDownLeftIcon, FileTextIcon, MoonIcon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { agentContext } from '@/lib/agent';
import { STATUSES } from '@/lib/meta.mjs';
import type { Nav } from '@/lib/nav';
import { sitePath } from '@/lib/site';
import { cn } from '@/lib/utils';
import { useCopy } from '@/lib/use-copy';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Kbd, KbdGroup } from '@/components/ui/kbd';
import { StatusDot } from '../docs/StatusBadge';

/** Búsqueda (⌘K o /) con el diálogo de ui.shadcn.com: páginas, fichas de cada sección y acciones. */
export function CommandMenu({ nav }: { nav: Nav }) {
  const router = useRouter();
  const { setTheme, resolvedTheme } = useTheme();
  const { copy } = useCopy();
  const [open, setOpen] = useState(false);

  const run = useCallback((command: () => unknown) => {
    setOpen(false);
    command();
  }, []);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || e.key === '/') {
        const target = e.target as HTMLElement | null;
        if (target?.closest('input, textarea, select, [contenteditable="true"]')) return;
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const origin = typeof window === 'undefined' ? '' : window.location.origin;
  const actions = [
    { label: 'Copiar contexto para agentes', icon: BotIcon, run: () => copy(agentContext(nav.system, origin), 'Contexto para agentes copiado') },
    { label: 'Abrir design.md', icon: FileTextIcon, run: () => window.open(sitePath(`/${nav.system.id}/design.md`), '_blank', 'noopener') },
    { label: 'Abrir llms.txt', icon: FileTextIcon, run: () => window.open(sitePath('/llms.txt'), '_blank', 'noopener') },
    { label: 'Abrir registry.json', icon: BracesIcon, run: () => window.open(sitePath(`/${nav.system.id}/registry.json`), '_blank', 'noopener') },
    { label: 'Cambiar tema', icon: MoonIcon, run: () => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark') },
  ];

  const group = 'p-0! **:[[cmdk-group-heading]]:scroll-mt-16 **:[[cmdk-group-heading]]:p-3! **:[[cmdk-group-heading]]:pb-1!';
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="relative h-8 w-full justify-start rounded-lg border-none bg-muted pl-3 font-normal text-foreground shadow-none transition-colors hover:bg-muted/50 sm:pr-12 md:w-48 lg:w-40 xl:w-64 dark:bg-card"
          onClick={() => setOpen(true)}
        >
          <span className="hidden xl:inline-flex">Buscar en la documentación…</span>
          <span className="inline-flex xl:hidden">Buscar…</span>
          <KbdGroup className="absolute top-1.5 right-1.5 hidden sm:flex">
            <Kbd className="border">⌘</Kbd>
            <Kbd className="border">K</Kbd>
          </KbdGroup>
        </Button>
      </DialogTrigger>
      <DialogContent showCloseButton={false} className="rounded-xl border-none bg-clip-padding p-2 pb-11 shadow-2xl ring-4 ring-neutral-200/80 dark:bg-neutral-900 dark:ring-neutral-800">
        <DialogHeader className="sr-only">
          <DialogTitle>Buscar en la documentación</DialogTitle>
          <DialogDescription>Busca una página o una acción.</DialogDescription>
        </DialogHeader>
        <Command className="rounded-none bg-transparent **:data-[slot=command-input]:h-9! **:data-[slot=command-input]:py-0 **:data-[slot=command-input-wrapper]:mb-0 **:data-[slot=command-input-wrapper]:h-9! **:data-[slot=command-input-wrapper]:rounded-md **:data-[slot=command-input-wrapper]:border **:data-[slot=command-input-wrapper]:border-input **:data-[slot=command-input-wrapper]:bg-input/50">
          <CommandInput placeholder="Busca una ficha o una acción…" />
          <CommandList className="no-scrollbar min-h-80 scroll-pt-2 scroll-pb-1.5">
            <CommandEmpty className="py-12 text-center text-sm text-muted-foreground">No hay resultados.</CommandEmpty>
            <CommandGroup heading="Páginas" className={group}>
              {[...nav.top, ...nav.sections.filter((s) => !nav.top.some((t) => t.href === s.href)), { href: nav.lab, label: 'Lab de primitivos' }].map((item) => (
                <MenuItem key={item.href} value={`pagina ${item.label}`} onSelect={() => run(() => router.push(item.href))}>
                  <ArrowRightIcon />
                  {item.label}
                </MenuItem>
              ))}
            </CommandGroup>
            {nav.groups.filter((g) => g.items.length).map((g) => (
              <CommandGroup key={g.id} heading={g.label} className={group}>
                {g.items.map((item) => (
                  <MenuItem key={item.href} value={`${g.label} ${item.titulo} ${item.resumen}`} onSelect={() => run(() => router.push(item.href))}>
                    <div className="aspect-square size-4 rounded-full border border-dashed border-muted-foreground" />
                    {item.titulo}
                    {item.estado !== 'produccion' && (
                      <span className="ml-auto flex items-center gap-1.5 text-xs font-normal text-muted-foreground">
                        <StatusDot item={item} />
                        {STATUSES[item.estado as keyof typeof STATUSES]?.label}
                      </span>
                    )}
                  </MenuItem>
                ))}
              </CommandGroup>
            ))}
            <CommandGroup heading="Acciones" className={group}>
              {actions.map((a) => (
                <MenuItem key={a.label} value={`accion ${a.label}`} onSelect={() => run(a.run)}>
                  <a.icon />
                  {a.label}
                </MenuItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
        <div className="absolute inset-x-0 bottom-0 z-20 flex h-10 items-center gap-2 rounded-b-xl border-t border-t-neutral-100 bg-neutral-50 px-4 text-xs font-medium text-muted-foreground dark:border-t-neutral-700 dark:bg-neutral-800">
          <div className="flex items-center gap-2">
            <MenuKbd><CornerDownLeftIcon /></MenuKbd>
            Ir a la página
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function MenuItem({ className, ...props }: React.ComponentProps<typeof CommandItem>) {
  return <CommandItem className={cn('h-9 rounded-md border border-transparent px-3! font-medium data-[selected=true]:border-input data-[selected=true]:bg-input/50', className)} {...props} />;
}

function MenuKbd({ className, ...props }: React.ComponentProps<'kbd'>) {
  return <kbd className={cn("pointer-events-none flex h-5 items-center justify-center gap-1 rounded border bg-background px-1 font-sans text-[0.7rem] font-medium text-muted-foreground select-none [&_svg:not([class*='size-'])]:size-3", className)} {...props} />;
}
