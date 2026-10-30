---
name: actualizar-kit
description: Actualiza el kit (design-system-agentic-first-kit) en un repo de sistema de diseño y revisa qué cambia. Úsala cuando pidan «actualiza el kit», «trae las mejoras del sistema» o al ver una versión nueva.
---

# Actualizar el kit

1. Versión actual: `npx ds version`. Versiones disponibles: `git ls-remote --tags https://github.com/imandresochoa/design-system-agentic-first-kit`.
2. Lee el `CHANGELOG.md` del kit entre la versión actual y la nueva. Si hay una versión mayor, lee su guía de migración antes de instalar.
3. Instala: `npm install github:imandresochoa/design-system-agentic-first-kit#vX.Y.Z`.
4. `npx ds skills` para actualizar las skills.
5. `npx ds doctor`, `npx ds sync`, `npx ds check` y `npx ds build`.
6. Si hay migraciones, aplícalas a las fichas o a `system.json` en el mismo commit.
7. Resume qué ha cambiado para este sistema y qué conviene revisar en la interfaz.

Si el kit está enlazado en local (`npm link`), no hay que actualizar: ya usa el código del kit.
