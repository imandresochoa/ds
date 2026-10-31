import { messages } from '@/lib/i18n';
import type { Nav, System } from '@/lib/nav';
import { sitePath } from '@/lib/site';
import { CodeBlock } from '../CodeBlock';

/** Qué publica el sistema para agentes y por dónde empezar. El registry está solo en el idioma principal. */
export function AgentsPage({ system, nav }: { system: System; nav: Nav }) {
  const t = messages(nav.lang).agents;
  const p = nav.prefix;
  const resources = [
    { href: sitePath(`${p}/${system.id}/design.md`), title: 'design.md', text: t.resources.design },
    { href: sitePath(`${p}/llms.txt`), title: 'llms.txt', text: t.resources.llms },
    { href: sitePath(`/${system.id}/registry.json`), title: 'registry.json', text: t.resources.registry },
    { href: sitePath(`${p}/${system.id}/llms-full.txt`), title: 'llms-full.txt', text: t.resources.llmsFull },
  ];
  return (
    <div className="ds-prose">
      <p>{t.intro}</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {resources.map((r) => (
          <a key={r.href} href={r.href} data-slot="card" className="flex flex-col gap-1 rounded-xl border p-4 text-sm transition-colors hover:bg-accent/50">
            <span className="font-mono font-medium">{r.title}</span>
            <span className="text-muted-foreground">{r.text}</span>
          </a>
        ))}
      </div>
      <h2 id="orden-de-lectura">{t.readingOrder}</h2>
      <ol>
        {t.order.map((item, i) => <li key={i}>{item}</li>)}
      </ol>
      <h2 id="prompt-para-empezar">{t.startPrompt}</h2>
      <CodeBlock lang="prompt" code={t.context(system.nombre, sitePath(`${p}/${system.id}/design.md`), sitePath(`${p}/llms.txt`)).replaceAll('\n', ' ')} />
    </div>
  );
}
