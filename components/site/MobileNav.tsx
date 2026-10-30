'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { Nav } from '@/lib/nav';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

/** Menú a pantalla completa de ui.shadcn.com en móvil: navegación, secciones y fichas. */
export function MobileNav({ nav, className }: { nav: Nav; className?: string }) {
  const [open, setOpen] = useState(false);
  const link = (href: string, label: string, isNew = false) => (
    <Link key={href} href={href} onClick={() => setOpen(false)} className="flex items-center gap-2 text-2xl font-medium">
      {label}
      {isNew && <span className="flex size-2 rounded-full bg-nuevo" title="Nuevo" />}
    </Link>
  );
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" className={cn('extend-touch-target h-8 touch-manipulation items-center justify-start gap-2.5 p-0! hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 active:bg-transparent dark:hover:bg-transparent', className)}>
          <div className="relative flex h-8 w-4 items-center justify-center">
            <div className="relative size-4">
              <span className={cn('absolute left-0 block h-0.5 w-4 bg-foreground transition-all duration-100', open ? 'top-[0.4rem] -rotate-45' : 'top-1')} />
              <span className={cn('absolute left-0 block h-0.5 w-4 bg-foreground transition-all duration-100', open ? 'top-[0.4rem] rotate-45' : 'top-2.5')} />
            </div>
            <span className="sr-only">Abrir el menú</span>
          </div>
          <span className="flex h-8 items-center text-lg leading-none font-medium">Menú</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="no-scrollbar h-(--radix-popper-available-height) w-(--radix-popper-available-width) overflow-y-auto rounded-none border-none bg-background/90 p-0 shadow-none backdrop-blur duration-100"
        align="start"
        side="bottom"
        alignOffset={-16}
        sideOffset={14}
      >
        <div className="flex flex-col gap-12 overflow-auto px-6 py-6">
          <div className="flex flex-col gap-4">
            <div className="text-sm font-medium text-muted-foreground">Menú</div>
            <div className="flex flex-col gap-3">{nav.top.map((item) => link(item.href, item.label))}</div>
          </div>
          <div className="flex flex-col gap-4">
            <div className="text-sm font-medium text-muted-foreground">Secciones</div>
            <div className="flex flex-col gap-3">{nav.sections.filter((s) => !nav.top.some((t) => t.href === s.href)).map((item) => link(item.href, item.label))}</div>
          </div>
          <div className="flex flex-col gap-8">
            {nav.groups.filter((g) => g.items.length).map((g) => (
              <div key={g.id} className="flex flex-col gap-4">
                <div className="text-sm font-medium text-muted-foreground">{g.label}</div>
                <div className="flex flex-col gap-3">{g.items.map((item) => link(item.href, item.titulo, item.nuevo))}</div>
              </div>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
