import Link from 'next/link';
import type { PreviewSurface } from '@/components/Preview';
import { STATUSES } from '@/lib/meta.mjs';
import { surfacesAttr } from '@/lib/nav';
import { cn } from '@/lib/utils';
import { PreviewThumb } from './PreviewThumb';
import { StatusDot } from './StatusBadge';

export type CardItem = {
  href: string;
  titulo: string;
  resumen: string;
  estado: string;
  sync: string | null;
  nuevo: boolean;
  superficies: string[];
  /** Primer ejemplo de la ficha. Sin él, la tarjeta enseña el resumen. */
  preview: { html: string; surface: PreviewSurface; background?: string; mode?: string } | null;
  /** Línea de datos bajo el resumen de una tarjeta de texto (las piezas de una iniciativa, su fecha…). */
  meta?: string;
  /** Sin punto de estado (las páginas de la metodología no tienen estado). */
  sinEstado?: boolean;
};

/**
 * Forma de la miniatura según lo que enseña la sección. Un componente se ve a escala fija y centrado; un bloque,
 * con el ancho de una pantalla de escritorio y desde arriba; un gráfico, con el ancho de una tarjeta de panel.
 */
export const CARD_KINDS = {
  componente: { grid: 'sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4', frame: 'h-40', thumb: { scale: 0.8 } },
  bloque: { grid: 'sm:grid-cols-2 2xl:grid-cols-3', frame: 'h-56', thumb: { viewport: 1280, align: 'start', padding: 0 } },
  grafico: { grid: 'sm:grid-cols-2 xl:grid-cols-3', frame: 'h-48', thumb: { viewport: 560 } },
  texto: { grid: 'sm:grid-cols-2 lg:grid-cols-3', frame: 'min-h-32', thumb: {} },
} as const;
export type CardKind = keyof typeof CARD_KINDS;

/** Tarjeta de una ficha en un índice: su primer ejemplo en vivo, reducido, con el nombre y el estado debajo. */
export function EntryCard({ item, kind }: { item: CardItem; kind: CardKind }) {
  const { frame, thumb } = CARD_KINDS[kind];
  const status = !item.sinEstado && item.estado !== 'produccion' ? STATUSES[item.estado as keyof typeof STATUSES]?.label ?? item.estado : null;
  return (
    <Link
      href={item.href}
      data-slot="entry-card"
      data-superficies={surfacesAttr([item.superficies])}
      title={item.preview ? item.resumen : undefined}
      className="group flex min-w-0 flex-col gap-2.5 rounded-xl outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
    >
      <div className={cn('relative overflow-hidden rounded-xl border bg-muted/30 transition-colors group-hover:border-foreground/25', frame, !item.preview && 'flex grow flex-col gap-3 p-5')}>
        {item.preview ? (
          <PreviewThumb html={item.preview.html} surface={item.preview.surface} background={item.preview.background} mode={item.preview.mode} {...thumb} />
        ) : (
          <>
            <p className="line-clamp-4 text-sm text-muted-foreground">{item.resumen}</p>
            {item.meta && <p className="mt-auto text-xs text-muted-foreground">{item.meta}</p>}
          </>
        )}
      </div>
      <div className="flex min-w-0 items-center gap-2 px-0.5 text-sm font-medium">
        <span className="truncate underline-offset-4 group-hover:underline">{item.titulo}</span>
        {status && (
          <>
            <StatusDot item={{ estado: item.estado, sync: item.sync }} className="size-1.5" />
            <span className="sr-only">{status}</span>
          </>
        )}
        {item.nuevo && (
          <span className="ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-full bg-muted px-2 py-0.5 text-xs font-normal text-muted-foreground">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-nuevo" />
            Nuevo
          </span>
        )}
      </div>
    </Link>
  );
}

/** Rejilla de tarjetas de un índice. Se oculta entera si ninguna ficha es de la superficie elegida. */
export function EntryGrid({ items, kind, className }: { items: CardItem[]; kind: CardKind; className?: string }) {
  if (!items.length) return null;
  return (
    <div data-superficies={surfacesAttr(items.map((i) => i.superficies))} className={cn('grid gap-x-4 gap-y-6', CARD_KINDS[kind].grid, className)}>
      {items.map((item) => <EntryCard key={item.href} item={item} kind={kind} />)}
    </div>
  );
}
