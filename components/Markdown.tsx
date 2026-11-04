import { codeToHtml } from 'shiki';
import { createSlugger, prepareMarkdown, type MarkdownPart, type Slugger } from '@/lib/markdown';
import { SITE_ROUTE } from '@/lib/site';
import { BlockViewer } from './BlockViewer';
import { CodeBlock } from './CodeBlock';
import { ComponentPreview } from './ComponentPreview';
import type { PreviewSurface } from './Preview';
import { fenceViewport } from '@/lib/previews';

/** Lenguajes que Shiki resalta; el resto (prompts, texto) se pinta tal cual. */
const LANGS = new Set(['html', 'css', 'scss', 'js', 'jsx', 'ts', 'tsx', 'json', 'yaml', 'bash', 'sh', 'shell', 'swift', 'kotlin', 'md', 'markdown', 'mdx', 'diff']);

/** Código resaltado con un tema claro y otro oscuro (variables --shiki-light y --shiki-dark). */
export async function highlight(code: string, lang: string): Promise<string | null> {
  if (!LANGS.has(lang)) return null;
  try {
    return await codeToHtml(code, { lang, themes: { light: 'github-light', dark: 'github-dark' }, defaultColor: false });
  } catch {
    return null;
  }
}

// Los enlaces de las fichas a otras páginas del sitio («/sistema/componentes/x») son <a> sueltos, no <Link>:
// con ruta de publicación, se la ponen delante.
const withRouteInHtml = (html: string) => (SITE_ROUTE ? html.replace(/(\s(?:href|src)=")\/(?!\/)/g, `$1${SITE_ROUTE}/`) : html);

/** En la ficha de un bloque, los ejemplos van en el visor ancho: necesita el título y el .md del bloque para su prompt. */
type BlockInfo = { title: string; md: string };

type PartProps = { part: MarkdownPart; surfaces?: Record<string, PreviewSurface>; block?: BlockInfo };

/** Los pares de un antipatrón (```html incorrecto / ```html correcto) llevan su etiqueta encima. */
async function Part(props: PartProps) {
  const { part } = props;
  const verdict = part.type === 'code' ? (part.meta.incorrecto ? 'Incorrecto' : part.meta.correcto ? 'Correcto' : null) : null;
  if (!verdict) return <PartContent {...props} />;
  return (
    <div data-slot="code-verdict" className="mt-4 [&>*:last-child]:mt-1.5">
      <p className={verdict === 'Incorrecto' ? 'text-sm font-medium text-destructive' : 'text-sm font-medium text-muted-foreground'}>{verdict}</p>
      <PartContent {...props} />
    </div>
  );
}

async function PartContent({ part, surfaces, block }: PartProps) {
  if (part.type === 'html') return <div className="contents" dangerouslySetInnerHTML={{ __html: withRouteInHtml(part.html) }} />;
  const { lang, meta, code } = part;
  const surfaceId = typeof meta.superficie === 'string' ? meta.superficie : Object.keys(surfaces ?? {})[0];
  const surface = surfaceId ? surfaces?.[surfaceId] : undefined;
  if (meta.preview && lang === 'html' && surface && block) {
    return (
      <div className="mt-4">
        <BlockViewer
          title={block.title}
          md={block.md}
          html={code}
          code={code}
          codeHtml={await highlight(code, 'html')}
          surface={surface}
          background={typeof meta.fondo === 'string' ? meta.fondo : undefined}
          vista={fenceViewport(meta.vista)}
          mode={typeof meta.modo === 'string' ? meta.modo : undefined}
        />
      </div>
    );
  }
  if (meta.preview && lang === 'html' && surface) {
    return (
      <ComponentPreview
        html={code}
        surface={surface}
        surfaceLabel={Object.keys(surfaces ?? {}).length > 1 ? surfaceId : undefined}
        background={typeof meta.fondo === 'string' ? meta.fondo : undefined}
        align={meta.alinear === 'inicio' ? 'start' : 'center'}
        vista={fenceViewport(meta.vista)}
        mode={typeof meta.modo === 'string' ? meta.modo : undefined}
        code={code}
        codeHtml={await highlight(code, 'html')}
      />
    );
  }
  return <CodeBlock code={code} html={await highlight(code, lang)} lang={lang || undefined} />;
}

/**
 * Pinta Markdown con el estilo de las páginas de documentación. Los bloques ```html preview``` se convierten en un
 * ejemplo en vivo con su código plegado debajo (con `block`, en el visor ancho de bloques); el resto de bloques de
 * código, en código resaltado con botón de copiar.
 */
export async function Markdown({ source, surfaces, slug = createSlugger(), prepared, block }: { source?: string; surfaces?: Record<string, PreviewSurface>; slug?: Slugger; prepared?: MarkdownPart[]; block?: BlockInfo }) {
  const parts = prepared ?? prepareMarkdown(source ?? '', slug).parts;
  return (
    <div className="ds-prose">
      {parts.map((part, i) => <Part key={i} part={part} surfaces={surfaces} block={block} />)}
    </div>
  );
}
