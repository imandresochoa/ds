---
name: montar-sistema
description: Monta el sistema de diseño de un producto a partir de su repo, de su web o Figma, o desde cero, haciendo las preguntas con los componentes nativos del agente. Úsala cuando pidan «monta el sistema de diseño», «crea el sistema de diseño de este producto», «empieza un design system» o cuando system.json conserve valores de la plantilla.
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
   - Color, en pares de texto y fondo con contraste AA.
   - Tipografía, espaciado, radios y sombras.
   - Los valores van tal cual los encontraste. Marca lo dudoso.
3. Crea las fichas de tokens en `exploracion`, con `nombre` y `rol`.
4. Escribe `DESIGN.md` con lo que se ve. Lo demás, «Pendiente».
5. Si hay repo, enlázalo: completa `produccion` en `system.json` y sigue «Desde un repo» desde el paso 2.

### Desde cero

1. Escribe `DESIGN.md` con lo que te contaron: contexto, para quién, tono y prioridades.
2. Propón unos primitivos de partida, pocos y con nombre de rol (color en pares AA, tipografía, espaciado, radios y sombras). Pide confirmación antes de escribirlos en `experimental/tokens.css` y en las fichas de tokens en `exploracion`.

## 5. Cierra

- Ejecuta `npx ds doctor` y, con repo, `npx ds sync` y `npx ds check`.
- Resume qué está hecho, qué queda pendiente y qué decisiones necesitan a la persona. Para verlo, `npx ds dev`.

## No hagas

- Escribir en el repo de producción, ni crear el sistema dentro de él.
- Aceptar huellas (`--accept`) de fichas que no has revisado.
- Inventar textos, valores o reglas, ni reescribir los textos del producto en los ejemplos.
- Instalar nada en la carpeta de usuario sin que te lo pidan.
