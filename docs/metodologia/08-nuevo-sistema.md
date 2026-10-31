---
titulo: Crear un sistema nuevo
resumen: Cómo aplicar esta estructura a cualquier producto, paso a paso, con o sin agente.
---

Un sistema de diseño es un **repo propio** que solo contiene contenido. La interfaz, los scripts y esta metodología vienen del kit como dependencia (ver «Kit y sistemas»). Crear uno nuevo es instalar el kit, ejecutar `ds init` y rellenar.

El sitio de un sistema solo muestra esta metodología si la activa: en `system.json`, `"metodologia": true`. La plantilla la trae apagada, porque el sitio de un producto es para quien lo usa, no para quien construye el sistema.

## Antes de empezar

- Si partes de un repo: el repo de producción clonado en local. El sistema lo lee por ruta relativa y no lo modifica.
- Node 20.9 o superior.

## Con un agente

```bash
npx @imandresochoa/ds@latest instalar
```

Instala la skill `montar-sistema` para Claude Code y Codex en tu carpeta de usuario. Después, abre el agente en el repo del producto (o en una carpeta vacía) y escribe «monta el sistema de diseño». La skill:

1. Pregunta **de dónde partís**: de un repo con código, de una web o de Figma, o de nada todavía. Lo hace con los componentes de preguntas del agente (ver «Capa para agentes»).
2. Pide lo que falte según la respuesta (la ruta, la URL o qué es el producto), el nombre y la carpeta. Por defecto, `../<producto>-design-system`.
3. Crea el repo del sistema con `ds init`, que se niega a hacerlo dentro de producción.
4. Lo llena según el origen:
   - **Repo**: superficies, primer sync, `DESIGN.md`, fichas de tokens y plan de fichas.
   - **Web o Figma**: primitivos sacados de lo publicado, en exploración.
   - **Nada**: `DESIGN.md` con lo que cuentes y unos primitivos de partida, que ajustas en el Lab de primitivos.

## Sin agente

```bash
npx @imandresochoa/ds@latest init
```

`ds init` hace las mismas preguntas en la terminal (o las toma de `--desde repo|web|figma|cero`, `--produccion <ruta>`, `--url <url>` y `--carpeta <ruta>`) y crea el repo del sistema: `system.json`, `DESIGN.md`, `AGENTS.md`, `CLAUDE.md`, `.gitignore`, una ficha de ejemplo, los scripts de `package.json`, el kit instalado y las skills en `.claude/skills/` y `.agents/skills/`. Después, a mano:

1. **Conecta producción.** Si partiste de una web, de Figma o de nada, `produccion` es `null`: créalo entero (`repo`, `rama`, `codigo`, `web` y `superficies`) cuando haya repo (ver «Plataformas y superficies»). En `system.json`, rellena `produccion.codigo` (URL base para ver archivos), `web` y las **superficies**: cada parte del producto con su propio código y sus hojas de estilo. Comprueba con `npx ds doctor`.
2. **Primer sync.** `npx ds sync`. Ya tienes la instantánea del CSS, los tokens de producción y la lista de clases sin documentar (cobertura).
3. **DESIGN.md.** Contexto del producto, orden de prioridades, integración, lenguaje visual, antipatrones con nombre y accesibilidad. Es lo primero que lee un agente.
4. **Rellena por capas**, siguiendo la cobertura: fundamentos, tokens (los valores salen solos), componentes, bloques y gráficos. Cada ficha sigue «Anatomía de una ficha».
5. **Revisa y acepta huellas**: `npx ds sync --accept <id>` por cada ficha revisada. `npx ds check` debe pasar.
6. **Publica**: `npx ds build` deja el sitio estático en `out/`. Si va dentro de otro sitio, bajo una carpeta, declara antes la ruta en `publicacion.ruta` (ver «Git, GitHub y entornos»).

## Primitivos con el Lab

Si partes de una web, de Figma o de nada, ajusta los primitivos en el Lab: `npx ds dev` y, en la cabecera, «Nuevo» → «Lab de primitivos» (`/<sistema>/lab`).

1. En «Generar», elige neutro, marca y error, las familias y la escala de texto, la unidad de espaciado, el radio base, las sombras y el movimiento (duración base, su escala y una familia de curvas). Cada par de color enseña su contraste en claro y oscuro.
2. Si un par no llega a AA (4,5:1 en texto, 3:1 en el anillo de foco), el Lab lo dice y «Ajustar» lo lleva al valor más cercano que llega.
3. «Copiar para tu agente» le pasa el preset y la skill `montar-sistema` lo aplica. Sin agente: «Copiar enlace» y `npx ds preset aplicar "<enlace>"`.
   - El preset se escribe en `experimental/tokens.css`, nunca en producción.
   - Si un par que cambia el preset no llega a AA, no se escribe nada, salvo con `--aceptar-contraste`. Ese paso lo decide una persona.
   - Un archivo que no generó el Lab no se pisa, salvo con `--sobrescribir`.
4. Crea las fichas de tokens en `content/tokens/`, con estado `exploracion`, `nombre` y `rol`. Los valores los leen de `experimental/`.

`npx ds preset resolver` devuelve el enlace para volver a abrir en el Lab lo que hay en `experimental/tokens.css`.

Con un producto que ya existe, el Lab abre sus tokens en «Ajustar tokens». Lo que cambies va a `experimental/` dentro de una iniciativa. Producción no cambia hasta que una persona lleve el cambio con un PR.

## Qué no se toca en un repo de sistema

- El motor (interfaz, scripts, metodología). Si un sistema necesita algo nuevo, se añade al kit para todos (skill `mejorar-kit`).
- Los archivos generados por el sync (`produccion/`, `tokens.produccion.json`, `sync-report.json`).
- Las skills (`.claude/skills/` y `.agents/skills/`): se actualizan con `npx ds skills`.

El resto de `system.json`: `iniciales` y `color` son la marca del sistema en la cabecera; `metodologia: true` muestra esta metodología en el sitio; `abrirEnAgentes: true` añade «Abrir en Claude» y «Abrir en ChatGPT» a «Copiar página», que envían la URL de la página a ese servicio; `idiomas` (por defecto `["es"]`) añade una traducción al inglés bajo `/en/` (ver «Idiomas y traducciones» en `05-ficha.md`).

## Orden recomendado de relleno

Fundamentos → tokens → átomos → moléculas → organismos → bloques. Cada capa usa la anterior, así que documentarlas en orden evita fichas que hablan de piezas que aún no existen. Si hay prisa por enseñar algo, empieza por el componente más usado (normalmente el botón) y completa sus tokens.
