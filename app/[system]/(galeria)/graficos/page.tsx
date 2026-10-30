import { GalleryPage } from '@/components/Gallery';
import { SECTIONS } from '@/lib/core.mjs';

const section = SECTIONS.find((s) => s.id === 'graficos')!;
export const metadata = { title: section.label, description: section.descripcion };

export default async function Graficos({ params }: { params: Promise<{ system: string }> }) {
  const { system } = await params;
  return <GalleryPage systemId={system} sectionId="graficos" />;
}
