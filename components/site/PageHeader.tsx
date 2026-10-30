import { ArrowRightIcon } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

/** Cabecera de las páginas anchas de ui.shadcn.com (home, Blocks, Charts): aviso, titular, descripción y acciones. */
export function PageHeader({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <section className={cn('border-grid', className)}>
      <div className="container-wrapper">
        <div className="container flex flex-col items-center gap-2 px-6 py-8 text-center md:py-16 lg:py-20 xl:gap-4">{children}</div>
      </div>
    </section>
  );
}

export function PageHeaderHeading({ className, children }: { className?: string; children: React.ReactNode }) {
  return <h1 className={cn('leading-tighter max-w-3xl text-3xl font-semibold tracking-tight text-balance text-primary lg:leading-[1.1] lg:font-semibold xl:text-5xl xl:tracking-tighter', className)}>{children}</h1>;
}

export function PageHeaderDescription({ className, children }: { className?: string; children: React.ReactNode }) {
  return <p className={cn('max-w-4xl text-base text-balance text-foreground sm:text-lg', className)}>{children}</p>;
}

export function PageActions({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('flex w-full items-center justify-center gap-2 pt-2 **:data-[slot=button]:shadow-none', className)}>{children}</div>;
}

/** Aviso sobre el titular: lo último que ha llegado al sistema. */
export function Announcement({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Badge asChild variant="secondary" className="rounded-full bg-muted">
      <Link href={href}>
        <span className="flex size-2 rounded-full bg-nuevo" />
        {children}
        <ArrowRightIcon />
      </Link>
    </Badge>
  );
}

/** Barra bajo la cabecera con la navegación de la galería (categorías de Blocks y Charts). */
export function PageNav({ id, className, children }: { id?: string; className?: string; children: React.ReactNode }) {
  return (
    <div id={id} className={cn('container-wrapper scroll-mt-24', className)}>
      <div className="container flex items-center justify-between gap-4 py-4">{children}</div>
    </div>
  );
}

/** Enlaces de categoría de la galería, como la navegación de Blocks y Charts. */
export function CategoryNav({ items }: { items: { href: string; label: string; active?: boolean }[] }) {
  return (
    <div className="no-scrollbar relative flex items-center overflow-x-auto">
      {items.map((item) => (
        <Link key={item.href} href={item.href} data-active={item.active} className="flex h-7 shrink-0 items-center justify-center px-4 text-center text-base font-medium text-muted-foreground transition-colors first:pl-0 hover:text-primary data-[active=true]:text-primary">
          {item.label}
        </Link>
      ))}
    </div>
  );
}
