import { marked, type Token, type Tokens } from 'marked';
import { parseFence } from '@/lib/core.mjs';
import { SITE_ROUTE } from '@/lib/site';
import { CodeBlock } from './CodeBlock';
import { Preview, type PreviewSurface } from './Preview';

// Los enlaces de las fichas a otras páginas del sitio («/sistema/componentes/x») son <a> sueltos, no <Link>:
// con ruta de publicación, se la ponen delante.
const withRouteInHtml = (html: string) => (SITE_ROUTE ? html.replace(/(\s(?:href|src)=")\/(?!\/)/g, `$1${SITE_ROUTE}/`) : html);

/**
 * Pinta Markdown. Los bloques ```html preview``` se convierten en un ejemplo en vivo con su código;
 * el resto de bloques de código llevan botón de copiar.
 */
export function Markdown({ source, surfaces }: { source: string; surfaces?: Record<string, PreviewSurface> }) {
  const tokens = marked.lexer(source);
  const blocks: React.ReactNode[] = [];
  let buffer: Token[] = [];
  const flush = () => {
    if (!buffer.length) return;
    const list = Object.assign(buffer, { links: tokens.links });
    blocks.push(<div key={`md-${blocks.length}`} dangerouslySetInnerHTML={{ __html: withRouteInHtml(marked.parser(list)) }} />);
    buffer = [];
  };

  for (const token of tokens) {
    if (token.type !== 'code') {
      buffer.push(token);
      continue;
    }
    flush();
    const code = token as Tokens.Code;
    const { lang, meta } = parseFence(code.lang ?? '');
    const surfaceId = typeof meta.superficie === 'string' ? meta.superficie : Object.keys(surfaces ?? {})[0];
    const surface = surfaceId ? surfaces?.[surfaceId] : undefined;
    if (meta.preview && lang === 'html' && surface) {
      blocks.push(
        <div key={`ex-${blocks.length}`} className="ds-example">
          <Preview html={code.text} surface={surface} background={typeof meta.fondo === 'string' ? meta.fondo : undefined} />
          <CodeBlock code={code.text} lang={`html · ${surfaceId}`} />
        </div>,
      );
    } else {
      blocks.push(<CodeBlock key={`code-${blocks.length}`} code={code.text} lang={lang || undefined} />);
    }
  }
  flush();
  return <div className="ds-prose">{blocks}</div>;
}
