---
titulo: Cada tarea de un agente acaba con un reporte
resumen: Cinco apartados fijos (qué cambió, por qué, cómo se comprobó, qué no se hizo y qué necesita de la persona), con evidencia y no con valoraciones.
estado: propuesta
fecha: 2026-11-19
---

## Contexto

- Las skills acababan cada una a su manera: «un resumen», «resume qué está hecho», «resumen para la persona». Sin apartados fijos, un agente se salta lo incómodo (lo que no comprobó, lo que descartó).
- La descripción de un PR ya pedía qué cambia, por qué y cómo se ha probado (`10-git-y-entornos.md`), pero no todas las tareas acaban en un PR.
- pstack (Lauren Tan) no da una tarea por terminada sin evidencia que encaje con el cambio, y enseña también lo descartado. Antigravity cierra cada tarea con un resumen de cambios para la persona.
- Un estudio de sesiones de agentes vio que el resumen final menciona más o menos una de cada once acciones: el reporte no puede sustituir a la revisión.

## Decisión

Cada tarea de un agente, en el kit o en un sistema, acaba con un reporte con cinco apartados: **qué cambió** (por `id`), **por qué** (las decisiones en las que se apoya o que propone), **cómo se comprobó** (comandos y resultado), **qué no se hizo** y **qué necesita de la persona**. Es el mismo contenido que la descripción del PR. En tareas largas se va escribiendo. Si una corrección se repite, el agente propone convertirla en una comprobación (`ds check`, una regla o una mejora del kit). Va en la metodología (`12-reporte.md`), como regla 8 de los principios y en el `AGENTS.md` del kit y de la plantilla, y cada skill acaba con él.

## Consecuencias

- La persona sabe siempre dónde mirar y qué le toca decidir.
- El reporte informa, no aprueba: el merge sigue dependiendo del diff, del check y de la CI.
- Un poco más de texto al final de cada tarea.

## Alternativas

- **Dejar el resumen libre**, como hasta ahora.
- **Un archivo de reporte por tarea en el repo**: deja rastro, pero llena el repo. La descripción del PR ya es ese rastro.
