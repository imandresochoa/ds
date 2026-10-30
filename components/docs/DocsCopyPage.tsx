'use client';

import { CheckIcon, ChevronDownIcon, CopyIcon, ExternalLinkIcon, FileTextIcon, LinkIcon } from 'lucide-react';
import { toast } from 'sonner';
import { openInAgentPrompt } from '@/lib/agent';
import type { SystemSummary } from '@/lib/nav';
import { sitePath } from '@/lib/site';
import { useCopy } from '@/lib/use-copy';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';

/**
 * «Copiar página» de shadcn: copia la página en Markdown (el mismo .md que leen los agentes). El menú abre el .md,
 * copia el enlace y, si el sistema lo activa (`abrirEnAgentes`), abre la página en Claude o ChatGPT.
 */
export function DocsCopyPage({ md, system, abrirEnAgentes }: { md: string | null; system: Pick<SystemSummary, 'nombre'>; abrirEnAgentes: boolean }) {
  const { copy, copied } = useCopy();
  const copyPage = async () => {
    if (!md) return toast.error('Esta página no tiene versión Markdown');
    const res = await fetch(sitePath(md));
    if (!res.ok) return toast.error('No se encontró el Markdown de esta página');
    await copy(await res.text());
  };
  const url = () => window.location.href.split('#')[0];
  const open = (base: string) => window.open(`${base}?q=${encodeURIComponent(openInAgentPrompt(system, url()))}`, '_blank', 'noopener');

  return (
    <div className="group/buttons relative flex rounded-lg bg-secondary *:[[data-slot=button]]:focus-visible:relative *:[[data-slot=button]]:focus-visible:z-10">
      <Button variant="secondary" size="sm" className="h-8 shadow-none md:h-7 md:text-[0.8rem]" onClick={() => void copyPage()}>
        {copied ? <CheckIcon /> : <CopyIcon />}
        Copiar página
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" size="sm" className="peer -ml-0.5 size-8 shadow-none md:size-7 md:text-[0.8rem]">
            <ChevronDownIcon />
            <span className="sr-only">Más opciones</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="animate-none! rounded-lg shadow-none">
          {md && (
            <DropdownMenuItem asChild>
              <a href={sitePath(md)} target="_blank" rel="noreferrer"><FileTextIcon />Ver como Markdown</a>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onSelect={() => void copy(url(), 'Enlace copiado')}><LinkIcon />Copiar enlace</DropdownMenuItem>
          {abrirEnAgentes && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => open('https://claude.ai/new')}><ExternalLinkIcon />Abrir en Claude</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => open('https://chatgpt.com')}><ExternalLinkIcon />Abrir en ChatGPT</DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      <Separator orientation="vertical" className="absolute top-1 right-8 z-0 h-6! bg-foreground/5! peer-focus-visible:opacity-0 sm:right-7 sm:h-5!" />
    </div>
  );
}
