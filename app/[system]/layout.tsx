import { listSystems } from '@/lib/core.mjs';

export const dynamicParams = false;
export const generateStaticParams = () => listSystems().map((s) => ({ system: s.id }));

// La portada (/<sistema>) va sin shell; el resto de páginas lo pone (shell)/layout.tsx.
export default function SystemLayout({ children }: { children: React.ReactNode }) {
  return children;
}
