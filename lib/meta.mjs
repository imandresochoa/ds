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

/** Capas del sistema, de lo más abstracto a lo más compuesto (diseño atómico). */
export const SECTIONS = [
  {
    id: 'inicio', label: 'Inicio', icon: 'inicio',
    accion: { label: 'Pedir un cambio', prompt: 'Trabaja en el sistema de diseño {sistema}. Lee primero AGENTS.md y docs/metodologia/. Cambio que quiero: ' },
  },
  {
    id: 'fundamentos', label: 'Fundamentos', icon: 'fundamentos', agrupar: 'grupo',
    descripcion: 'Reglas de criterio que dan forma a todo lo demás: tipografía, color, maquetación, movimiento, voz, ilustración.',
    accion: { label: 'Documentar fundamento', prompt: 'Documenta un fundamento del sistema {sistema} en content/fundamentos/ siguiendo docs/metodologia/05-ficha.md. Escribe reglas observables y nombra los antipatrones.' },
  },
  {
    id: 'tokens', label: 'Tokens', icon: 'tokens', agrupar: 'grupo',
    descripcion: 'Valores con nombre que salen del código de producción: color, tipo, espacio, radios, sombras y movimiento.',
    accion: { label: 'Proponer token', prompt: 'Propón un token nuevo para el sistema {sistema}. Sigue docs/metodologia/02-capas.md y 05-ficha.md. Créalo con estado exploracion en content/tokens/ y no toques producción.' },
  },
  {
    id: 'componentes', label: 'Componentes', icon: 'componentes', agrupar: 'funcion',
    grupos: { acciones: 'Acciones', navegacion: 'Navegación', formularios: 'Formularios', feedback: 'Feedback', contenido: 'Contenido', superposiciones: 'Superposiciones' },
    descripcion: 'Piezas reutilizables. Cada una enlaza con su código en producción y muestra su recreación exacta.',
    accion: { label: 'Proponer componente', prompt: 'Crea la ficha de un componente del sistema {sistema} siguiendo docs/metodologia/05-ficha.md. Si ya existe en producción, declara sus fuentes y clases, ejecuta npx ds sync y acepta la huella solo tras revisar. Si es nuevo, usa estado exploracion y CSS en experimental/.' },
  },
  {
    id: 'patrones', label: 'Patrones', icon: 'patrones', agrupar: 'nivel',
    grupos: { seccion: 'Secciones', pantalla: 'Pantallas', flujo: 'Flujos' },
    descripcion: 'Composiciones de componentes que resuelven un problema concreto: secciones, pantallas y flujos.',
    accion: { label: 'Proponer patrón', prompt: 'Documenta un patrón del sistema {sistema} en content/patrones/ siguiendo docs/metodologia/05-ficha.md. Enumera los componentes que compone.' },
  },
  {
    id: 'iniciativas', label: 'Iniciativas', icon: 'iniciativas', agrupar: 'estado',
    descripcion: 'Trabajo en curso que todavía no está en producción. Agrupa las piezas nuevas hasta que se publican.',
    accion: { label: 'Abrir iniciativa', prompt: 'Abre una iniciativa en content/iniciativas/ con las secciones estándar de docs/metodologia/03-estados.md (Resumen, Referencias, Exploración, Flujos, Handoff, Playground).' },
  },
  {
    id: 'metodologia', label: 'Metodología', icon: 'metodologia', global: true, interna: true,
    descripcion: 'Documentación interna: cómo construimos y mantenemos sistemas de diseño agentic-first. Solo aparece en los sistemas que la activan.',
    accion: { label: 'Proponer mejora', prompt: 'Propón una mejora a la metodología en docs/metodologia/ y registra la decisión, con fecha y motivo, en docs/DECISIONES.md. Mejora: ' },
  },
];

export const CONTENT_SECTIONS = SECTIONS.filter((s) => !['inicio', 'metodologia'].includes(s.id));

