---
titulo: Decisiones
resumen: "Cómo se registra el porqué del sistema: qué merece una decisión, su formato, sus estados, quién la acepta y qué comprueba ds check."
---

Una ficha dice qué es una pieza y cómo se usa. Una decisión dice **por qué** es así. Sin ese porqué, un agente (o una persona nueva) ve una regla, no entiende de dónde sale y la deshace con buena intención. Por eso el porqué vive en el sistema, junto al qué, y se publica igual: en la web, en `.md` y en el registry.

Es el formato que usan muchos sistemas de diseño abiertos con el nombre de ADR (*architecture decision record*): Primer, Carbon, GOV.UK, Zendesk Garden o Twilio Paste. La diferencia es que ellos lo guardan en carpetas para quien contribuye y aquí se publica, porque un agente lee el sitio.

## Qué merece una decisión

Una decisión se escribe cuando el cambio:

- **cambia cómo se trabaja** (el flujo, una convención de nombres, qué se documenta y qué no);
- **cuesta revertir** (un formato de ficha, la estructura de los tokens, una dependencia);
- **elige entre alternativas razonables** y la que se descarta volvería a proponerse si no queda escrito por qué no;
- **contradice o sustituye** otra decisión.

No la necesitan los ajustes pequeños (un texto, un espacio, un color corregido), lo que ya dice una ficha ni lo que es obligatorio por producción: si producción es así, la ficha lo documenta y basta.

## Dónde viven

| Repo | Dónde | Quién la lee |
| --- | --- | --- |
| Sistema | `content/decisiones/NNNN-slug.md`, publicadas como la sección Decisiones. | Personas y agentes, en la web, en `.md`, en `llms.txt` y en el registry. |
| Kit | `docs/decisiones/NNNN-slug.md`. `docs/DECISIONES.md` queda como histórico hasta el 2026-11-19. | Quien mantiene el kit. |
| Producción | En su propio repo, si el equipo las usa (por ejemplo, entornos o seguridad). | El sistema no las copia: si una afecta al diseño, una decisión del sistema la enlaza. |

## Formato

```markdown
---
titulo: Los tokens llevan el nombre de su rol
resumen: Una línea: qué se decidió.
estado: propuesta            # propuesta, aceptada, sustituida o rechazada
fecha: 2026-11-19            # cuándo se propuso
decide: Ana                  # quién la aceptó o la rechazó (obligatorio salvo en «propuesta»)
afecta: [fundamentos/color, componentes/boton]   # ids de las fichas que cambia
sustituye: [decisiones/0002-tokens-por-valor]     # si reemplaza a otra
---

## Contexto
Qué pasa y por qué hay que decidir. Hechos, no opiniones: lo que dice producción, lo que se midió, lo que se probó.

## Decisión
Qué se decide, en presente y de forma observable («los tokens se nombran por su rol»), no «mejorar los tokens».

## Consecuencias
Qué se vuelve más fácil y qué más difícil. Las negativas también.

## Alternativas
Las opciones descartadas y por qué. Es lo que evita repetir la discusión.
```

- **El número** es el siguiente libre, con cuatro cifras. No se reutiliza aunque la decisión se rechace.
- **Una decisión por archivo.** Si en un PR salen dos, son dos archivos.
- **No se reescriben.** Se corrigen erratas; si cambia el fondo, una decisión nueva la sustituye (`sustituye`) y la vieja pasa a `sustituida`. La anterior se conserva por su contexto.
- **Investigación y experimentos** van en Contexto, con enlace: una prueba con usuarios, una iniciativa, una medición.

## Estados

| Estado | Qué significa | Quién lo pone |
| --- | --- | --- |
| Propuesta | Escrita, pendiente de decidir. Todavía no obliga. | Quien la escribe: una persona o un agente. |
| Aceptada | Vigente. El trabajo nuevo la sigue. | Siempre una persona, con su nombre en `decide`. |
| Sustituida | Otra decisión la reemplaza. | Quien acepta la nueva. |
| Rechazada | Se valoró y no se adoptó. | Una persona, con su nombre en `decide`. |

Una propuesta es también el sitio para discutir antes de decidir: lo que otros sistemas llaman RFC. La discusión va en el PR que la añade; el archivo recoge el resultado.

## Reglas para agentes

1. **Antes de cambiar una ficha, lee sus decisiones.** Están al final de su página, en su `.md` y en `decisiones` de su JSON (`npx ds ver <id>`).
2. **Si el cambio contradice una decisión aceptada, para y avisa.** Cuenta cuál y por qué choca. Si la persona quiere seguir, escribe una decisión nueva que la sustituya.
3. **Si el cambio toma una decisión** (ver «Qué merece una decisión»), escríbela en estado `propuesta` en el mismo PR y enlázala desde `afecta`.
4. **Nunca aceptes una decisión.** Un agente no pasa nada a `aceptada` ni a `rechazada`, ni rellena `decide`.
5. **Cuenta en el reporte** qué decisiones has propuesto y en cuáles te has apoyado (ver «Reporte al terminar» en esta metodología).

## Qué comprueba `ds check`

Falla si:

- el archivo no empieza por su número de cuatro cifras, o el número se repite;
- el estado no es de una decisión, o una ficha normal usa un estado de decisión;
- falta `fecha`, o falta `decide` en una decisión aceptada, sustituida o rechazada;
- `afecta` o `sustituye` apuntan a algo que no existe;
- una decisión aceptada sustituye a otra que no está `sustituida`, o una está `sustituida` y ninguna la sustituye.

Avisa, sin fallar, si faltan los apartados Contexto, Decisión o Consecuencias, o si una propuesta lleva más de 14 días sin decidir. La rutina diaria (skill `auditar-sistema`) recoge esos avisos y los pregunta.

## Origen

Formato de Michael Nygard (2011), con el apartado Alternativas de Primer. La idea de publicarlas como «design system decision records», con investigación y experimentos en el contexto, la recogió Thoughtworks en su radar (2023). La regla de que el agente propone y solo una persona acepta sigue la de producción: el agente abre el PR, una persona hace merge.
