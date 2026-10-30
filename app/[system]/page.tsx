import { Landing, type LandingTile } from '@/components/Landing';
import { SECTIONS, loadDocs, loadEntries, loadSystem } from '@/lib/core.mjs';

export async function generateMetadata({ params }: { params: Promise<{ system: string }> }) {
  const { system } = await params;
  return { title: loadSystem(system).nombre };
}

// Portada: lo primero que se ve de un sistema, sin shell. Una caja por sección alrededor de la casilla del sistema.
export default async function Portada({ params }: { params: Promise<{ system: string }> }) {
  const { system: id } = await params;
  const system = loadSystem(id);
  const entries = loadEntries(system);
  const sections = SECTIONS.filter((s) => s.id !== 'inicio' && (s.id !== 'metodologia' || system.metodologia));

  const tiles: LandingTile[] = sections.map((section) => {
    const guides = section.id === 'metodologia';
    const total = guides ? loadDocs().length : entries.filter((e) => e.section === section.id).length;
    const [one, many] = guides ? ['guía', 'guías'] : ['ficha', 'fichas'];
    return {
      id: section.id,
      label: section.label,
      descripcion: section.descripcion ?? '',
      href: `/${id}/${section.id}`,
      cuenta: total ? `${total} ${total === 1 ? one : many}` : `Sin ${many}`,
    };
  });

  return <Landing system={{ nombre: system.nombre, iniciales: system.iniciales, color: system.color }} inicio={`/${id}/inicio`} tiles={tiles} />;
}
