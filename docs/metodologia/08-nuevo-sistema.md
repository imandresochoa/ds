---
titulo: Crear un sistema nuevo
resumen: Cómo aplicar esta estructura a cualquier producto, paso a paso, con o sin agente.
---

Un sistema de diseño es un **repo propio** que solo contiene contenido. La interfaz, los scripts y esta metodología vienen del kit como dependencia (ver «Kit y sistemas»). Crear uno nuevo es instalar el kit, ejecutar `ds init` y rellenar.

La metodología es documentación interna. Un sistema para un cliente no la muestra: en `system.json`, `"metodologia": false` (es el valor de la plantilla). Solo los sistemas propios del estudio la activan.

## Antes de empezar

- El repo de producción del producto clonado en local. El sistema lo lee por ruta relativa; no se modifica.
- Node 20.9 o superior y acceso de lectura al repo del kit.

## Pasos

1. **Crea el repo del sistema** junto al de producción (por ejemplo, `producto/` y `producto-design-system/` en la misma carpeta):

   ```bash
   mkdir producto-design-system && cd producto-design-system
   git init && npm init -y
   npm install github:USUARIO/design-system-agentic-first-kit
   npx ds init "Nombre del producto"
   ```

   `ds init` crea `system.json`, `DESIGN.md`, `AGENTS.md`, `CLAUDE.md`, `.gitignore`, una ficha de ejemplo, los scripts de `package.json` y las skills en `.claude/skills/`.

2. **Conecta producción.** En `system.json`, rellena `produccion.repo` (ruta relativa al repo del producto), `codigo` (URL base para ver archivos), `web` y las **superficies**: cada parte del producto con su propio código y sus hojas de estilo. Comprueba con `npx ds doctor`.
3. **Primer sync.** `npx ds sync`. Ya tienes la instantánea del CSS, los tokens de producción y la lista de clases sin documentar (cobertura).
4. **DESIGN.md.** Contexto del producto, orden de prioridades, integración, lenguaje visual, antipatrones con nombre y accesibilidad. Es lo primero que lee un agente.
5. **Rellena por capas**, siguiendo la cobertura: fundamentos, tokens (los valores salen solos), componentes, bloques y gráficos. Cada ficha sigue «Anatomía de una ficha».
6. **Revisa y acepta huellas**: `npx ds sync --accept <id>` por cada ficha revisada. `npx ds check` debe pasar.
7. **Publica**: `npx ds build` deja el sitio estático en `out/`. Si va dentro de otro sitio, bajo una carpeta, declara antes la ruta en `publicacion.ruta` (ver «Git, GitHub y entornos»).

Con un agente, los pasos 2 a 6 los guía la skill `crear-sistema`: pídele «adapta este sistema a mi repo de producción».

## Qué no se toca en un repo de sistema

- El motor (interfaz, scripts, metodología). Si un sistema necesita algo nuevo, se añade al kit para todos (skill `mejorar-kit`).
- Los archivos generados por el sync (`produccion/`, `tokens.produccion.json`, `sync-report.json`).

## Orden recomendado de relleno

Fundamentos → tokens → átomos → moléculas → organismos → bloques. Cada capa usa la anterior, así que documentarlas en orden evita fichas que hablan de piezas que aún no existen. Si hay prisa por enseñar algo, empieza por el componente más usado (normalmente el botón) y completa sus tokens.
