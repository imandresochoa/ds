'use client';

import { useCallback, useState } from 'react';
import { toast } from 'sonner';

/** Copia al portapapeles y marca «copiado» durante un momento. Con `message`, además avisa con un toast. */
export function useCopy(timeout = 2000) {
  const [copied, setCopied] = useState(false);
  const copy = useCallback(async (value: string, message?: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      if (message) toast.success(message);
      window.setTimeout(() => setCopied(false), timeout);
    } catch {
      toast.error('No se pudo copiar');
    }
  }, [timeout]);
  return { copy, copied };
}
