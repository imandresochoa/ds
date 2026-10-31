import { RootHtml, rootMetadata } from '@/components/site/RootHtml';
import '../globals.css';

export const metadata = rootMetadata('en');

/** Layout raíz de la traducción al inglés: todo lo que cuelga de /en. */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <RootHtml lang="en" llms="/en/llms.txt">{children}</RootHtml>;
}
