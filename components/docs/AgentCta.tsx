'use client';

import { agentContext } from '@/lib/agent';
import type { Nav } from '@/lib/nav';
import { useCopy } from '@/lib/use-copy';
import { Button } from '@/components/ui/button';
import { useT } from '@/components/site/I18nProvider';

/** Tarjeta de la columna derecha (en shadcn, «Open in v0»): el contexto del sistema listo para un agente. */
export function AgentCta({ nav }: { nav: Pick<Nav, 'system' | 'lang' | 'prefix'> }) {
  const { copy } = useCopy();
  const t = useT();
  return (
    <div className="group relative flex flex-col gap-2 rounded-lg border-none bg-surface p-6 text-sm text-surface-foreground">
      <div className="text-base leading-tight font-semibold text-balance">{t.docs.agentCtaTitle}</div>
      <div className="text-muted-foreground">{t.docs.agentCtaText}</div>
      <Button size="sm" className="mt-2 w-fit" onClick={() => void copy(agentContext(nav.system, window.location.origin, nav.lang, nav.prefix), t.search.contextCopied)}>
        {t.docs.copyContext}
      </Button>
    </div>
  );
}
