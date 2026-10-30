import type { System } from '@/lib/nav';
import { sitePath } from '@/lib/site';
import { CodeBlock } from '../CodeBlock';

/** Qué publica el sistema para agentes y por dónde empezar. */
export function AgentsPage({ system }: { system: System }) {
  const resources = [
    { href: sitePath(`/${system.id}/design.md`), title: 'design.md', text: 'Reglas, API de clases, tokens y estados en un solo archivo. Es el punto de entrada.' },
    { href: sitePath('/llms.txt'), title: 'llms.txt', text: 'Índice de todas las fichas en Markdown, de todos los sistemas.' },
    { href: sitePath(`/${system.id}/registry.json`), title: 'registry.json', text: 'Datos estructurados: estado, plataformas, fuentes y huellas de cada ficha.' },
    { href: sitePath(`/${system.id}/llms-full.txt`), title: 'llms-full.txt', text: 'Todas las fichas del sistema en un solo archivo.' },
  ];
  return (
    <div className="ds-prose">
      <p>Una persona y un agente leen lo mismo: cada página tiene su versión <code>.md</code> en la misma ruta, y «Copiar página» copia ese Markdown.</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {resources.map((r) => (
          <a key={r.href} href={r.href} data-slot="card" className="flex flex-col gap-1 rounded-xl border p-4 text-sm transition-colors hover:bg-accent/50">
            <span className="font-mono font-medium">{r.title}</span>
            <span className="text-muted-foreground">{r.text}</span>
          </a>
        ))}
      </div>
      <h2 id="orden-de-lectura">Orden de lectura</h2>
      <ol>
        <li><code>design.md</code> del sistema.</li>
        <li>La ficha concreta (<code>.md</code>).</li>
        <li>Si va a escribir texto, la guía de voz enlazada desde Fundamentos.</li>
      </ol>
      <h2 id="prompt-para-empezar">Prompt para empezar</h2>
      <CodeBlock
        lang="prompt"
        code={`Trabaja con el sistema de diseño ${system.nombre}. Lee primero ${sitePath(`/${system.id}/design.md`)} y ${sitePath('/llms.txt')}. Usa solo lo que esté «En producción» salvo que te pida lo contrario. Si algo no está documentado, no lo inventes: dilo.`}
      />
    </div>
  );
}
