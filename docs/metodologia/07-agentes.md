---
titulo: Capa para agentes
resumen: Qué lee un agente, en qué orden, y cómo se mejora la guía con evaluaciones.
---

## Qué publica el sistema

| Recurso | Para qué |
| --- | --- |
| `/llms.txt` | Índice de todos los sistemas y fichas, con enlaces a su Markdown. |
| `/<sistema>/design.md` | Punto de entrada. Criterio escrito a mano (`DESIGN.md`) y un apéndice generado: estados, API pública de clases, fichas y tokens de producción. |
| `/<sistema>/registry.json` | Índice del registry: cada pieza con su tipo, estado, categorías y el enlace a su JSON. También los tokens de producción y sus modos. |
| `/<sistema>/r/<sección>/<slug>.json` | Una pieza: estado por plataforma, lo que usa y quién la usa, fuentes, sync, reglas y antipatrones. |
| `/<sistema>/llms-full.txt` | Todas las fichas en un solo archivo. |
| `/directorio.json` | Solo en un directorio: cada sistema con su cobertura y el enlace a su registry. |
| `<ruta de la ficha>.md` | Cada página en Markdown, en la misma ruta. |

En la interfaz, «Copiar página» copia cada página en Markdown y la tarjeta «¿Trabajas con un agente?» copia un contexto listo para pegar. Desde la terminal, `npx ds info --json`, `npx ds search <texto> --json` y `npx ds ver <pieza>` dan lo mismo a un agente sin abrir la web ni hacer build: `search` devuelve piezas con la forma del índice y `ver`, el JSON de una pieza. El Lab de primitivos pasa sus cambios con un enlace: `npx ds preset ver` lo lee y `npx ds preset aplicar` lo escribe en `experimental/`.

## Orden de lectura para un agente

1. `design.md` del sistema.
2. La ficha concreta (`.md`), o su JSON en `r/` si necesita datos: qué usa, quién la usa y su sync.
3. Si va a escribir texto, la guía de voz enlazada desde Fundamentos.
4. Si va a crear algo nuevo, esta metodología.

## El registry es de solo lectura

De shadcn/ui se toma la forma: un índice y un JSON por pieza, con su tipo, sus dependencias (`usa`) y sus categorías. No es compatible con `npx shadcn add`, a propósito: nada del sistema escribe en el repo de producción. Una pieza entra en producción por un PR que aprueba una persona.

## Prompts del botón «Nuevo»

Cada sección tiene una acción («Proponer componente», «Abrir iniciativa»…) que copia un prompt con las rutas y las reglas del método. Viven en `lib/meta.mjs`.

## Mejorar la guía con evaluaciones

Adaptado de cómo trabaja Vercel con su `DESIGN.md`:

- Un conjunto fijo de escenarios (prompt, datos y tamaño de pantalla congelados) en `evals/`.
- Antes de cambiar la guía se guarda el resultado de referencia.
- Cada corrección va al sitio más estrecho que la pueda imponer: prosa en `DESIGN.md`, mecánica en el CSS o una comprobación en el sync.
- Se repiten los escenarios para confirmar que la corrección se mantiene, y se guarda un pequeño conjunto oculto que no se mira al editar.
- Una persona revisa cada cambio final.

Está pendiente en las [tareas del kit](https://github.com/imandresochoa/ds/blob/main/docs/TAREAS.md).

## Skills

El kit instala skills en cada sistema (`ds init` y `ds skills`): en `.claude/skills/` para Claude Code y en `.agents/skills/` para Codex. Convierten los pasos de esta metodología en procedimientos que un agente sigue sin improvisar:

| Skill | Cuándo |
| --- | --- |
| `montar-sistema` | Montar un sistema desde el repo, la web o Figma de un producto, o desde cero, y aplicar un preset del Lab. Es la de entrada: `ds instalar` la deja en la carpeta de usuario para usarla antes de que exista el sistema. |
| `inventariar-produccion` | Planificar qué documentar, con prioridades y tandas. |
| `nueva-ficha` | Documentar un componente, bloque, gráfico, fundamento, token o iniciativa. |
| `auditar-sistema` | Comprobar que todo cuadra con producción y arreglarlo. Antes de publicar, tras cada merge en producción y como rutina diaria programada (apartado «Rutina diaria» de `AGENTS.md`). |
| `revisar-sync` | Entender qué cambió en producción y actualizar o aceptar fichas. |
| `actualizar-kit` | Subir de versión el kit en un sistema. |
| `mejorar-kit` | Llevar al kit una mejora detectada en un sistema. |

Las skills viven en el kit (`skills/`) y se actualizan con él. No se editan en el repo del sistema.

## Preguntas a la persona

Cuando una skill necesita una decisión, la pregunta con la herramienta de preguntas del agente, no en texto suelto:

- **Claude Code**: `AskUserQuestion`. De 1 a 4 preguntas por llamada, de 2 a 4 opciones cada una y la opción «Otra» siempre disponible.
- **Codex**: `request_user_input`. Solo funciona en modo Plan; fuera de él la skill pregunta en texto.

Las skills usan como mucho 3 opciones, cortas y con la recomendada primero, para que sirvan en los dos. Las respuestas libres (una ruta, una URL) se piden en un mensaje normal. Si no hay herramienta, se pregunta con opciones numeradas y se espera la respuesta.
