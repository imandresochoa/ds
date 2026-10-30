import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SectionIndex } from '@/components/SectionIndex';
import { CONTENT_SECTIONS, SECTIONS, loadDocs, loadEntries, loadSystem } from '@/lib/core.mjs';
import { buildNav } from '@/lib/nav';

export const dynamicParams = false;
export const generateStaticParams = ({ params }: { params: { system: string } }) =>
  SECTIONS.filter((s) => s.id !== 'inicio' && (s.id !== 'metodologia' || loadSystem(params.system).metodologia)).map((s) => ({ section: s.id }));

export async function generateMetadata({ params }: { params: Promise<{ system: string; section: string }> }) {
  const { section } = await params;
  return { title: SECTIONS.find((s) => s.id === section)?.label };
}

export default async function SectionPage({ params }: { params: Promise<{ system: string; section: string }> }) {
  const { system: id, section: sectionId } = await params;
  const section = SECTIONS.find((s) => s.id === sectionId);
  if (!section) notFound();

  if (section.id === 'metodologia') {
    const docs = loadDocs();
    return (
      <div className="ds-page">
        <h1 className="ds-title">{section.label}</h1>
        <p className="ds-summary">{section.descripcion}</p>
        <ul className="ds-list ds-content" style={{ marginTop: 24 }}>
          {docs.map((doc) => (
            <li key={doc.slug} className="ds-list-item">
              <Link href={`/${id}/metodologia/${doc.slug}`}><span><strong>{doc.titulo}</strong><p>{doc.resumen}</p></span></Link>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  const nav = buildNav(id);
  const navSection = nav.sections.find((s) => s.id === section.id)!;
  const platforms: Record<string, Record<string, string>> = {};
  if (['componentes', 'patrones'].includes(section.id)) {
    for (const entry of loadEntries(loadSystem(id)).filter((e) => e.section === section.id)) {
      platforms[entry.href] = Object.fromEntries(Object.entries(entry.platforms).map(([p, info]) => [p, info.estado]));
    }
  }
  return (
    <div className="ds-page">
      <h1 className="ds-title">{section.label}</h1>
      <p className="ds-summary">{section.descripcion}</p>
      {CONTENT_SECTIONS.some((s) => s.id === section.id) && <SectionIndex groups={navSection.groups} platforms={platforms} />}
    </div>
  );
}
