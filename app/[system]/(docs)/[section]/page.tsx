import { notFound } from 'next/navigation';
import { DocsArticle } from '@/components/docs/DocsArticle';
import { PageList } from '@/components/docs/PageList';
import { SECTIONS, loadSystem } from '@/lib/core.mjs';
import { buildNav } from '@/lib/nav';

/** Bloques, Gráficos e Iniciativas tienen su propia página ancha (galería); aquí, el resto de secciones. */
const DOCS_SECTIONS = SECTIONS.filter((s) => !s.galeria && s.id !== 'iniciativas');

export const dynamicParams = false;
export const generateStaticParams = ({ params }: { params: { system: string } }) =>
  DOCS_SECTIONS.filter((s) => s.id !== 'metodologia' || loadSystem(params.system).metodologia).map((s) => ({ section: s.id }));

export async function generateMetadata({ params }: { params: Promise<{ system: string; section: string }> }) {
  const { section } = await params;
  const info = SECTIONS.find((s) => s.id === section);
  return { title: info?.label, description: info?.descripcion };
}

/** Índice de una sección con la forma del índice de componentes de shadcn: «Nuevos» arriba y todas las fichas. */
export default async function SectionPage({ params }: { params: Promise<{ system: string; section: string }> }) {
  const { system: id, section: sectionId } = await params;
  const section = DOCS_SECTIONS.find((s) => s.id === sectionId);
  if (!section) notFound();
  const nav = buildNav(id);
  const items = nav.groups.find((g) => g.id === section.id)?.items ?? [];
  const fresh = items.filter((i) => i.nuevo);
  const groups = section.agrupar === 'grupo' ? [...new Set(items.map((i) => i.grupo ?? ''))] : [];

  return (
    <DocsArticle nav={nav} href={`/${id}/${section.id}`} title={section.label} description={section.descripcion} md={null}>
      <div className="ds-prose">
        {!items.length && <p className="text-muted-foreground">Todavía no hay fichas en esta sección. Usa «Nuevo › {section.accion.label}» para pedírsela a tu agente.</p>}
        {fresh.length > 0 && (
          <>
            <h2 id="nuevos">Nuevos</h2>
            <PageList items={fresh} />
          </>
        )}
        {groups.length > 1 ? (
          groups.map((g) => (
            <div key={g}>
              <h2 id={g}>{g}</h2>
              <PageList items={items.filter((i) => i.grupo === g)} />
            </div>
          ))
        ) : (
          items.length > 0 && (
            <>
              {fresh.length > 0 && <h2 id="todos">Todos</h2>}
              <PageList items={items} />
            </>
          )
        )}
      </div>
    </DocsArticle>
  );
}
