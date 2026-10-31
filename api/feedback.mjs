// Recibe el feedback anónimo de `ds feedback` y lo abre como issue en GitHub, con la etiqueta «feedback».
// Es una función de Vercel: el proyecto que despliega este repo sirve todo lo que hay en api/. No va en el
// paquete npm, porque api/ no está en «files» de package.json.
//
// Variables de entorno, en el proyecto de Vercel (nunca en el repo):
//   DS_FEEDBACK_GITHUB_TOKEN  token de grano fino con acceso solo al repo de destino y el permiso «Issues: Read and write»
//   DS_FEEDBACK_REPO          opcional: owner/repo de destino (por defecto, imandresochoa/ds)
//
// No guarda nada: ni el cuerpo, ni la IP, ni las cabeceras. El límite de envíos es global y vive en la memoria de
// cada instancia, sin identificar a nadie: frena una ráfaga, no es una garantía.
import { FEEDBACK_REPO, LIMITES, anonymize, issueFromReport, validateReport } from '../lib/feedback.mjs';

const VENTANA_MS = 60 * 60 * 1000;
const MAX_POR_VENTANA = 30;
let envios = [];

const responder = (status, body, headers = {}) => Response.json(body, { status, headers: { 'cache-control': 'no-store', ...headers } });

export async function POST(request) {
  const token = process.env.DS_FEEDBACK_GITHUB_TOKEN;
  if (!token) return responder(503, { ok: false, error: 'El endpoint todavía no está configurado.' });
  if (!(request.headers.get('content-type') ?? '').toLowerCase().startsWith('application/json')) {
    return responder(415, { ok: false, error: 'Envía JSON (content-type: application/json).' });
  }
  if (Number(request.headers.get('content-length') ?? 0) > LIMITES.cuerpo) return responder(413, { ok: false, error: 'El informe es demasiado largo.' });
  const raw = await request.text();
  if (Buffer.byteLength(raw) > LIMITES.cuerpo) return responder(413, { ok: false, error: 'El informe es demasiado largo.' });

  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    return responder(400, { ok: false, error: 'El cuerpo no es JSON.' });
  }
  const { ok, errores, informe } = validateReport(data);
  if (!ok || !informe) return responder(400, { ok: false, error: 'El informe no tiene la forma de ds feedback.', errores });

  const ahora = Date.now();
  envios = envios.filter((t) => ahora - t < VENTANA_MS);
  if (envios.length >= MAX_POR_VENTANA) {
    const retry = Math.ceil((VENTANA_MS - (ahora - envios[0])) / 1000);
    return responder(429, { ok: false, error: 'Demasiados envíos. Prueba más tarde.' }, { 'retry-after': String(retry) });
  }
  envios.push(ahora);

  // Segunda pasada, sin contexto del producto: por si el informe no viene del CLI o el CLI es antiguo.
  const { title, body } = issueFromReport({ ...informe, sugerencias: anonymize(informe.sugerencias) });
  const repo = process.env.DS_FEEDBACK_REPO || FEEDBACK_REPO;
  let res;
  try {
    res = await fetch(`https://api.github.com/repos/${repo}/issues`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${token}`,
        accept: 'application/vnd.github+json',
        'content-type': 'application/json',
        'user-agent': 'ds-feedback',
        'x-github-api-version': '2022-11-28',
      },
      body: JSON.stringify({ title, body, labels: ['feedback'] }),
      signal: AbortSignal.timeout(10000),
    });
  } catch {
    return responder(502, { ok: false, error: 'No se pudo hablar con GitHub.' });
  }
  if (!res.ok) return responder(502, { ok: false, error: `GitHub no aceptó el informe (${res.status}).` });
  const issue = await res.json().catch(() => ({}));
  return responder(201, { ok: true, issue: issue.html_url ?? null });
}

export function GET() {
  return responder(405, { ok: false, error: 'Usa POST con el JSON de ds feedback.' }, { allow: 'POST' });
}
