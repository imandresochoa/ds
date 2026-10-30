---
name: mejorar-kit
description: Lleva al kit (design-system-agentic-first-kit) una mejora de la interfaz, del CLI, de las skills o de la metodología detectada mientras se trabaja en un sistema. Úsala cuando algo del motor falle, falte o se quiera cambiar la interfaz.
---

# Mejorar el kit desde un sistema

Los repos de sistema no cambian el motor. Toda mejora se hace en el kit y vale para todos los sistemas.

1. **Localiza el kit en local.** Si `node_modules/design-system-agentic-first-kit` es un enlace (`ls -l`), ya apunta al checkout del kit. Si no, clónalo al lado (`git clone https://github.com/imandresochoa/design-system-agentic-first-kit`), ejecuta `npm install` dentro y enlázalo desde aquí: `npx ds enlazar <ruta al kit>`.
2. **Lee `AGENTS.md` del kit.** Regla principal: ningún producto en el kit. Si la mejora depende de un producto, hazla configurable en `system.json`.
3. **Rama en el kit**, cambio y pruebas: `npm run typecheck`, `npm run build` y `npx ds dev` desde este sistema para verlo con datos reales.
4. **Documenta**: si cambia el método, `docs/metodologia/` y una entrada en `docs/DECISIONES.md`. Si cambia el comportamiento, una línea en `CHANGELOG.md` y la versión en `package.json` (parche, menor o mayor).
5. **PR en el kit** con qué cambia y cómo se ha probado.
6. Cuando se fusione y se etiquete, actualiza este sistema (skill `actualizar-kit`).
