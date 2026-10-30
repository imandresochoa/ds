import { notFound } from 'next/navigation';
import { EntryPage } from '@/components/EntryPage';
import { Markdown } from '@/components/Markdown';
import { loadDocs, loadEntries, loadSystem, SECTIONS } from '@/lib/core.mjs';
import { sitePath } from '@/lib/site';

type Params = { system: string; section: string; entry: string };

export const dynamicParams = false;
// Los parámetros llegan solo desde los layouts (aquí, `system`): se generan sección y ficha juntas.
export function generateStaticParams({ params }: { params: { system: string } }) {
  const system = loadSystem(params.system);
  const docs = system.metodologia ? loadDocs().map((d) => ({ section: 'metodologia', entry: d.slug })) : [];
  const list = [...docs, ...loadEntries(system).map((e) => ({ section: e.section, entry: e.slug }))];
  // Con output: 'export', Next no acepta una lista vacía (un sistema sin fichas): se genera una ruta de relleno que da 404.
  return list.length ? list : [{ section: '_', entry: '_' }];
}

function find({ system, section, entry }: Params) {
  if (section === 'metodologia') return { doc: loadDocs().find((d) => d.slug === entry) ?? null, item: null };
  return { doc: null, item: loadEntries(loadSystem(system)).find((e) => e.section === section && e.slug === entry) ?? null };
}

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const p = await params;
  const { doc, item } = find(p);
  const md = doc ? sitePath(`/metodologia/${doc.slug}.md`) : item ? sitePath(`${item.href}.md`) : undefined;
  return { title: doc?.titulo ?? item?.titulo, description: doc?.resumen ?? item?.resumen, alternates: md ? { types: { 'text/markdown': md } } : undefined };
}

export default async function Page({ params }: { params: Promise<Params> }) {
  const p = await params;
  const { doc, item } = find(p);
  if (doc) {
    return (
      <article className="ds-page">
        <h1 className="ds-title">{doc.titulo}</h1>
        {doc.resumen && <p className="ds-summary">{doc.resumen}</p>}
        <div className="ds-content" style={{ marginTop: 28 }}><Markdown source={doc.body} /></div>
      </article>
    );
  }
  if (!item || !SECTIONS.some((s) => s.id === p.section)) notFound();
  return <EntryPage system={loadSystem(p.system)} entry={item} platform="web" />;
}
