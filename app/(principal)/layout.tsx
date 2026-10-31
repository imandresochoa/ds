import { RootHtml, rootMetadata } from '@/components/site/RootHtml';
import { siteLanguage } from '@/lib/core.mjs';
import '../globals.css';

export const metadata = rootMetadata(siteLanguage());

/** Layout raíz del idioma principal: las URL de siempre. */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <RootHtml lang={siteLanguage()}>{children}</RootHtml>;
}
