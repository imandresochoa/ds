// Metadatos del sistema sin dependencias de Node: los usan tanto el servidor como el navegador.

/** Ciclo de vida de una entrada. El orden importa: es el recorrido hacia producción. */
export const STATUSES = {
  'sin-iniciar': { label: 'Sin iniciar', descripcion: 'Esta plataforma aún no tiene implementación.' },
  exploracion: { label: 'Exploración', descripcion: 'En diseño. Puede cambiar o desaparecer. No se usa en producción.' },
  desarrollo: { label: 'En desarrollo', descripcion: 'Definido y construido en el sistema, pero aún no está en producción.' },
  produccion: { label: 'En producción', descripcion: 'Existe en producción y el sync lo verifica contra el código.' },
  obsoleto: { label: 'Obsoleto', descripcion: 'Sigue en producción, pero no se usa en trabajo nuevo.' },
};

/** Estado del enlace con producción, calculado por `npx ds sync`. */
export const SYNC_STATES = {
  ok: { label: 'Sincronizado', descripcion: 'La huella del código coincide con la que se revisó.' },
  nuevo: { label: 'Pendiente de verificar', descripcion: 'Fuente declarada, aún sin revisar con `npx ds sync --accept`.' },
  desajuste: { label: 'Cambió en producción', descripcion: 'El código cambió desde la última revisión. Revisa la ficha y acepta.' },
  ausente: { label: 'No está en producción', descripcion: 'La fuente o alguna clase declarada no existe en el código.' },
  'sin-repo': { label: 'Repo no disponible', descripcion: 'El sync no encontró el repositorio de producción.' },
};

/** Nivel atómico: regla interna de composición (una pieza solo usa piezas de niveles anteriores). No agrupa la navegación. */
export const NIVELES = { atomo: 'Átomo', molecula: 'Molécula', organismo: 'Organismo' };

export const PLATFORMS = { web: 'Web', ios: 'iOS', android: 'Android' };

/** Función de un componente: no agrupa la navegación (la lista es alfabética), pero ordena llms.txt y el registry. */
export const FUNCIONES = { acciones: 'Acciones', navegacion: 'Navegación', formularios: 'Formularios', feedback: 'Feedback', contenido: 'Contenido', superposiciones: 'Superposiciones' };

/**
 * Secciones del sistema, de lo más abstracto a lo más compuesto.
 * - `carpetas`: dónde se leen sus fichas dentro de content/ (la primera es la actual; las demás, nombres antiguos).
 * - `agrupar`: campo del frontmatter que agrupa la barra lateral (`grupo`, `categoria`, `estado`) o nada (lista alfabética).
 * - `categorias`: etiquetas y orden de los valores conocidos de `categoria`.
 * - `galeria`: el índice es una página ancha con los ejemplos en vivo (Bloques, Gráficos).
 * - `tipo`: nombre de una pieza de la sección en el registry (`componente`, `bloque`…).
 */
export const SECTIONS = [
  {
    id: 'fundamentos', tipo: 'fundamento', label: 'Fundamentos', agrupar: 'grupo',
    descripcion: 'Reglas de criterio que dan forma a todo lo demás: tipografía, color, maquetación, movimiento, voz, ilustración.',
    accion: { label: 'Documentar fundamento', prompt: 'Documenta un fundamento del sistema {sistema} en content/fundamentos/ siguiendo docs/metodologia/05-ficha.md. Escribe reglas observables y nombra los antipatrones.' },
  },
  {
    id: 'tokens', tipo: 'token', label: 'Tokens', agrupar: 'grupo',
    descripcion: 'Valores con nombre que salen del código de producción: color, tipo, espacio, radios, sombras y movimiento.',
    accion: { label: 'Proponer token', prompt: 'Propón un token nuevo para el sistema {sistema}. Sigue docs/metodologia/02-capas.md y 05-ficha.md. Créalo con estado exploracion en content/tokens/ y no toques producción.' },
  },
  {
    id: 'componentes', tipo: 'componente', label: 'Componentes',
    descripcion: 'Piezas reutilizables. Cada una enlaza con su código en producción y muestra su recreación exacta.',
    accion: { label: 'Proponer componente', prompt: 'Crea la ficha de un componente del sistema {sistema} siguiendo docs/metodologia/05-ficha.md. Si ya existe en producción, declara sus fuentes y clases, ejecuta npx ds sync y acepta la huella solo tras revisar. Si es nuevo, usa estado exploracion y CSS en experimental/.' },
  },
  {
    id: 'bloques', tipo: 'bloque', label: 'Bloques', carpetas: ['bloques', 'patrones'], agrupar: 'categoria', galeria: true,
    categorias: { seccion: 'Secciones', pantalla: 'Pantallas', flujo: 'Flujos' },
    titular: 'Bloques para construir pantallas',
    descripcion: 'Composiciones de componentes que resuelven un problema concreto: secciones, pantallas y flujos.',
    accion: { label: 'Proponer bloque', prompt: 'Documenta un bloque del sistema {sistema} en content/bloques/ siguiendo docs/metodologia/05-ficha.md. Indica su categoria y enumera en usa los componentes que compone.' },
  },
  {
    id: 'graficos', tipo: 'grafico', label: 'Gráficos', agrupar: 'categoria', galeria: true,
    categorias: { area: 'Área', barras: 'Barras', lineas: 'Líneas', circular: 'Circular', radar: 'Radar', radial: 'Radial', tooltip: 'Tooltip' },
    titular: 'Gráficos y visualización de datos',
    descripcion: 'Cómo presenta datos el producto: los gráficos que existen en producción, con sus colores y sus reglas.',
    accion: { label: 'Documentar gráfico', prompt: 'Documenta un gráfico del sistema {sistema} en content/graficos/ siguiendo docs/metodologia/05-ficha.md. Indica su categoria (area, barras, lineas, circular, radar, radial o tooltip) y los tokens de color que usa.' },
  },
  {
    id: 'iniciativas', tipo: 'iniciativa', label: 'Iniciativas', agrupar: 'estado',
    titular: 'Lo que viene',
    descripcion: 'Trabajo en curso que todavía no está en producción. Agrupa las piezas nuevas hasta que se publican.',
    accion: { label: 'Abrir iniciativa', prompt: 'Abre una iniciativa en content/iniciativas/ con las secciones estándar de docs/metodologia/03-estados.md (Resumen, Referencias, Exploración, Flujos, Handoff, Playground).' },
  },
  {
    id: 'metodologia', label: 'Metodología', global: true, interna: true,
    descripcion: 'Documentación interna: cómo construimos y mantenemos sistemas de diseño agentic-first. Solo aparece en los sistemas que la activan.',
    accion: { label: 'Proponer mejora', prompt: 'Propón una mejora a la metodología en docs/metodologia/ y registra la decisión, con fecha y motivo, en docs/DECISIONES.md. Mejora: ' },
  },
];

export const CONTENT_SECTIONS = SECTIONS.filter((s) => s.id !== 'metodologia');

/** Secciones con pestañas de plataforma (Web, iOS, Android). */
export const PLATFORM_SECTIONS = ['componentes', 'bloques'];

/** Páginas de Docs que pone el kit en todos los sistemas. Un sistema no puede usar estos nombres en content/docs/. */
export const KIT_PAGES = [
  { slug: 'produccion', titulo: 'Producción', resumen: 'Cómo está el enlace con el código: fichas sincronizadas, cambios pendientes de revisar y lo que falta por documentar.' },
  { slug: 'agentes', titulo: 'Para agentes', resumen: 'Qué lee un agente, en qué orden y el prompt para empezar.' },
];

/** Prompt general para pedir un cambio al agente. */
export const CAMBIO_PROMPT = 'Trabaja en el sistema de diseño {sistema}. Lee primero AGENTS.md y docs/metodologia/. Cambio que quiero: ';

/** Ids anteriores de sección: las huellas y los `relacionados` escritos antes de la 1.0 siguen funcionando. */
const LEGACY_IDS = { patrones: 'bloques' };

export function normalizeId(id = '') {
  const [section, ...rest] = id.split('/');
  return LEGACY_IDS[section] ? [LEGACY_IDS[section], ...rest].join('/') : id;
}

/**
 * Idiomas de la interfaz. Un sistema elige los suyos en system.json (`idiomas`, por defecto ["es"]): el primero es el
 * principal, el de las fichas y las URL de siempre; los demás son traducciones, bajo /<idioma>/ (hoy, solo /en/).
 */
export const IDIOMAS = { es: { nombre: 'Español', corto: 'ES' }, en: { nombre: 'English', corto: 'EN' } };
/** Idiomas que pueden ser traducción: tienen sus rutas en app/(en)/en/. */
export const TRADUCCIONES = ['en'];

/** Lo mismo que arriba, en inglés. Las claves y los ids no cambian: solo lo que se lee. */
const EN = {
  STATUSES: {
    'sin-iniciar': { label: 'Not started', descripcion: 'This platform has no implementation yet.' },
    exploracion: { label: 'Exploration', descripcion: 'Being designed. It may change or disappear. Not used in production.' },
    desarrollo: { label: 'In development', descripcion: 'Defined and built in the system, but not in production yet.' },
    produccion: { label: 'In production', descripcion: 'It exists in production and the sync checks it against the code.' },
    obsoleto: { label: 'Deprecated', descripcion: 'Still in production, but not used in new work.' },
  },
  SYNC_STATES: {
    ok: { label: 'Synced', descripcion: 'The code’s fingerprint matches the one that was reviewed.' },
    nuevo: { label: 'Pending review', descripcion: 'Source declared, not yet reviewed with `npx ds sync --accept`.' },
    desajuste: { label: 'Changed in production', descripcion: 'The code changed since the last review. Check the entry and accept.' },
    ausente: { label: 'Not in production', descripcion: 'The source or a declared class does not exist in the code.' },
    'sin-repo': { label: 'Repo unavailable', descripcion: 'The sync could not find the production repo.' },
  },
  NIVELES: { atomo: 'Atom', molecula: 'Molecule', organismo: 'Organism' },
  FUNCIONES: { acciones: 'Actions', navegacion: 'Navigation', formularios: 'Forms', feedback: 'Feedback', contenido: 'Content', superposiciones: 'Overlays' },
  SECTIONS: {
    fundamentos: {
      label: 'Foundations',
      descripcion: 'The judgement calls that shape everything else: type, color, layout, motion, voice, illustration.',
      accion: { label: 'Document a foundation', prompt: 'Document a foundation of the {sistema} design system in content/fundamentos/ following docs/metodologia/05-ficha.md. Write observable rules and name the anti-patterns.' },
    },
    tokens: {
      label: 'Tokens',
      descripcion: 'Named values taken from the production code: color, type, space, radii, shadows and motion.',
      accion: { label: 'Propose a token', prompt: 'Propose a new token for the {sistema} design system. Follow docs/metodologia/02-capas.md and 05-ficha.md. Create it with estado exploracion in content/tokens/ and do not touch production.' },
    },
    componentes: {
      label: 'Components',
      descripcion: 'Reusable pieces. Each one links to its production code and shows its exact recreation.',
      accion: { label: 'Propose a component', prompt: 'Create the entry for a component of the {sistema} design system following docs/metodologia/05-ficha.md. If it already exists in production, declare its sources and classes, run npx ds sync and accept the fingerprint only after reviewing it. If it is new, use estado exploracion and put the CSS in experimental/.' },
    },
    bloques: {
      label: 'Blocks',
      categorias: { seccion: 'Sections', pantalla: 'Screens', flujo: 'Flows' },
      titular: 'Blocks to build screens',
      descripcion: 'Compositions of components that solve a specific problem: sections, screens and flows.',
      accion: { label: 'Propose a block', prompt: 'Document a block of the {sistema} design system in content/bloques/ following docs/metodologia/05-ficha.md. Set its categoria and list in usa the components it composes.' },
    },
    graficos: {
      label: 'Charts',
      categorias: { area: 'Area', barras: 'Bar', lineas: 'Line', circular: 'Pie', radar: 'Radar', radial: 'Radial', tooltip: 'Tooltip' },
      titular: 'Charts and data visualization',
      descripcion: 'How the product shows data: the charts that exist in production, with their colors and their rules.',
      accion: { label: 'Document a chart', prompt: 'Document a chart of the {sistema} design system in content/graficos/ following docs/metodologia/05-ficha.md. Set its categoria (area, barras, lineas, circular, radar, radial or tooltip) and the color tokens it uses.' },
    },
    iniciativas: {
      label: 'Initiatives',
      titular: 'What’s coming',
      descripcion: 'Work in progress that is not in production yet. It groups the new pieces until they ship.',
      accion: { label: 'Open an initiative', prompt: 'Open an initiative in content/iniciativas/ with the standard sections from docs/metodologia/03-estados.md (Resumen, Referencias, Exploración, Flujos, Handoff, Playground).' },
    },
    metodologia: {
      label: 'Methodology',
      descripcion: 'Internal documentation: how we build and maintain agentic-first design systems. It only shows up in the systems that turn it on.',
      accion: { label: 'Suggest an improvement', prompt: 'Suggest an improvement to the methodology in docs/metodologia/ and record the decision, with its date and reason, in docs/DECISIONES.md. Improvement: ' },
    },
  },
  KIT_PAGES: {
    produccion: { titulo: 'Production', resumen: 'How the link with the code stands: synced entries, changes waiting for review and what is left to document.' },
    agentes: { titulo: 'For agents', resumen: 'What an agent reads, in what order, and the prompt to start.' },
  },
  CAMBIO_PROMPT: 'Work on the {sistema} design system. Read AGENTS.md and docs/metodologia/ first. The change I want: ',
};

/**
 * Los metadatos en un idioma: estados, secciones, páginas del kit y prompts. En español son los de arriba;
 * en inglés, los mismos con los textos de EN.
 * @param {string} [lang]
 */
export function localeMeta(lang = 'es') {
  if (lang !== 'en') return { STATUSES, SYNC_STATES, NIVELES, FUNCIONES, PLATFORMS, SECTIONS, CONTENT_SECTIONS, KIT_PAGES, CAMBIO_PROMPT };
  /** @type {typeof SECTIONS} */
  const sections = SECTIONS.map((s) => {
    const en = /** @type {Record<string, any>} */ (EN.SECTIONS)[s.id] ?? {};
    return { ...s, ...en, accion: { ...s.accion, ...en.accion } };
  });
  return {
    STATUSES: /** @type {typeof STATUSES} */ (EN.STATUSES),
    SYNC_STATES: /** @type {typeof SYNC_STATES} */ (EN.SYNC_STATES),
    NIVELES: /** @type {typeof NIVELES} */ (EN.NIVELES),
    FUNCIONES: /** @type {typeof FUNCIONES} */ (EN.FUNCIONES),
    PLATFORMS,
    SECTIONS: sections,
    CONTENT_SECTIONS: sections.filter((s) => s.id !== 'metodologia'),
    KIT_PAGES: KIT_PAGES.map((p) => ({ ...p, .../** @type {Record<string, any>} */ (EN.KIT_PAGES)[p.slug] })),
    CAMBIO_PROMPT: EN.CAMBIO_PROMPT,
  };
}
