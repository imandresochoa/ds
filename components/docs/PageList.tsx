import Link from 'next/link';
import { messages } from '@/lib/i18n';
import type { NavItem } from '@/lib/nav';
import { StatusDot } from './StatusBadge';

/** Rejilla de enlaces del índice de componentes de shadcn, con el punto de «Nuevo» y el de estado. */
export function PageList({ items, lang = 'es' }: { items: NavItem[]; lang?: string }) {
  if (!items.length) return null;
  return (
    <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-x-8 lg:gap-x-16 lg:gap-y-6 xl:gap-x-20">
      {items.map((item) => (
        <Link key={item.href} href={item.href} data-slot="link" className="inline-flex items-center gap-2 text-lg font-medium underline-offset-4 hover:underline md:text-base">
          {item.titulo}
          {item.nuevo && (
            <>
              <span className="sr-only">{messages(lang).header.isNew}</span>
              <span aria-hidden="true" className="flex size-2 rounded-full bg-nuevo" />
            </>
          )}
          {!item.nuevo && item.estado !== 'produccion' && item.seccion !== 'metodologia' && <StatusDot item={item} className="size-1.5" />}
        </Link>
      ))}
    </div>
  );
}
