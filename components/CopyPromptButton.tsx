'use client';

import { CheckIcon, SparklesIcon } from 'lucide-react';
import { useCopy } from '@/lib/use-copy';
import { Button } from '@/components/ui/button';
import { useT } from '@/components/site/I18nProvider';

/** Botón que copia el prompt de una acción («Proponer bloque», «Abrir iniciativa»…) para pegarlo en el agente. */
export function CopyPromptButton({ prompt, label, variant = 'ghost' }: { prompt: string; label: string; variant?: 'ghost' | 'outline' | 'default' }) {
  const { copy, copied } = useCopy();
  const t = useT();
  return (
    <Button size="sm" variant={variant} onClick={() => copy(prompt, t.code.promptCopied)}>
      {copied ? <CheckIcon /> : <SparklesIcon />}
      {label}
    </Button>
  );
}
