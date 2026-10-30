---
name: montar-sistema
description: Monta el sistema de diseño de un producto a partir de su repo, de su web o Figma, o desde cero, haciendo las preguntas con los componentes nativos del agente, y aplica los presets del Lab de primitivos. Úsala cuando pidan «monta el sistema de diseño», «crea el sistema de diseño de este producto», «empieza un design system», «aplica este preset del Lab» (`npx ds preset aplicar`), o cuando system.json conserve valores de la plantilla.
---

# Montar un sistema de diseño

Objetivo: un repo de sistema propio, creado junto al producto y nunca dentro de él, con un `DESIGN.md` honesto, los primeros tokens y un plan de fichas. Nada inventado: lo que no salga del código, de la web, de Figma o de la persona se marca «Pendiente».

## Cómo preguntar

- Pregunta con la herramienta de preguntas de tu entorno: `AskUserQuestion` en Claude Code y `request_user_input` en Codex.
- Pon como mucho 3 opciones por pregunta, con etiquetas cortas y la recomendada primero (añade «(recomendada)»). Junta en una sola llamada las preguntas que no dependen entre sí.
- Para respuestas libres (una ruta, una URL, una descripción), pregunta en un mensaje normal. Las herramientas de preguntas son para elegir.
- Si no tienes herramienta de preguntas o falla (en Codex solo funciona en modo Plan), pregunta en texto con opciones numeradas y espera la respuesta. No supongas.
- No preguntes lo que puedas comprobar tú: si estás en un repo, el stack, dónde están los estilos.

## 1. Mira dónde estás

- Si la carpeta ya tiene `system.json`, el sistema existe: ve directamente al paso 4 con su `origen` (`npx ds info --json`).
- Si es un repo con código de producto (`package.json`, `src/`, `app/`, hojas de estilo), es la candidata a producción.

## 2. ¿De dónde partimos?

Pregunta (cabecera «Origen»):

1. **De este repo** o **De un repo con código**: la recomendada si estás en uno. El sistema se enlaza con el código y se verifica con el sync.
2. **De una web o de Figma**: se extraen los primitivos de lo publicado. Sin repo no hay enlace con el código, de momento.
3. **De nada todavía**: se empieza por el criterio y unos primitivos de partida.

Después, en una sola tanda:

- **Repo**: la ruta, si no es la carpeta actual.
- **Web o Figma**: la URL. Pregunta también si hay un repo para enlazarlo después.
- **Nada**: qué es el producto, para quién es y qué tono tiene, en texto libre.
- **Siempre**:
  - El nombre del sistema. Propón el del producto.
  - La carpeta: `../<id>-design-system` (recomendada) u otra. Nunca dentro del repo del producto.

## 3. Crea el repo del sistema

```bash
npx ESPEC_DEL_KIT init "<Nombre>" --carpeta <carpeta> --desde <repo|web|figma|cero> [--produccion <ruta>] [--url <url>] --json
```

- `init` crea la carpeta, hace `git init`, instala el kit, copia la plantilla y las skills, y se niega a crear el sistema dentro de producción.
- Lee el JSON que devuelve y trabaja desde `sistema.carpeta`. A partir de aquí, usa `npx ds`.
- `npx ds info --json` te da la ruta de la metodología (`kit.metodologia`). Lee `08-nuevo-sistema.md` y `05-ficha.md`, y lee también el `AGENTS.md` del sistema.

## 4. Llénalo según el origen

### Desde un repo

1. **Estudia el producto**, solo leyendo:
   - El stack.
   - Las hojas de estilo globales y dónde viven los tokens (`:root`, modos como `.dark` o `[data-theme="dark"]`, `@theme` de Tailwind, archivos de variables).
   - Las partes con código propio que deban ser **superficies** distintas (por ejemplo, la web pública y el área de cliente).
   - La carpeta de componentes y, si existe, la guía de voz.
2. **Completa `system.json`**:
   - `descripcion`: una frase, con las palabras del producto.
   - `iniciales` y `color`: la marca del sistema en la cabecera.
   - `produccion.codigo`: URL base del repo, con `/blob/main/`.
   - `produccion.web`.
   - `superficies`, con sus `estilos`. Con Tailwind 4, añade `"tailwind": "<versión exacta>"`.
   - `"cobertura": true` en cada superficie: cuenta las clases sin documentar o, si es Tailwind, los componentes (añade `componentes` si no viven en `src/components`).
   - Si el sistema se va a publicar dentro de otro sitio, bajo una carpeta: `"publicacion": { "ruta": "/ds" }` (ver «Git, GitHub y entornos»).
3. `npx ds doctor` sin errores. Después, `npx ds sync`. Anota la cobertura (clases o componentes, y tokens sin documentar) y los modos que encontró (`modos de <superficie>` en la salida). Si el producto tiene modo oscuro y el sync no lo ve, revisa con qué selector lo activa y avisa.
4. Escribe `DESIGN.md` con las secciones de la plantilla, solo con lo que puedas comprobar. Los antipatrones van como borrador para que la persona los revise.
5. **Fichas de tokens**: una por grupo (color, tipografía, espaciado, radios, sombras, movimiento), con `nombre` y `rol`. Los valores los pone el sync, uno por modo si el producto tiene varios. El `rol` es el mismo en todos los modos.
6. **Plan de fichas** con la skill `inventariar-produccion`. No crees todas las fichas sin acordarlo.
7. **Auditoría diaria**: prográmala con la skill `auditar-sistema` (apartado «Rutina diaria») y anótalo en `AGENTS.md`.

### Desde una web o Figma

1. **Saca los primitivos de lo publicado**:
   - Web: las hojas de estilo enlazadas, `:root` y las variables CSS.
   - Figma: las variables y los estilos, con el MCP de Figma si está conectado.
   - Si no puedes acceder, dilo y pide una exportación. No adivines valores.
2. Escribe los primitivos como propiedades personalizadas en `experimental/tokens.css`:
   - Color, en pares de texto y fondo, en `:root` y, si hay modo oscuro, en `.dark`.
   - Tipografía, espaciado, radios, sombras y movimiento (duraciones y curvas).
   - Los valores van tal cual los encontraste, con los nombres del producto. Marca lo dudoso.
3. Crea las fichas de tokens en `exploracion`, con `nombre` y `rol`.
4. **Contraste.** Abre el Lab de primitivos (`npx ds dev` → `/<id>/lab`, pestaña «Ajustar tokens»): enseña el contraste de cada par. Si alguno no llega a AA, o si la persona quiere afinar un valor, lo ajusta ahí. Aplica lo que te pase con «Aplicar un preset del Lab».
5. Escribe `DESIGN.md` con lo que se ve. Lo demás, «Pendiente».
6. Si hay repo, enlázalo: completa `produccion` en `system.json` y sigue «Desde un repo» desde el paso 2.

### Desde cero

1. Escribe `DESIGN.md` con lo que te contaron: contexto, para quién, tono y prioridades.
2. **Primitivos de partida, con el Lab.** Pregunta (cabecera «Primitivos»):
   1. **Los ajusto en el Lab** (recomendada): arranca `npx ds dev` y pásale `http://localhost:4100/<id>/lab`. Ajusta color, texto, espaciado, radios, sombras y movimiento, y copia el enlace o «Copiar para tu agente».
   2. **Propónmelos tú**: escribe un preset en JSON con lo que te contaron (solo lo que cambia; el resto toma los valores por defecto), por ejemplo `{"color":{"marca":"#…","neutro":"#…"},"radio":6}`. Enséñalo con `npx ds preset ver '<json>'`, que también da el enlace para abrirlo en el Lab, y espera su visto bueno.
3. En los dos casos, sigue «Aplicar un preset del Lab». Los tokens llevan los nombres de shadcn.

## Aplicar un preset del Lab

El Lab de primitivos (`/<id>/lab` con `npx ds dev`, o «Nuevo» → «Lab de primitivos») ajusta color, texto, espaciado, radios, sombras y movimiento, y los enseña en claro y oscuro con el contraste de cada par. No escribe nada. El estado va en el enlace (`?preset=`), y «Copiar para tu agente» te lo pasa con un prompt. «Generar» crea los tokens desde unos pocos primitivos. «Ajustar tokens» cambia los que el sistema ya tiene, de producción o de `experimental/`.

1. **Léelo antes de escribir.** Ejecuta `npx ds preset ver "<enlace>"` y resume a la persona los valores, los ajustes a mano y el contraste. Si avisa de valores descartados, díselo: venían en el enlace y no eran válidos.
2. **Contraste.** El mínimo es 4,5:1 en los pares de texto y 3:1 en `--ring` sobre `--background`. Si un par que cambia el preset no llega:
   - El comando lo dice y propone el valor más cercano que llega.
   - **Pregunta** (cabecera «Contraste»): ajustarlo en el Lab con el botón «Ajustar» y copiar el enlace otra vez (recomendada), o aceptarlo tal cual.
   - Usa `--aceptar-contraste` solo si la persona lo acepta, y anótalo en la ficha de tokens.
   - Si un par ya estaba así y el preset no lo cambia, avísalo sin bloquear.
3. **Aplica** con `npx ds preset aplicar "<enlace>"`:
   - Escribe en `experimental/tokens.css`. Con «Ajustar tokens» sobre tokens de `experimental/`, cambia cada valor en la hoja que lo declara.
   - Nunca escribe en producción.
   - `--solo color,radios` aplica solo esos grupos sobre el preset que ya hay en el archivo.
   - No pisa un archivo que no generó el Lab. Pregunta antes de usar `--sobrescribir` o `--archivo <otro>.css`. `--archivo` siempre apunta dentro de `experimental/`.
4. **Fichas de tokens**, según el sistema:
   - **Sin producción** (desde una web, Figma o nada): una ficha por grupo en `content/tokens/` (color, tipografía, espaciado, radios, sombras, movimiento), con estado `exploracion`, y `nombre` y `rol` de cada token.
     - Un preset de «Generar» usa los nombres de shadcn: `background`, `foreground`, `primary`, `primary-foreground`, `muted`, `muted-foreground`, `border`, `ring`, `radius`, `spacing`, `text-base`, `shadow-md`, `duration-normal`, `ease-out`…
     - Los valores no se copian a la ficha: la ficha los lee de `experimental/` y los enseña en la columna «Experimental».
   - **Con producción**: el cambio es una **iniciativa**. Créala (o usa la que ya hay) con la skill `nueva-ficha`, añade `iniciativa: <slug>` a las fichas de tokens que cambian y anota en su «Exploración» qué cambia y por qué.
     - Los nombres son los del producto, nunca los de shadcn.
     - No toques el repo de producción ni cambies el estado de las fichas que ya están en `produccion`.
5. **Comprueba.** Con `npx ds dev`, abre las fichas de tokens. `npx ds preset resolver` da el enlace para volver a abrir en el Lab lo que hay en `experimental/tokens.css`.
6. **Llevarlo a producción no es parte de esta skill.** Lo hace una persona con un PR en el repo del producto (ver «Cómo sube una pieza a producción» en `03-estados.md`). Con Tailwind 4, los tokens con nombres de shadcn necesitan además su puente `@theme inline` (`--color-background: var(--background);`…) para que existan utilidades como `bg-background`.

## 5. Cierra

- Ejecuta `npx ds doctor` y, con repo, `npx ds sync` y `npx ds check`.
- Resume qué está hecho, qué queda pendiente y qué decisiones necesitan a la persona. Para verlo, `npx ds dev`.

## No hagas

- Escribir en el repo de producción, ni crear el sistema dentro de él.
- Aceptar huellas (`--accept`) de fichas que no has revisado.
- Usar `--aceptar-contraste`, `--sobrescribir` o `--archivo` sin preguntar.
- Inventar textos, valores o reglas, ni reescribir los textos del producto en los ejemplos.
- Instalar nada en la carpeta de usuario sin que te lo pidan.
