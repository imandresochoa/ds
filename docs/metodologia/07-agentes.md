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
| `/<sistema>/revisar.json` | Lo que necesita `ds revisar` para comprobar código de producción: tokens con sus valores, clases de producción y piezas con su estado. |
| `/directorio.json` | Solo en un directorio: cada sistema con su cobertura y el enlace a su registry. |
| `<ruta de la ficha>.md` | Cada página en Markdown, en la misma ruta. |

En la interfaz, «Copiar página» copia cada página en Markdown y su menú (o ⌘K) tiene «Copiar contexto para agentes», un contexto listo para pegar. Desde la terminal, `npx ds info --json`, `npx ds search <texto> --json` y `npx ds ver <pieza>` dan lo mismo a un agente sin abrir la web ni hacer build: `search` devuelve piezas con la forma del índice y `ver`, el JSON de una pieza. `npx ds patrones --json` agrupa las clases de producción que comparten forma aunque tengan prefijos distintos. El Lab de primitivos pasa sus cambios con un enlace: `npx ds preset ver` lo lee y `npx ds preset aplicar` lo escribe en `experimental/`.

## Comprobar el código: `ds revisar`

Un agente que escribe interfaz en producción la comprueba antes de terminar, sin modelo: escribe, ejecuta `ds revisar`, corrige y repite. Es lo que hacen el linter de Salesforce, el `code_audit` de Carbon o el `lint_css` de Primer.

| Regla | Nivel | Qué detecta |
| --- | --- | --- |
| `valor-suelto` | error | Un color o un valor compuesto (sombra, pila de fuentes) que ya es un token. |
| `token-inexistente` | error | `var(--x)` que no es un token ni se declara en el repo. Propone el más parecido. |
| `clase-inventada` | error | Una clase del bloque de una pieza documentada que no existe en producción (`.boton--xl`). |
| `pieza-obsoleta` | error | Clases de una pieza «Obsoleto». |
| `pieza-no-en-produccion` | aviso | Clases de una pieza en exploración o desarrollo. |
| `color-fuera-de-paleta` | aviso | Un color que no es ningún token. |

- **Contra qué compara.** Contra lo que sabe el sistema tras el último sync, no contra el CSS del repo: una variante que el agente define en su propio CSS sigue siendo una variante fuera del sistema. Las clases que no son de ninguna pieza documentada no se revisan.
- **Qué revisa.** Por defecto, solo las líneas que el cambio añade respecto a `origin/<rama>` (lo commiteado, lo pendiente y los archivos nuevos): lo que ya había lo recogen los hallazgos y `recomendar-produccion`. Con `--todo`, todo el repo; con rutas, esos archivos enteros. Sin tests ni compilados.
- **Desde dónde.** Desde el repo del sistema, `npx ds revisar` revisa su `produccion.repo`. Desde el repo de producción, sin instalar nada: `npx @imandresochoa/ds@<versión> revisar --sistema <url>/<id>/revisar.json` (o la ruta al repo del sistema). `design.md` lleva el comando con la versión fijada.
- **Salida.** `archivo:línea`, nivel, regla, mensaje y el siguiente paso; `--json` con los mismos campos. Sale con 1 si hay errores; los avisos no fallan.
- **Excepciones.** Un comentario `ds-revisar-ignorar` en la línea. Se acepta en la revisión del PR, no la decide el agente.
- Solo lee: no corrige el código.

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
| `inventariar-produccion` | Planificar qué documentar, con prioridades y tandas. Parte de la lista de la persona y de Figma, y usa `ds patrones` para las piezas repartidas en varias hojas. |
| `recomendar-produccion` | Recomendar mejoras para producción: valores escritos a mano que ya son tokens, copias de tokens, hojas que no se cargan, foco y contraste. Escribe `docs/RECOMENDACIONES.md`. |
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
