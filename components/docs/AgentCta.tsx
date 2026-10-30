'use client';

import { agentContext } from '@/lib/agent';
import type { SystemSummary } from '@/lib/nav';
import { useCopy } from '@/lib/use-copy';
import { Button } from '@/components/ui/button';

/** Tarjeta de la columna derecha (en shadcn, «Open in v0»): el contexto del sistema listo para un agente. */
export function AgentCta({ system }: { system: Pick<SystemSummary, 'id' | 'nombre'> }) {
  const { copy } = useCopy();
  return (
    <div className="group relative flex flex-col gap-2 rounded-lg border-none bg-surface p-6 text-sm text-surface-foreground">
      <div className="text-base leading-tight font-semibold text-balance">¿Trabajas con un agente?</div>
      <div className="text-muted-foreground">Copia el contexto del sistema: le dice qué leer primero y que use solo lo que está en producción.</div>
      <Button size="sm" className="mt-2 w-fit" onClick={() => void copy(agentContext(system, window.location.origin), 'Contexto para agentes copiado')}>
        Copiar contexto
      </Button>
    </div>
  );
}
