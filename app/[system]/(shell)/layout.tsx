import { Shell } from '@/components/Shell';
import { buildNav } from '@/lib/nav';

export default async function ShellLayout({ children, params }: { children: React.ReactNode; params: Promise<{ system: string }> }) {
  const { system } = await params;
  return <Shell nav={buildNav(system)}>{children}</Shell>;
}
