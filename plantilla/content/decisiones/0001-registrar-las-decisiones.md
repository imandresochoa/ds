---
titulo: Registrar las decisiones
resumen: Las decisiones que cambian cómo es o cómo se trabaja NOMBRE_DEL_SISTEMA se escriben aquí, numeradas, con su contexto y sus alternativas.
estado: propuesta
fecha: AAAA-MM-DD
---

## Contexto

El porqué de cada pieza se pierde en conversaciones y PRs. Un agente que lee el sistema ve qué hay, pero no por qué es así, y puede deshacer una decisión sin saber que lo es.

## Decisión

Las decisiones del sistema viven en `content/decisiones/`, una por archivo, numeradas (`0001-…`), con los apartados Contexto, Decisión, Consecuencias y Alternativas, como pide la metodología del kit («Decisiones»). Un agente las escribe en estado «propuesta»; solo una persona las acepta o las rechaza. No se reescriben: si algo cambia, una decisión nueva sustituye a la anterior.

## Consecuencias

- Personas y agentes leen el porqué en el mismo sitio que el qué.
- Cada ficha enseña las decisiones que la afectan.
- `npx ds check` falla si una decisión apunta a fichas que no existen o si la cadena de sustituciones no cuadra.

## Alternativas

- **No registrar decisiones**: más rápido hoy, pero cada cambio vuelve a abrir discusiones cerradas.

<!-- Para aceptarla: cambia «estado» a «aceptada» y añade «decide: <tu nombre>». -->
