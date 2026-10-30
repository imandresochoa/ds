import Link from 'next/link';
import { SystemMark } from '@/components/site/icons';
import { listSystems } from '@/lib/core.mjs';
import { sitePath } from '@/lib/site';

// Lista de sistemas. Con un solo sistema (lo normal en un repo de sistema), redirige a su home.
export default function Home() {
  const systems = listSystems();
  return (
    <main className="mx-auto flex min-h-svh w-full max-w-xl flex-col justify-center gap-6 px-6 py-16">
      {systems.length === 1 && <meta httpEquiv="refresh" content={`0;url=${sitePath(`/${systems[0].id}`)}`} />}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">Sistemas de diseño</h1>
        <p className="text-muted-foreground">
          Elige un sistema. Los agentes empiezan por <a href={sitePath('/llms.txt')} className="font-medium text-foreground underline underline-offset-4">{sitePath('/llms.txt')}</a>.
        </p>
      </div>
      <div className="flex flex-col gap-3">
        {systems.map((s) => (
          <Link key={s.id} href={`/${s.id}`} data-slot="card" className="flex items-center gap-4 rounded-xl border p-4 transition-colors hover:bg-accent/50">
            <SystemMark system={s} className="size-10 rounded-lg text-sm" />
            <span className="flex min-w-0 flex-col">
              <span className="font-medium">{s.nombre}</span>
              {s.descripcion && <span className="line-clamp-2 text-sm text-muted-foreground">{s.descripcion}</span>}
            </span>
          </Link>
        ))}
      </div>
    </main>
  );
}
