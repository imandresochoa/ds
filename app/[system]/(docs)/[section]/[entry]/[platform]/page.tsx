import { notFound } from 'next/navigation';
import { EntryPage } from '@/components/EntryPage';
import { loadEntries, loadSystem, PLATFORM_SECTIONS } from '@/lib/core.mjs';
import { buildNav } from '@/lib/nav';

type Params = { system: string; section: string; entry: string; platform: string };

export const dynamicParams = false;
export function generateStaticParams({ params }: { params: { system: string } }) {
  const list = loadEntries(loadSystem(params.system))
    .filter((e) => PLATFORM_SECTIONS.includes(e.section))
    .flatMap((e) => ['ios', 'android'].map((platform) => ({ section: e.section, entry: e.slug, platform })));
  // Con output: 'export', Next no acepta una lista vacía (un sistema sin componentes ni patrones):
  // se genera una ruta de relleno que da 404.
  return list.length ? list : [{ section: '_', entry: '_', platform: '_' }];
}

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const p = await params;
  const item = loadEntries(loadSystem(p.system)).find((e) => e.section === p.section && e.slug === p.entry);
  return { title: item ? `${item.titulo} · ${p.platform === 'ios' ? 'iOS' : 'Android'}` : undefined };
}

export default async function PlatformPage({ params }: { params: Promise<Params> }) {
  const p = await params;
  const system = loadSystem(p.system);
  const item = loadEntries(system).find((e) => e.section === p.section && e.slug === p.entry);
  if (!item || !['ios', 'android'].includes(p.platform)) notFound();
  return <EntryPage system={system} entry={item} platform={p.platform} nav={buildNav(p.system)} />;
}
