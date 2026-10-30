// Prepara el Markdown de una página: HTML con ids en los títulos, bloques de código aparte y el índice («En esta página»).
import { Marked, type Tokens } from 'marked';
import { parseFence } from './core.mjs';

export type TocItem = { id: string; title: string; depth: number };
export type MarkdownPart =
  | { type: 'html'; html: string }
  | { type: 'code'; lang: string; meta: Record<string, string | boolean>; code: string };

/** Ids de los títulos de una página. Se comparte entre todos los bloques de Markdown de la página para que no se repitan. */
export function createSlugger() {
  const seen = new Map<string, number>();
  return (text: string) => {
    const base = text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/<[^>]+>/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'apartado';
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    return count ? `${base}-${count}` : base;
  };
}
export type Slugger = ReturnType<typeof createSlugger>;

const plain = (html: string) => html.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");

/** Divide el Markdown en HTML y bloques de código, y devuelve el índice de los h2 y h3. */
export function prepareMarkdown(source: string, slug: Slugger = createSlugger()): { parts: MarkdownPart[]; toc: TocItem[] } {
  const toc: TocItem[] = [];
  const marked = new Marked({
    renderer: {
      heading({ tokens, depth }) {
        const html = this.parser.parseInline(tokens);
        const id = slug(plain(html));
        if (depth === 2 || depth === 3) toc.push({ id, title: plain(html), depth });
        return `<h${depth} id="${id}">${html}</h${depth}>\n`;
      },
    },
  });
  const tokens = marked.lexer(source);
  const parts: MarkdownPart[] = [];
  let buffer: Tokens.Generic[] = [];
  const flush = () => {
    if (!buffer.length) return;
    const html = marked.parser(Object.assign(buffer, { links: tokens.links }))
      // Las tablas anchas se desplazan en horizontal en lugar de comprimirse.
      .replace(/<table>/g, '<div class="ds-table-scroll"><table>')
      .replace(/<\/table>/g, '</table></div>');
    parts.push({ type: 'html', html });
    buffer = [];
  };
  for (const token of tokens) {
    if (token.type !== 'code') {
      buffer.push(token);
      continue;
    }
    flush();
    const { lang, meta } = parseFence((token as Tokens.Code).lang ?? '');
    parts.push({ type: 'code', lang, meta, code: (token as Tokens.Code).text });
  }
  flush();
  return { parts, toc };
}
