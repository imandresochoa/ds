'use client';

import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { useT } from '@/components/site/I18nProvider';

/** Copia al portapapeles y marca «copiado» durante un momento. Con `message`, además avisa con un toast. */
export function useCopy(timeout = 2000) {
  const t = useT();
  const [copied, setCopied] = useState(false);
  const copy = useCallback(async (value: string, message?: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      if (message) toast.success(message);
      window.setTimeout(() => setCopied(false), timeout);
    } catch {
      toast.error(t.code.copyFailed);
    }
  }, [timeout, t]);
  return { copy, copied };
}
