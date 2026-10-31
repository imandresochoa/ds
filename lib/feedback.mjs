// Feedback anónimo de quien instala el kit y monta un sistema: qué le habría venido bien.
// Lo comparten `ds feedback`, que arma el informe y lo anonimiza en local con lo que sabe del sistema, y la
// función que lo recibe (`api/feedback.mjs`), que lo valida y vuelve a pasar la limpieza genérica.
// Regla 1 del kit: el informe nunca lleva nada del producto. Por eso campos fijos y un solo texto, anonimizado.

/** Endpoint por defecto. `DS_FEEDBACK_URL` lo cambia. */
export const FEEDBACK_URL = 'https://ds-ejemplo.vercel.app/api/feedback';
/** Repo donde acaba cada informe, como issue público con la etiqueta `feedback`. */
export const FEEDBACK_REPO = 'imandresochoa/ds';

export const AGENTES = ['claude-code', 'codex', 'cursor', 'gemini-cli', 'copilot', 'otro', 'ninguno', 'desconocido'];
export const SISTEMAS_OPERATIVOS = ['macos', 'linux', 'windows', 'otro'];
export const ORIGENES = ['repo', 'web', 'figma', 'cero', 'desconocido'];
export const LIMITES = { minimo: 10, sugerencias: 4000, etiquetas: 12, cuerpo: 8192 };
/** Claves del informe, en orden. Ni una más: lo que no está aquí no se envía. */
export const CLAVES = ['tipo', 'version', 'kit', 'agente', 'so', 'node', 'origen', 'stack', 'sugerencias'];

// Las etiquetas del stack salen de una lista cerrada: una etiqueta libre podría nombrar el producto.
const EXTRA = ['css', 'html', 'postcss', 'css-modules', 'tailwind', 'shadcn', 'swift', 'swiftui', 'uikit', 'kotlin', 'jetpack-compose', 'flutter', 'javascript'];
export const esEtiqueta = (t) => typeof t === 'string' && (/^tailwind-[0-9]{1,2}$/.test(t) || EXTRA.includes(t) || Object.values(STACK).includes(t));
const SEMVER = /^\d{1,4}\.\d{1,4}\.\d{1,6}(?:-[0-9A-Za-z.-]{1,32})?$/;

/** El agente que ejecuta el comando, por las variables de entorno que deja cada uno. */
export function detectAgent(env = process.env) {
  if (env.CLAUDECODE || env.CLAUDE_CODE_ENTRYPOINT) return 'claude-code';
  if (Object.keys(env).some((k) => k.startsWith('CODEX_') && k !== 'CODEX_HOME')) return 'codex';
  if (env.CURSOR_AGENT || env.CURSOR_TRACE_ID) return 'cursor';
  if (env.GEMINI_CLI) return 'gemini-cli';
  return 'desconocido';
}

export function detectOs(platform = process.platform) {
  return { darwin: 'macos', linux: 'linux', win32: 'windows' }[platform] ?? 'otro';
}

// Dependencias que se traducen a etiquetas genéricas. Lo que no está aquí no sale del equipo.
const STACK = {
  react: 'react', next: 'next', vue: 'vue', nuxt: 'nuxt', svelte: 'svelte', '@sveltejs/kit': 'sveltekit', astro: 'astro',
  '@angular/core': 'angular', 'solid-js': 'solid', '@remix-run/react': 'remix', 'react-router': 'react-router', vite: 'vite',
  'react-native': 'react-native', expo: 'expo', typescript: 'typescript', sass: 'sass', less: 'less',
  'styled-components': 'styled-components', '@emotion/react': 'emotion', '@vanilla-extract/css': 'vanilla-extract',
  'radix-ui': 'radix', '@radix-ui/react-slot': 'radix', '@mui/material': 'mui', '@chakra-ui/react': 'chakra', bootstrap: 'bootstrap',
  storybook: 'storybook', '@storybook/react': 'storybook',
};

/**
 * Etiquetas genéricas del stack del producto, a partir de su package.json y de las superficies de system.json.
 * @param {{ pkg?: any, tailwind?: string[], css?: boolean, shadcn?: boolean }} datos
 */
export function detectStack({ pkg, tailwind = [], css = false, shadcn = false } = {}) {
  const tags = new Set();
  const deps = { ...pkg?.dependencies, ...pkg?.devDependencies };
  for (const [name, spec] of Object.entries(deps)) {
    if (STACK[name]) tags.add(STACK[name]);
    if (name === 'tailwindcss') {
      const major = /(\d+)/.exec(String(spec))?.[1];
      tags.add(major ? `tailwind-${major}` : 'tailwind');
    }
  }
  for (const version of tailwind) {
    const major = /(\d+)/.exec(String(version))?.[1];
    if (major) tags.add(`tailwind-${major}`);
  }
  if (shadcn) tags.add('shadcn');
  const styled = [...tags].some((t) => t.startsWith('tailwind') || ['sass', 'less', 'styled-components', 'emotion', 'vanilla-extract'].includes(t));
  if (css || (pkg && !styled)) tags.add('css');
  return [...tags].sort();
}

// Palabras que nunca se tratan como nombre del producto, aunque salgan de system.json o de la carpeta.
const COMUNES = new Set([
  'repo', 'usuario', 'web', 'app', 'apps', 'www', 'ejemplo', 'example', 'design', 'system', 'systems', 'sistema', 'sistemas', 'diseno',
  'diseño', 'ds', 'kit', 'main', 'master', 'src', 'docs', 'site', 'sitio', 'cloud', 'api', 'dev', 'staging', 'prod', 'test', 'demo',
  'github', 'gitlab', 'vercel', 'netlify', 'figma', 'com', 'org', 'net', 'io', 'es', 'fyi', 'co', 'ai', 'blob', 'tree', 'design-system',
  'nombre_del_sistema', 'id_del_sistema', 'ruta-al-repo-de-produccion', 'node_modules', 'tmp', 'users', 'home', 'desktop', 'documents',
  // Vocabulario del kit: sale en casi cualquier sugerencia y no dice nada del producto.
  'feedback', 'prueba', 'pruebas', 'token', 'tokens', 'ficha', 'fichas', 'componente', 'componentes', 'bloque', 'bloques', 'sync', 'lab',
  'preset', 'skill', 'skills', 'agente', 'agentes', 'plantilla', 'frontend', 'front', 'landing', 'client', 'cliente',
]);

const escapeRe = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Formas en que puede aparecer un nombre: tal cual, en slug, junto, en CamelCase y sin los sufijos habituales de un
 * repo («-design-system», «-web», «-app»…). Una palabra suelta del nombre no cuenta: con «digital-garden» se quita
 * «digital garden» en todas sus formas, pero no cada «digital» del texto.
 */
export function nameVariants(name) {
  const raw = String(name ?? '').trim();
  if (!raw) return [];
  const plain = raw.normalize('NFD').replace(/[̀-ͯ]/g, '');
  const words = plain.split(/[^A-Za-z0-9]+/).filter(Boolean);
  const out = new Set([raw, plain, words.join('-'), words.join('_'), words.join(' '), words.join(''), words.map((w) => w[0].toUpperCase() + w.slice(1)).join('')]);
  const lower = words.map((w) => w.toLowerCase());
  for (const suffix of [['design', 'system'], ['ds'], ['sistema', 'de', 'diseno'], ['web'], ['app'], ['site'], ['www'], ['frontend'], ['front'], ['landing'], ['client']]) {
    const at = lower.length - suffix.length;
    if (at > 0 && suffix.every((w, i) => lower[at + i] === w)) for (const v of nameVariants(words.slice(0, at).join(' '))) out.add(v);
  }
  return [...out].filter((v) => v.length >= 3 && !COMUNES.has(v.toLowerCase()));
}

/** Etiquetas de un dominio que pueden nombrar el producto (acme en app.acme.com). */
export function hostNames(url) {
  try {
    const labels = new URL(url).hostname.split('.');
    return labels.slice(0, -1).filter((l) => l.length >= 3 && !COMUNES.has(l));
  } catch {
    return [];
  }
}

// Nombres de token que no dicen nada del producto: los de shadcn, Tailwind 4 y el Lab.
const TOKEN_GENERICO = new RegExp(
  '^(?:color-)?(?:background|foreground|card|popover|primary|secondary|muted|accent|destructive|border|input|ring|sidebar|chart-\\d+)' +
    '(?:-(?:primary|accent|border|ring))?(?:-foreground)?$' +
    '|^(?:radius(?:-(?:xs|sm|md|lg|xl|2xl))?|spacing|font-(?:sans|serif|mono)|text-(?:xs|sm|base|lg|xl|[2-9]xl)(?:--line-height)?' +
    '|shadow-(?:2xs|xs|sm|md|lg|xl|2xl)|duration-(?:fast|normal|slow)|ease-(?:in|out|in-out)|leading-\\w+|tracking-\\w+' +
    '|default-transition-(?:duration|timing-function))$',
);
// Opciones de línea de comandos que se escriben como un token (`--enviar`): se dejan.
const OPCIONES = new Set([
  'json', 'enviar', 'ver', 'texto', 'archivo', 'agente', 'stack', 'desde', 'carpeta', 'produccion', 'url', 'kit', 'directorio', 'sistemas',
  'seccion', 'limite', 'port', 'accept', 'solo', 'sobrescribir', 'aceptar-contraste', 'aqui', 'quitar', 'help', 'version', 'force',
  'save-dev', 'save-exact', 'yes', 'no', 'dry-run', 'global', 'legacy-peer-deps', 'exportar', 'check', 'delete-branch',
]);
const esTokenGenerico = (name) => TOKEN_GENERICO.test(name) || OPCIONES.has(name);

/**
 * Quita del texto lo que pueda identificar a la persona o al producto. Sin contexto, solo la limpieza genérica
 * (rutas, URLs, correos, claves, commits, colores y tokens); con contexto, también los nombres, clases, tokens y
 * componentes del sistema.
 * @param {string} text
 * @param {{ nombres?: string[], tokens?: string[], clases?: string[], componentes?: string[] }} [contexto]
 */
export function anonymize(text, contexto = {}) {
  let out = String(text ?? '')
    .normalize('NFC')
    .replace(/\r\n?/g, '\n')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F\u200B-\u200F\u202A-\u202E\u2066-\u2069]/g, '');
  // Una ruta o una URL empieza tras un espacio o un signo y acaba antes de la puntuación final («…en ~/x, y…»).
  const edge = '(^|[\\s(\\[{"\'`=:,;>])';
  const tail = '(?:[^\\s"\'`<>)\\]}]*[^\\s"\'`<>)\\]},.;:!?])?';
  const rules = [
    // Claves con prefijo conocido (GitHub, npm, Slack, OpenAI, Figma) antes que nada: también pueden ir dentro de una URL.
    [/\b(?:gh[pousr]_|github_pat_|npm_|xox[abprs]-|sk-|figd_)[A-Za-z0-9_-]{8,}/g, '<clave>'],
    [/\b[\w.+-]+@[\w-]+(?:\.[\w-]+)+/g, '<correo>'],
    [new RegExp(`\\b(?:https?|ftp|file|ssh|git):\\/\\/${tail}`, 'gi'), '<url>'],
    [new RegExp(`\\bwww\\.${tail}`, 'gi'), '<url>'],
    [new RegExp(`\\b(?:[a-z0-9-]+\\.)+(?:com|net|org|io|dev|app|es|fyi|co|ai|me|so|sh|xyz|cloud|tech|site|page)(?![\\w-]|\\.\\w)(?:\\/${tail})?`, 'gi'), '<url>'],
    [new RegExp(`\\b[A-Za-z]:\\\\${tail}`, 'g'), '<ruta>'],
    [new RegExp(`${edge}~[\\\\/]${tail}`, 'g'), '$1<ruta>'],
    [new RegExp(`${edge}(?:\\.\\.?[\\\\/])+${tail}`, 'g'), '$1<ruta>'],
    [new RegExp(`${edge}\\/(?![\\s/])${tail}`, 'g'), '$1<ruta>'],
    [/#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})\b/g, '<color>'],
    [/\b(?:rgba?|hsla?|hwb|oklch|oklab|lab|lch|color)\([^)\n]{1,80}\)/gi, '<color>'],
    // Claves sueltas: 16 caracteres o más, con mayúsculas, minúsculas y números (las de Figma tienen 22).
    [/\b(?=[A-Za-z0-9_-]*\d)(?=[A-Za-z0-9_-]*[A-Z])(?=[A-Za-z0-9_-]*[a-z])[A-Za-z0-9_-]{16,}\b/g, '<clave>'],
    [/\b(?=[0-9a-f]*\d)(?=[0-9a-f]*[a-f])[0-9a-f]{7,40}\b/g, '<commit>'],
  ];
  for (const [re, marker] of rules) out = out.replace(re, marker);

  // Tokens: cualquier propiedad personalizada que no sea genérica, y los nombres de token del producto sin «--».
  out = out.replace(/--([A-Za-z_][\w-]*)/g, (all, name) => (esTokenGenerico(name) ? all : '<token>'));
  const word = (list, min, test) =>
    [...new Set(list ?? [])].filter((n) => typeof n === 'string' && n.length >= min && test(n)).sort((a, b) => b.length - a.length);
  for (const name of word(contexto.tokens?.map((t) => String(t).replace(/^--/, '')), 4, (n) => /[-_]/.test(n) && !esTokenGenerico(n))) {
    out = out.replace(new RegExp(`(?<![\\w-])${escapeRe(name)}(?![\\w-])`, 'g'), '<token>');
  }
  // Clases del producto: con punto o entre comillas invertidas, siempre; sueltas, solo si llevan - o _ (las de una
  // palabra, como «card», son vocabulario común).
  for (const name of word(contexto.clases, 3, () => true)) {
    const n = escapeRe(name);
    out = out.replace(new RegExp(`\\.${n}(?![\\w-])|\`${n}\``, 'g'), (m) => (m.startsWith('`') ? '`<clase>`' : '<clase>'));
    if (/[-_]/.test(name) && name.length >= 5) out = out.replace(new RegExp(`(?<![\\w-])${n}(?![\\w-])`, 'g'), '<clase>');
  }
  // Componentes: los nombres compuestos (HeroBanner), no los de una palabra (Button).
  for (const name of word(contexto.componentes, 5, (n) => /[a-z0-9][A-Z]/.test(n) || /[-_]/.test(n))) {
    out = out.replace(new RegExp(`(?<![\\w-])${escapeRe(name)}(?![\\w-])`, 'g'), '<componente>');
  }
  // Nombres del producto y del sistema, del más largo al más corto para no partir uno compuesto.
  const nombres = [...new Set((contexto.nombres ?? []).flatMap(nameVariants))].sort((a, b) => b.length - a.length);
  for (const name of nombres) out = out.replace(new RegExp(`(?<![A-Za-z0-9])${escapeRe(name)}(?![A-Za-z0-9])`, 'gi'), '<producto>');

  // Usuarios (@alguien): son datos personales y en el issue avisarían a esa persona. Se respetan las reglas de CSS
  // (@theme, @import…) y los paquetes con ámbito (@scope/paquete).
  out = out.replace(/(^|[^\w`.])@([A-Za-z0-9][\w-]*)(?![\w/-])/g, (all, before, name) => (AT_RULES.has(name.toLowerCase()) ? all : `${before}<usuario>`));
  return out.replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
}

const AT_RULES = new Set([
  'theme', 'import', 'media', 'layer', 'apply', 'tailwind', 'source', 'utility', 'variant', 'custom-variant', 'plugin', 'config',
  'keyframes', 'font-face', 'supports', 'container', 'property', 'reference', 'charset', 'namespace', 'page', 'scope', 'starting-style',
]);

/** El informe con sus campos fijos, en el orden de CLAVES. */
export function buildReport({ kit, agente, so, node, origen, stack = [], sugerencias }) {
  return {
    tipo: 'ds-feedback',
    version: 1,
    kit: String(kit),
    agente: AGENTES.includes(agente) ? agente : 'desconocido',
    so: SISTEMAS_OPERATIVOS.includes(so) ? so : 'otro',
    node: String(node),
    origen: ORIGENES.includes(origen) ? origen : 'desconocido',
    stack: [...new Set(stack)].filter((t) => esEtiqueta(t)).slice(0, LIMITES.etiquetas),
    sugerencias: String(sugerencias ?? ''),
  };
}

/**
 * Comprueba que un informe tiene exactamente la forma de buildReport. La función que lo recibe no acepta nada más.
 * @returns {{ ok: boolean, errores: string[], informe?: ReturnType<typeof buildReport> }}
 */
export function validateReport(data) {
  const errores = [];
  if (!data || typeof data !== 'object' || Array.isArray(data)) return { ok: false, errores: ['el informe tiene que ser un objeto'] };
  const extra = Object.keys(data).filter((k) => !CLAVES.includes(k));
  if (extra.length) errores.push(`claves no admitidas: ${extra.join(', ')}`);
  const missing = CLAVES.filter((k) => !(k in data));
  if (missing.length) errores.push(`faltan claves: ${missing.join(', ')}`);
  if (data.tipo !== 'ds-feedback') errores.push('tipo tiene que ser «ds-feedback»');
  if (data.version !== 1) errores.push('version tiene que ser 1');
  if (typeof data.kit !== 'string' || !SEMVER.test(data.kit)) errores.push('kit no es una versión');
  if (!AGENTES.includes(data.agente)) errores.push(`agente: ${AGENTES.join(', ')}`);
  if (!SISTEMAS_OPERATIVOS.includes(data.so)) errores.push(`so: ${SISTEMAS_OPERATIVOS.join(', ')}`);
  if (typeof data.node !== 'string' || !/^\d{1,3}$/.test(data.node)) errores.push('node tiene que ser la versión mayor');
  if (!ORIGENES.includes(data.origen)) errores.push(`origen: ${ORIGENES.join(', ')}`);
  if (!Array.isArray(data.stack) || data.stack.length > LIMITES.etiquetas || data.stack.some((t) => typeof t !== 'string' || !esEtiqueta(t))) {
    errores.push(`stack: hasta ${LIMITES.etiquetas} etiquetas en minúsculas (tailwind-4, react…)`);
  }
  const text = typeof data.sugerencias === 'string' ? data.sugerencias.trim() : '';
  if (text.length < LIMITES.minimo || text.length > LIMITES.sugerencias) errores.push(`sugerencias: entre ${LIMITES.minimo} y ${LIMITES.sugerencias} caracteres`);
  if (errores.length) return { ok: false, errores };
  return { ok: true, errores, informe: buildReport({ ...data, sugerencias: text }) };
}

/** Título y cuerpo del issue. Las sugerencias van en un bloque de código: sin menciones, enlaces ni HTML. */
export function issueFromReport(informe) {
  const fence = '~~~~';
  const text = informe.sugerencias.replace(/~{3,}/g, (m) => m.split('').join(' '));
  const stack = informe.stack.length ? informe.stack.map((t) => `\`${t}\``).join(', ') : '—';
  return {
    title: `Feedback · ${informe.origen} · ${informe.agente} · kit ${informe.kit}`,
    body: [
      'Feedback anónimo enviado con `ds feedback`, anonimizado en el equipo de quien lo envía.',
      '',
      '| Campo | Valor |',
      '| --- | --- |',
      `| Kit | \`${informe.kit}\` |`,
      `| Agente | \`${informe.agente}\` |`,
      `| Sistema operativo | \`${informe.so}\` · Node ${informe.node} |`,
      `| Origen del sistema | \`${informe.origen}\` |`,
      `| Stack | ${stack} |`,
      '',
      '## Qué le habría venido bien',
      '',
      `${fence}text`,
      text,
      fence,
    ].join('\n'),
  };
}
