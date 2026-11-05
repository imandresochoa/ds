// Fuentes git del Directorio: sistemas que viven en otros repos y se leen desde una caché local de solo lectura.
//
// En directorio.json, cada entrada de `sistemas` es una ruta (relativa al directorio) o una fuente git:
//   { "git": "github:org/x-design-system" | "git@github.com:org/x.git" | "https://…", "ref": "<sha o etiqueta>" }
// `ds dev`, `ds build` y `ds doctor` la clonan o la actualizan en .ds/fuentes/<id> y la leen como una carpeta.
//
// Seguridad:
// - Se usa el acceso que ya tiene la persona: `gh` (como asistente de credenciales, solo para la orden) o SSH, y en CI
//   el asistente de credenciales de git. El kit no pide, no guarda ni escribe tokens.
// - La caché es de solo lectura: archivos sin permiso de escritura, sin URL de push y reiniciada si alguien la toca.
// - Solo se aceptan URLs github:, ssh (git@… o ssh://), https:// y file://; ningún transporte que ejecute órdenes.
// - Se fija la ref: un commit o una etiqueta. Con una rama (o sin ref), el sitio cambia sin que nadie lo revise: se avisa.
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

/** Carpeta de la caché, dentro del repo de directorio (ya ignorada: `.ds/` está en su .gitignore). */
export const SOURCES_DIR = path.join('.ds', 'fuentes');

const SHA = /^[0-9a-f]{40}$/;
const GITHUB = /^github:([\w.-]+)\/([\w.-]+?)(?:\.git)?$/;
const SCP = /^[\w.-]+@[\w.-]+:[\w./~-]+$/;
const URL_OK = /^(ssh|https|file):\/\/[^\s]+$/;
const REF_OK = /^[\w][\w./-]*$/;

/** Una entrada de `sistemas` que es una fuente git: un objeto con `git`, o un texto con forma de URL git. */
export function isGitSource(entry) {
  if (entry && typeof entry === 'object') return typeof entry.git === 'string';
  return typeof entry === 'string' && (GITHUB.test(entry) || SCP.test(entry) || /^(ssh|https|file):\/\//.test(entry));
}

/**
 * `--sistemas` de `ds init --directorio`: «github:org/x#v1.2.0» o «git@github.com:org/x.git#<sha>» → { git, ref }.
 * Lo que no es una URL git es una ruta.
 */
export function parseSourceArg(text) {
  const at = text.lastIndexOf('#');
  const git = at > 0 ? text.slice(0, at) : text;
  if (!isGitSource(git)) return null;
  return at > 0 ? { git, ref: text.slice(at + 1) } : { git };
}

/** Valida una fuente y le da un id estable para su carpeta de caché. Lanza un Error con el motivo. */
export function normalizeSource(entry) {
  const source = typeof entry === 'string' ? { git: entry } : entry;
  const git = String(source.git ?? '').trim();
  if (!(GITHUB.test(git) || SCP.test(git) || URL_OK.test(git)) || git.startsWith('-')) {
    throw new Error(`fuente git no válida: "${git}". Usa github:org/repo, git@github.com:org/repo.git o https://…`);
  }
  const ref = source.ref == null ? null : String(source.ref).trim();
  if (ref !== null && !REF_OK.test(ref)) throw new Error(`ref no válida en ${git}: "${ref}"`);
  if (ref !== null && /^[0-9a-f]{7,39}$/.test(ref) && !SHA.test(ref)) throw new Error(`${git}: usa el commit completo (40 caracteres), no "${ref}"`);
  const id = git
    .replace(/^(github:|ssh:\/\/|https:\/\/|file:\/\/)/, '')
    .replace(/^[\w.-]+@/, '')
    .replace(/\.git$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return { git, ref, id };
}

function git(args, { cwd, auth = [] } = {}) {
  const result = spawnSync('git', [...auth, ...args], {
    cwd,
    encoding: 'utf8',
    stdio: ['inherit', 'pipe', 'pipe'],
    // Sin preguntas de usuario y contraseña: si falta el acceso, se dice cómo darlo.
    env: { ...process.env, GIT_TERMINAL_PROMPT: '0' },
  });
  const stderr = (result.stderr ?? '').trim().split('\n').filter(Boolean);
  // La línea que explica el fallo (fatal:, ERROR:, Permission denied…), no la última del texto de ayuda de git.
  const err = stderr.find((line) => /fatal|error|denied|not found|could not/i.test(line)) ?? stderr[0] ?? '';
  return { ok: result.status === 0, out: (result.stdout ?? '').trim(), err: err.replace(/^fatal:\s*/, '') };
}

let ghReady;
/** `gh` instalado y con sesión en github.com. */
function hasGh() {
  if (ghReady === undefined) ghReady = spawnSync('gh', ['auth', 'status', '--hostname', 'github.com'], { stdio: 'ignore' }).status === 0;
  return ghReady;
}

/** Cómo llegar a la fuente, por orden: URL y opciones de git para cada intento. */
function remotes(gitUrl) {
  const gh = GITHUB.exec(gitUrl);
  if (!gh) return [{ url: gitUrl, auth: [] }];
  const [, owner, repo] = gh;
  const https = `https://github.com/${owner}/${repo}.git`;
  const ssh = `git@github.com:${owner}/${repo}.git`;
  // gh como asistente de credenciales solo para esta orden: el token no se escribe en ningún sitio.
  const viaGh = { url: https, auth: ['-c', 'credential.helper=', '-c', 'credential.helper=!gh auth git-credential'] };
  return hasGh() ? [viaGh, { url: ssh, auth: [] }] : [{ url: https, auth: [] }, { url: ssh, auth: [] }];
}

/** Qué es la ref en el remoto: un commit, una etiqueta o una rama. */
function refKind(ref, heads) {
  if (ref === null) return 'rama';
  if (SHA.test(ref)) return 'commit';
  if (heads.split('\n').some((line) => line.endsWith(`\trefs/tags/${ref}`))) return 'etiqueta';
  if (heads.split('\n').some((line) => line.endsWith(`\trefs/heads/${ref}`))) return 'rama';
  return null;
}

/** Quita (o devuelve) el permiso de escritura a los archivos de la caché, salvo a .git. */
function setReadOnly(dir, readOnly) {
  for (const name of fs.readdirSync(dir)) {
    if (name === '.git') continue;
    const full = path.join(dir, name);
    const stat = fs.lstatSync(full);
    if (stat.isSymbolicLink()) continue;
    if (stat.isDirectory()) setReadOnly(full, readOnly);
    else fs.chmodSync(full, readOnly ? stat.mode & ~0o222 : stat.mode | 0o200);
  }
}

/**
 * Clona o actualiza una fuente en `<site>/.ds/fuentes/<id>` y devuelve su carpeta, el commit leído y los avisos.
 * Con un commit o una etiqueta ya en la caché, no hay red. Lanza un Error si no se puede leer.
 */
export function syncSource(site, entry) {
  const source = normalizeSource(entry);
  const dir = path.join(site, SOURCES_DIR, source.id);
  const metaFile = `${dir}.json`;
  const meta = fs.existsSync(metaFile) ? JSON.parse(fs.readFileSync(metaFile, 'utf8')) : null;
  const avisos = [];
  const head = () => git(['rev-parse', 'HEAD'], { cwd: dir }).out;
  const clean = () => git(['status', '--porcelain'], { cwd: dir }).out === '';
  const cached = meta && meta.git === source.git && meta.ref === source.ref && fs.existsSync(path.join(dir, '.git'));

  // Fijada y ya en la caché, sin cambios: se lee tal cual, sin red.
  if (cached && ['commit', 'etiqueta'].includes(meta.tipo) && head() === meta.sha && clean()) {
    return { ...source, dir, sha: meta.sha, tipo: meta.tipo, avisos };
  }

  if (!fs.existsSync(path.join(dir, '.git'))) {
    fs.rmSync(dir, { recursive: true, force: true });
    fs.mkdirSync(dir, { recursive: true });
    git(['init', '-q'], { cwd: dir });
  } else {
    setReadOnly(dir, false);
  }

  // Primer remoto que responde. Se guarda como origin, sin URL de push: la caché nunca sube nada.
  let heads = null;
  let remote = null;
  const errors = [];
  for (const candidate of remotes(source.git)) {
    const listed = git(['ls-remote', '--tags', '--heads', '--', candidate.url], { cwd: dir, auth: candidate.auth });
    if (listed.ok) {
      heads = listed.out;
      remote = candidate;
      break;
    }
    errors.push(`${candidate.url}: ${listed.err}`);
  }
  if (!remote) {
    if (cached && clean()) {
      avisos.push(`no se pudo actualizar ${source.git} (${errors.join(' · ')}); se lee la caché de ${meta.sha.slice(0, 7)}`);
      setReadOnly(dir, true);
      return { ...source, dir, sha: meta.sha, tipo: meta.tipo, avisos };
    }
    throw new Error(
      `no se pudo leer ${source.git}:\n  ${errors.join('\n  ')}\n` +
        '  Comprueba que tienes acceso: «gh auth login» (y «gh auth status»), o una clave SSH en GitHub («ssh -T git@github.com»).',
    );
  }
  git(['remote', 'remove', 'origin'], { cwd: dir });
  git(['remote', 'add', 'origin', remote.url], { cwd: dir });
  git(['remote', 'set-url', '--push', 'origin', 'no-push'], { cwd: dir });

  const tipo = refKind(source.ref, heads);
  if (!tipo) throw new Error(`${source.git}: no existe la ref "${source.ref}" (ni etiqueta ni rama)`);
  if (tipo === 'rama') {
    avisos.push(
      source.ref === null
        ? `${source.git} no fija "ref": se lee la rama por defecto y el sitio cambia con cada push. Fija un commit o una etiqueta.`
        : `${source.git} usa la rama "${source.ref}": el sitio cambia con cada push. Fija un commit o una etiqueta.`,
    );
  }
  const what = source.ref === null ? 'HEAD' : tipo === 'etiqueta' ? `refs/tags/${source.ref}` : tipo === 'rama' ? `refs/heads/${source.ref}` : source.ref;
  const fetched = git(['fetch', '-q', '--depth', '1', '--no-tags', 'origin', what], { cwd: dir, auth: remote.auth });
  if (!fetched.ok) throw new Error(`no se pudo descargar ${source.git}@${source.ref ?? 'HEAD'}: ${fetched.err}`);
  // Se descarta cualquier cambio local: la caché es una copia exacta de la ref.
  const checkout = git(['checkout', '-q', '--force', '--detach', 'FETCH_HEAD'], { cwd: dir });
  if (!checkout.ok) throw new Error(`no se pudo leer ${source.git}: ${checkout.err}`);
  git(['clean', '-q', '-fdx'], { cwd: dir });
  const sha = head();
  setReadOnly(dir, true);
  fs.writeFileSync(metaFile, JSON.stringify({ git: source.git, ref: source.ref, tipo, sha, url: remote.url, leido: new Date().toISOString() }, null, 2) + '\n');
  return { ...source, dir, sha, tipo, avisos };
}

/** El commit al que apunta ahora una ref del remoto (para fijarla en `ds init --directorio`). null si no se puede leer. */
export function resolveRemoteRef(gitUrl, ref = 'HEAD') {
  for (const candidate of remotes(gitUrl)) {
    const listed = git(['ls-remote', '--', candidate.url, ref], { auth: candidate.auth });
    if (listed.ok && listed.out) return listed.out.split('\n')[0].split('\t')[0];
  }
  return null;
}
