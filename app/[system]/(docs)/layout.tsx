import { DocsSidebar } from '@/components/docs/DocsSidebar';
import { buildNav } from '@/lib/nav';

/** Docs a tres columnas: barra lateral, contenido y «En esta página» (lo pone cada página). */
export default async function DocsLayout({ children, params }: { children: React.ReactNode; params: Promise<{ system: string }> }) {
  const { system } = await params;
  return (
    <div className="container-wrapper flex flex-1 flex-col px-2">
      <div
        className="min-h-min flex-1 items-start px-0 [--top-spacing:0] lg:grid lg:grid-cols-[var(--sidebar-width)_minmax(0,1fr)] lg:[--top-spacing:calc(var(--spacing)*4)]"
        style={{ '--sidebar-width': 'calc(var(--spacing) * 72)' } as React.CSSProperties}
      >
        <DocsSidebar nav={buildNav(system)} />
        <div className="h-full w-full">{children}</div>
      </div>
    </div>
  );
}
