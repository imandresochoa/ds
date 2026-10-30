import type { Nav } from '@/lib/nav';
import { sitePath } from '@/lib/site';

/** Pie de ui.shadcn.com: una línea centrada. En las páginas de Docs no se muestra. */
export function SiteFooter({ nav }: { nav: Nav }) {
  const link = 'font-medium underline underline-offset-4';
  return (
    <footer className="group-has-[.section-soft]/body:bg-surface/40 group-has-[[data-slot=docs]]/body:hidden dark:bg-transparent dark:group-has-[.section-soft]/body:bg-surface/40">
      <div className="container-wrapper px-4 xl:px-6">
        <div className="flex h-(--footer-height) items-center justify-between">
          <div className="w-full px-1 text-center text-xs leading-loose text-muted-foreground sm:text-sm">
            Sistema de diseño de {nav.system.nombre}
            {nav.system.web && (
              <>
                , enlazado con{' '}
                <a href={nav.system.web} target="_blank" rel="noreferrer" className={link}>producción</a>
              </>
            )}
            . Para agentes:{' '}
            <a href={sitePath(`/${nav.system.id}/design.md`)} className={link}>design.md</a> y{' '}
            <a href={sitePath('/llms.txt')} className={link}>llms.txt</a>.
          </div>
        </div>
      </div>
    </footer>
  );
}
