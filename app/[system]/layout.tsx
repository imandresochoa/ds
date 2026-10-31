import { SiteFooter } from '@/components/site/SiteFooter';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SurfaceProvider } from '@/components/site/SurfaceFilter';
import { listSystems } from '@/lib/core.mjs';
import { buildNav } from '@/lib/nav';

export const dynamicParams = false;
export const generateStaticParams = () => listSystems().map((s) => ({ system: s.id }));

/** Estructura de ui.shadcn.com: cabecera fija, contenido y pie. */
export default async function SystemLayout({ children, params }: { children: React.ReactNode; params: Promise<{ system: string }> }) {
  const { system } = await params;
  const nav = buildNav(system);
  return (
    <SurfaceProvider nav={nav}>
      <div data-slot="layout" className="relative z-10 flex min-h-svh flex-col bg-background">
        <SiteHeader nav={nav} />
        <main className="flex min-h-0 flex-1 flex-col">{children}</main>
        <SiteFooter nav={nav} />
      </div>
    </SurfaceProvider>
  );
}
