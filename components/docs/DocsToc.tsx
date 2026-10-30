'use client';

import { useEffect, useMemo, useState } from 'react';
import type { TocItem } from '@/lib/markdown';
import { cn } from '@/lib/utils';

function useActiveItem(ids: string[]) {
  const [active, setActive] = useState<string | null>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) setActive(entry.target.id);
      },
      { rootMargin: '0% 0% -80% 0%' },
    );
    const elements = ids.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => Boolean(el));
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [ids]);
  return active;
}

/** «En esta página»: los h2 y h3 de la página, con el apartado visible resaltado. */
export function DocsToc({ toc, className }: { toc: TocItem[]; className?: string }) {
  const ids = useMemo(() => toc.map((t) => t.id), [toc]);
  const active = useActiveItem(ids);
  if (!toc.length) return null;
  return (
    <div className={cn('flex flex-col gap-2 p-4 pt-0 text-sm', className)}>
      <p className="h-6 bg-background text-xs font-medium text-muted-foreground">En esta página</p>
      {toc.map((item) => (
        <a
          key={item.id}
          href={`#${item.id}`}
          data-active={item.id === active}
          data-depth={item.depth}
          className="text-[0.8rem] text-muted-foreground no-underline transition-colors hover:text-foreground data-[active=true]:font-medium data-[active=true]:text-foreground data-[depth=3]:pl-4"
        >
          {item.title}
        </a>
      ))}
    </div>
  );
}
