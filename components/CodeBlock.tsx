'use client';

import { Check, Copy } from 'lucide-react';
import { useState } from 'react';
import { STROKE } from './icons';

/** Bloque de código con botón de copiar. */
export function CodeBlock({ code, lang }: { code: string; lang?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className={`ds-code${lang === 'prompt' ? ' is-wrap' : ''}`}>
      <div className="ds-code-tools">
        {lang && <span className="ds-code-lang">{lang}</span>}
        <button
          type="button"
          className="ds-icon-btn"
          aria-label="Copiar código"
          onClick={async () => {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1500);
          }}
        >
          {copied ? <Check size={15} strokeWidth={STROKE} /> : <Copy size={15} strokeWidth={STROKE} />}
        </button>
      </div>
      <pre><code>{code}</code></pre>
    </div>
  );
}
