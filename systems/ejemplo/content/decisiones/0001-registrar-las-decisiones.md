---
titulo: Registrar las decisiones
resumen: Las decisiones que cambian cómo es o cómo se trabaja el sistema se escriben aquí, numeradas, con su contexto y sus alternativas.
estado: aceptada
fecha: 2026-11-19
decide: Andrés
---

## Contexto

El porqué de cada pieza se perdía en conversaciones y PRs. Un agente que lee el sistema ve qué hay, pero no por qué es así, y puede deshacer una decisión sin saber que lo es.

## Decisión

Las decisiones del sistema viven en `content/decisiones/`, una por archivo, numeradas (`0001-…`) y con los apartados Contexto, Decisión, Consecuencias y Alternativas. Un agente las escribe en estado «propuesta»; solo una persona las acepta o las rechaza. No se reescriben: si algo cambia, una decisión nueva sustituye a la anterior.

## Consecuencias

- Personas y agentes leen el porqué en el mismo sitio que el qué: en la web, en `.md` y en el registry.
- Cada ficha enseña las decisiones que la afectan.
- `ds check` falla si una decisión apunta a fichas que no existen o si la cadena de sustituciones no cuadra.
- Escribir una decisión cuesta unos minutos. Los ajustes pequeños no la necesitan.

## Alternativas

- **Un solo archivo de decisiones**: fácil de escribir, pero no se publica por piezas ni se enlaza desde las fichas.
- **ADR en `docs/adr/` sin publicar**, como hacen muchos sistemas: un agente que lee el sitio no los vería.
