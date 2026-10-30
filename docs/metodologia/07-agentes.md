---
titulo: Capa para agentes
resumen: Qué lee un agente, en qué orden, y cómo se mejora la guía con evaluaciones.
---

## Qué publica el sistema

| Recurso | Para qué |
| --- | --- |
| `/llms.txt` | Índice de todos los sistemas y fichas, con enlaces a su Markdown. |
| `/<sistema>/design.md` | Punto de entrada. Criterio escrito a mano (`DESIGN.md`) y un apéndice generado: estados, API pública de clases, fichas y tokens de producción. |
| `/<sistema>/registry.json` | Datos estructurados: estado, plataformas, fuentes, huellas y avisos de cada ficha. |
| `/<sistema>/llms-full.txt` | Todas las fichas en un solo archivo. |
| `<ruta de la ficha>.md` | Cada página en Markdown, en la misma ruta. |

En la interfaz, el menú «…» de cada página copia la ficha como Markdown, y el icono del robot copia un contexto listo para pegar en un agente.

## Orden de lectura para un agente

1. `design.md` del sistema.
2. La ficha concreta (`.md`).
3. Si va a escribir texto, la guía de voz enlazada desde Fundamentos.
4. Si va a crear algo nuevo, esta metodología.

## Prompts de la barra lateral

Cada sección tiene una acción («Proponer componente», «Abrir iniciativa»…) que copia un prompt con las rutas y las reglas del método. Viven en `lib/meta.mjs`.

## Mejorar la guía con evaluaciones

Adaptado de cómo trabaja Vercel con su `DESIGN.md`:

- Un conjunto fijo de escenarios (prompt, datos y tamaño de pantalla congelados) en `evals/`.
- Antes de cambiar la guía se guarda el resultado de referencia.
- Cada corrección va al sitio más estrecho que la pueda imponer: prosa en `DESIGN.md`, mecánica en el CSS o una comprobación en el sync.
- Se repiten los escenarios para confirmar que la corrección se mantiene, y se guarda un pequeño conjunto oculto que no se mira al editar.
- Una persona revisa cada cambio final.

Está pendiente en `docs/TAREAS.md`.

## Skills

El kit instala skills en `.claude/skills/` de cada sistema (`ds init` y `ds skills`). Convierten los pasos de esta metodología en procedimientos que un agente sigue sin improvisar:

| Skill | Cuándo |
| --- | --- |
| `crear-sistema` | Adaptar un sistema recién creado a un repo de producción. |
| `inventariar-produccion` | Planificar qué documentar, con prioridades y tandas. |
| `nueva-ficha` | Documentar un componente, bloque, gráfico, fundamento, token o iniciativa. |
| `auditar-sistema` | Comprobar que todo cuadra con producción y arreglarlo. Antes de publicar, tras cada merge en producción y como rutina diaria programada (apartado «Rutina diaria» de `AGENTS.md`). |
| `revisar-sync` | Entender qué cambió en producción y actualizar o aceptar fichas. |
| `actualizar-kit` | Subir de versión el kit en un sistema. |
| `mejorar-kit` | Llevar al kit una mejora detectada en un sistema. |

Las skills viven en el kit (`skills/`) y se actualizan con él. No se editan en el repo del sistema.
