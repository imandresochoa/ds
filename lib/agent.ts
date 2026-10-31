import { messages } from './i18n';
import type { SystemSummary } from './nav';
import { sitePath } from './site';

/**
 * Contexto listo para pegar en un agente: por dónde empezar a leer el sistema y qué reglas seguir. En una traducción
 * (`prefix` '/en'), en ese idioma y con sus archivos (/en/<sistema>/design.md, /en/llms.txt).
 */
export function agentContext(system: Pick<SystemSummary, 'id' | 'nombre'>, origin: string, lang = 'es', prefix = '') {
  return messages(lang).agents.context(system.nombre, `${origin}${sitePath(`${prefix}/${system.id}/design.md`)}`, `${origin}${sitePath(`${prefix}/llms.txt`)}`);
}

/** Prompt para «Abrir en Claude/ChatGPT». Solo se ofrece en los sistemas que lo activan (`abrirEnAgentes`). */
export function openInAgentPrompt(system: Pick<SystemSummary, 'nombre'>, url: string, lang = 'es') {
  return messages(lang).agents.openInAgent(system.nombre, url);
}
