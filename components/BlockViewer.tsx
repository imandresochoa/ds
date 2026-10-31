'use client';

import { CheckIcon, FileTextIcon, MonitorIcon, SmartphoneIcon, TabletIcon } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { sitePath } from '@/lib/site';
import { useCopy } from '@/lib/use-copy';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { CopyButton } from './CodeBlock';
import { Preview, PreviewModeToggle, previewModes, type PreviewSurface } from './Preview';

/**
 * Visor de un bloque, como el de la página Blocks de shadcn: barra con Vista/Código, el título que lleva a la ficha,
 * los anchos de escritorio, tablet y móvil, y el botón que copia lo que necesita un agente para usarlo.
 */
export function BlockViewer({ id, title, href, md, html, code, codeHtml, surface, background, vista, mode: initialMode }: {
  id: string;
  title: string;
  href: string;
  md: string;
  html: string;
  code: string;
  codeHtml: string | null;
  surface: PreviewSurface;
  background?: string;
  vista?: number | true;
  mode?: string;
}) {
  const [view, setView] = useState('vista');
  const [width, setWidth] = useState('100');
  const { copy, copied } = useCopy();
  const modes = previewModes(surface);
  const [mode, setMode] = useState(initialMode && modes.includes(initialMode) ? initialMode : modes[0]);

  return (
    <div id={id} data-view={view} className="group/block-view-wrapper flex min-w-0 scroll-mt-24 flex-col-reverse items-stretch gap-4 overflow-hidden md:flex-col">
      <div className="flex w-full items-center gap-2 pl-2 md:pr-6">
        <Tabs value={view} onValueChange={setView} className="hidden lg:flex">
          <TabsList className="h-7 items-center rounded-md p-0 px-[calc(--spacing(1)_-_2px)] py-(--spacing(1))">
            <TabsTrigger value="vista" className="h-[1.45rem] rounded-sm px-2 text-xs">Vista</TabsTrigger>
            <TabsTrigger value="codigo" className="h-[1.45rem] rounded-sm px-2 text-xs">Código</TabsTrigger>
          </TabsList>
        </Tabs>
        <Separator orientation="vertical" className="mx-2 hidden h-4! lg:flex" />
        <Link href={href} className="flex-1 text-center text-sm font-medium underline-offset-2 hover:underline md:flex-auto md:text-left">{title}</Link>
        <div className="ml-auto flex items-center gap-2">
          <div className="hidden h-8 items-center gap-1.5 rounded-md border p-[2px] shadow-none lg:flex">
            <ToggleGroup type="single" value={width} onValueChange={(value) => value && setWidth(value)} className="gap-1 *:data-[slot=toggle-group-item]:size-6! *:data-[slot=toggle-group-item]:rounded-sm!">
              <ToggleGroupItem value="100" title="Escritorio"><MonitorIcon /></ToggleGroupItem>
              <ToggleGroupItem value="60" title="Tablet"><TabletIcon /></ToggleGroupItem>
              <ToggleGroupItem value="30" title="Móvil"><SmartphoneIcon /></ToggleGroupItem>
            </ToggleGroup>
          </div>
          {modes.length > 1 && (
            <>
              <Separator orientation="vertical" className="mx-1 hidden h-4! lg:flex" />
              <PreviewModeToggle modes={modes} value={mode} onChange={setMode} />
            </>
          )}
          <Separator orientation="vertical" className="mx-1 hidden h-4! lg:flex" />
          <Button
            variant="outline"
            size="sm"
            className="w-fit gap-1 px-2 shadow-none"
            title="Copia el prompt para que un agente use este bloque"
            onClick={() => copy(`Usa el bloque «${title}» del sistema de diseño. Lee ${sitePath(md)} antes de componerlo y respeta sus reglas.`, 'Prompt copiado')}
          >
            {copied ? <CheckIcon /> : <FileTextIcon />}
            <span className="font-mono text-xs">{md.replace(/^\/[^/]+\//, '')}</span>
          </Button>
        </div>
      </div>

      <div className="relative grid w-full gap-4 group-data-[view=codigo]/block-view-wrapper:hidden">
        <div className="absolute inset-0 [background-image:radial-gradient(#d4d4d4_1px,transparent_1px)] [background-size:20px_20px] dark:[background-image:radial-gradient(#404040_1px,transparent_1px)]" />
        <div className="relative z-10 transition-[width] duration-300" style={{ width: `${width}%`, minWidth: 320 }}>
          <div className="overflow-hidden rounded-lg border bg-background md:rounded-xl">
            <Preview html={html} surface={surface} background={background} align="start" minHeight={240} vista={vista} mode={mode} />
          </div>
        </div>
      </div>

      <div className="hidden overflow-hidden rounded-xl border bg-code text-sm text-code-foreground group-data-[view=codigo]/block-view-wrapper:block">
        <div className="relative">
          <CopyButton value={code} />
          <div className="no-scrollbar max-h-[600px] overflow-auto px-4 py-3.5 pr-12 [&_pre]:bg-transparent!">
            {codeHtml ? <div dangerouslySetInnerHTML={{ __html: codeHtml }} /> : <pre><code>{code}</code></pre>}
          </div>
        </div>
      </div>
    </div>
  );
}
