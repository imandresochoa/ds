---
titulo: Principios
resumen: Qué significa agentic-first y las reglas que no se negocian.
---

Un sistema de diseño agentic-first es uno que una persona y un agente leen igual de bien. No hay una versión «bonita» para personas y otra para máquinas: la página que ves es Markdown con datos estructurados, y el agente lee ese mismo Markdown.

## Las siete reglas

1. **Producción manda.** Lo que está en producción se documenta tal cual es. El sistema no describe un ideal: describe el código. Lo que todavía no existe se marca con su estado.
2. **Todo tiene estado.** Cada ficha y cada plataforma dicen si están en exploración, en desarrollo, en producción u obsoletas. Un agente solo usa lo que está en producción salvo que se le pida otra cosa.
3. **El enlace se comprueba, no se promete.** Cada ficha en producción declara sus fuentes (archivo y clases). El sync calcula una huella y avisa cuando el código cambia. Un enlace que nadie verifica acaba mintiendo.
4. **Criterio en prosa, mecánica en código.** El juicio (cuándo usar algo, por qué) se escribe. Lo repetible (valores, clases, comprobaciones) lo genera o lo valida un script.
5. **Reglas observables.** Se escribe «un solo botón relleno por grupo», que se puede comprobar, y no «que respire más», que no.
6. **Los antipatrones tienen nombre.** Nombrar un error frecuente («doble principal», «sinónimos de clase») permite que un agente lo reconozca y lo evite.
7. **Si no está documentado, no se inventa.** Ante un hueco, el agente lo dice y propone una ficha en exploración. Prefiere dejar algo en blanco a rellenarlo con una suposición.

## Qué cambia frente a un sistema de diseño clásico

| Clásico | Agentic-first |
| --- | --- |
| Documentación en una herramienta aparte | Markdown en el repo, servido como web y como `.md` |
| Se actualiza cuando alguien se acuerda | El sync detecta cada cambio de producción |
| Ejemplos recreados a mano | Ejemplos en vivo que cargan el CSS real de producción |
| Lo nuevo y lo publicado conviven sin distinguirse | Estados por ficha y por plataforma, e iniciativas |
| Lo lee una persona | Lo leen personas y agentes: `llms.txt`, `design.md`, `registry.json` |

## Origen

Esta metodología nace del primer sistema que construimos con ella (octubre de 2026) y está pensada para replicarse en cualquier producto. Las decisiones y su motivo quedan en las [decisiones del kit](https://github.com/imandresochoa/ds/blob/main/docs/DECISIONES.md).
