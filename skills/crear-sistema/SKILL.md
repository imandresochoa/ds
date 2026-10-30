---
name: crear-sistema
description: Adapta un repo de sistema de diseño recién creado con `ds init` a un producto real. Úsala cuando pidan «crea el sistema de diseño de X», «adapta este sistema a mi repo de producción» o cuando system.json conserve valores de la plantilla.
---

# Crear un sistema a partir de un repo de producción

Objetivo: dejar el sistema conectado a producción, con el primer sync hecho, un `DESIGN.md` honesto y un plan de fichas. No inventes nada: todo sale del repo de producción o se marca «Pendiente».

## Pasos

1. **Lee la metodología.** `node_modules/design-system-agentic-first-kit/docs/metodologia/08-nuevo-sistema.md` y `05-ficha.md`. Lee también `AGENTS.md` de este repo.
2. **Localiza producción.** Pregunta la ruta si no la sabes. Debe estar clonado en local; normalmente al lado de este repo.
3. **Estudia el producto** (solo lectura):
   - Stack y framework (`package.json`, configuración).
   - Hojas de estilo globales y dónde viven los tokens (`:root`, modos como `.dark` o `[data-theme="dark"]`, `@theme` de Tailwind, archivos de variables).
   - Partes con código propio que deban ser **superficies** distintas (por ejemplo, web pública y área de cliente).
   - Carpeta de componentes y guía de voz o de textos, si existe.
4. **Rellena `system.json`**: `nombre`, `descripcion` (una frase, con las palabras del propio producto), `iniciales` y `color` (la marca del sistema: la casilla central de la portada y la lámina de sus ilustraciones), `produccion.repo` (ruta relativa), `codigo` (URL base del repo en GitHub con `/blob/main/`), `web` y `superficies` con sus `estilos`. Si una superficie usa Tailwind 4, pon `"tailwind": "<versión exacta>"`. Marca `"cobertura": true` en cada superficie: cuenta las clases sin documentar o, si es Tailwind, los componentes (añade `componentes` si no viven en `src/components`). Si el sistema se va a publicar dentro de otro sitio, bajo una carpeta, añade `"publicacion": { "ruta": "/ds" }` (ver «Git, GitHub y entornos»).
5. **Comprueba**: `npx ds doctor` sin errores.
6. **Primer sync**: `npx ds sync`. Anota la cobertura (clases o componentes, y tokens sin documentar) y los modos que encontró (`modos de <superficie>` en la salida). Si el producto tiene modo oscuro y el sync no lo ve, revisa con qué selector lo activa y avisa.
7. **Escribe `DESIGN.md`** con las secciones de la plantilla. Solo lo que puedas comprobar en el código; lo demás, «Pendiente». Los antipatrones se proponen como borrador para que la persona los revise.
8. **Fichas de tokens**: una por grupo (color, tipografía, radios, sombras, movimiento, maquetación) con `nombre` y `rol` de cada token. Los valores no se escriben: los pone el sync, uno por modo si el producto tiene varios. El `rol` es el mismo en todos los modos.
9. **Plan de fichas**: usa la skill `inventariar-produccion` y entrega la lista priorizada. No crees todas las fichas sin acordarlo.
10. **Programa la auditoría diaria**: skill `auditar-sistema`, apartado «Rutina diaria». Anótalo en `AGENTS.md`.
11. **Cierra**: `npx ds sync`, `npx ds check`, y resume qué está hecho, qué queda pendiente y qué decisiones necesitan a la persona.

## No hagas

- Modificar el repo de producción.
- Aceptar huellas (`--accept`) de fichas que no has revisado.
- Reescribir textos del producto en los ejemplos.
