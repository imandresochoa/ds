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
 */
export const SECTIONS = [
  {
    id: 'fundamentos', label: 'Fundamentos', agrupar: 'grupo',
    descripcion: 'Reglas de criterio que dan forma a todo lo demás: tipografía, color, maquetación, movimiento, voz, ilustración.',
    accion: { label: 'Documentar fundamento', prompt: 'Documenta un fundamento del sistema {sistema} en content/fundamentos/ siguiendo docs/metodologia/05-ficha.md. Escribe reglas observables y nombra los antipatrones.' },
  },
  {
    id: 'tokens', label: 'Tokens', agrupar: 'grupo',
    descripcion: 'Valores con nombre que salen del código de producción: color, tipo, espacio, radios, sombras y movimiento.',
    accion: { label: 'Proponer token', prompt: 'Propón un token nuevo para el sistema {sistema}. Sigue docs/metodologia/02-capas.md y 05-ficha.md. Créalo con estado exploracion en content/tokens/ y no toques producción.' },
  },
  {
    id: 'componentes', label: 'Componentes',
    descripcion: 'Piezas reutilizables. Cada una enlaza con su código en producción y muestra su recreación exacta.',
    accion: { label: 'Proponer componente', prompt: 'Crea la ficha de un componente del sistema {sistema} siguiendo docs/metodologia/05-ficha.md. Si ya existe en producción, declara sus fuentes y clases, ejecuta npx ds sync y acepta la huella solo tras revisar. Si es nuevo, usa estado exploracion y CSS en experimental/.' },
  },
  {
    id: 'bloques', label: 'Bloques', carpetas: ['bloques', 'patrones'], agrupar: 'categoria', galeria: true,
    categorias: { seccion: 'Secciones', pantalla: 'Pantallas', flujo: 'Flujos' },
    titular: 'Bloques para construir pantallas',
    descripcion: 'Composiciones de componentes que resuelven un problema concreto: secciones, pantallas y flujos.',
    accion: { label: 'Proponer bloque', prompt: 'Documenta un bloque del sistema {sistema} en content/bloques/ siguiendo docs/metodologia/05-ficha.md. Indica su categoria y enumera los componentes que compone en relacionados.' },
  },
  {
    id: 'graficos', label: 'Gráficos', agrupar: 'categoria', galeria: true,
    categorias: { area: 'Área', barras: 'Barras', lineas: 'Líneas', circular: 'Circular', radar: 'Radar', radial: 'Radial', tooltip: 'Tooltip' },
    titular: 'Gráficos y visualización de datos',
    descripcion: 'Cómo presenta datos el producto: los gráficos que existen en producción, con sus colores y sus reglas.',
    accion: { label: 'Documentar gráfico', prompt: 'Documenta un gráfico del sistema {sistema} en content/graficos/ siguiendo docs/metodologia/05-ficha.md. Indica su categoria (area, barras, lineas, circular, radar, radial o tooltip) y los tokens de color que usa.' },
  },
  {
    id: 'iniciativas', label: 'Iniciativas', agrupar: 'estado',
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
