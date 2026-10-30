import type { SystemSummary } from './nav';
import { sitePath } from './site';

/** Contexto listo para pegar en un agente: por dónde empezar a leer el sistema y qué reglas seguir. */
export function agentContext(system: Pick<SystemSummary, 'id' | 'nombre'>, origin: string) {
  return `Trabaja con el sistema de diseño ${system.nombre}.\n` +
    `Lee primero ${origin}${sitePath(`/${system.id}/design.md`)} (reglas, API de clases y estados) y ${origin}${sitePath('/llms.txt')}.\n` +
    'Usa solo lo que esté «En producción» salvo que te pida lo contrario. Si algo no está documentado, no lo inventes: dilo.';
}

/** Prompt para «Abrir en Claude/ChatGPT». Solo se ofrece en los sistemas que lo activan (`abrirEnAgentes`). */
export function openInAgentPrompt(system: Pick<SystemSummary, 'nombre'>, url: string) {
  return `Estoy mirando esta página del sistema de diseño ${system.nombre}: ${url}.\nAyúdame a entenderla y a usarla. Explica, pon ejemplos o ayúdame a depurar a partir de ella.`;
}
