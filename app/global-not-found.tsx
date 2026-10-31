import { RootHtml } from '@/components/site/RootHtml';
import { siteLanguage } from '@/lib/core.mjs';
import { messages } from '@/lib/i18n';
import './globals.css';

// Con dos layouts raíz, (principal) y (en), la página 404 necesita el suyo propio.
export default function GlobalNotFound() {
  const lang = siteLanguage();
  return (
    <RootHtml lang={lang}>
      <main className="mx-auto flex min-h-svh max-w-xl flex-col items-center justify-center gap-2 px-4 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">404</h1>
        <p className="text-muted-foreground">{messages(lang).notFound}</p>
      </main>
    </RootHtml>
  );
}
