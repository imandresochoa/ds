import Link from 'next/link';
import { listSystems } from '@/lib/core.mjs';
import { sitePath } from '@/lib/site';

// Lista de sistemas. Con un solo sistema (lo normal en un repo de sistema), redirige a su portada.
export default function Home() {
  const systems = listSystems();
  return (
    <main className="ds-page" style={{ maxWidth: 640, margin: '10vh auto' }}>
      {systems.length === 1 && <meta httpEquiv="refresh" content={`0;url=${sitePath(`/${systems[0].id}`)}`} />}
      <h1 className="ds-title">Sistemas de diseño</h1>
      <p className="ds-summary">Elige un sistema. Los agentes empiezan por <a href={sitePath('/llms.txt')}>{sitePath('/llms.txt')}</a>.</p>
      <ul className="ds-list" style={{ marginTop: 24 }}>
        {systems.map((s) => (
          <li key={s.id} className="ds-list-item">
            <Link href={`/${s.id}`}>
              <span><strong>{s.nombre}</strong><p>{s.descripcion}</p></span>
              <span className="ds-avatar" style={{ background: s.color }}>{s.iniciales}</span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
