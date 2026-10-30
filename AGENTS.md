# AGENTS.md — kit

Guía para agentes que trabajan en el **kit**: el motor común de los sistemas de diseño. Léela entera antes de cambiar nada. Si estás en el repo de un sistema (tiene `system.json` en la raíz), la guía es su propio `AGENTS.md`, no esta.

## Qué es

El kit contiene la interfaz (al estilo de Codex), el CLI `ds`, los scripts de sync y publicación, la plantilla de sistemas, las skills y la metodología. Cada sistema de diseño vive en su propio repo, solo con contenido, y usa el kit como dependencia. La metodología (`docs/metodologia/`) es la fuente de verdad sobre cómo se trabaja; es interna y solo se publica en sistemas con `"metodologia": true`.

## Mapa

| Ruta | Qué hay |
| --- | --- |
| `bin/ds.mjs` | CLI: `init`, `dev`, `build`, `sync`, `check`, `skills`, `doctor`. |
| `lib/core.mjs` | Lee sistemas y fichas. `DS_SISTEMAS` apunta a repos externos; sin ella, `systems/`. |
| `lib/meta.mjs` | Secciones, estados, grupos y prompts de acción. |
| `app/`, `components/` | Interfaz. `app/shell.css` tiene todos los tokens `--ds-*`. |
| `scripts/` | `sync-production.mjs`, `build-public.mjs`, `doctor.mjs`. |
| `plantilla/` | Lo que `ds init` copia a un repo de sistema. Usa `NOMBRE_DEL_SISTEMA` e `ID_DEL_SISTEMA`. |
| `skills/` | Skills que `ds init` y `ds skills` instalan en cada sistema. |
| `systems/ejemplo/` | Sistema de ejemplo para desarrollar sin datos reales. |
| `docs/metodologia/` | La metodología. `docs/DECISIONES.md`, `docs/TAREAS.md`. |

## Reglas

1. **Ningún producto en el kit.** Ni nombres, ni textos, ni colores de un cliente. Los ejemplos usan contenido provisional.
2. **Lo que cambia, cambia para todos.** Una función nueva funciona en cualquier sistema o se activa por configuración en `system.json`.
3. **Compatibilidad.** No rompas fichas ni `system.json` existentes sin subir la versión mayor y escribir la migración en `CHANGELOG.md`.
4. **Documenta el método.** Si cambia cómo se trabaja, actualiza `docs/metodologia/` y añade una entrada con fecha a `docs/DECISIONES.md` (no reescribas entradas antiguas).
5. **Las skills y la plantilla siguen la metodología.** Si cambias una, revisa las otras.

## Comandos

```bash
npm run dev          # http://localhost:4100 con systems/ejemplo
npm run typecheck
npm run build
```

Para probar con un sistema real: `npx ds enlazar <ruta a este kit>` desde el sistema y luego `npx ds dev`. No arranques a la vez `npm run dev` aquí y `ds dev` enlazado: comparten la carpeta `.next`.

Antes de terminar: `npm run typecheck`, `npm run build` y, si tocaste el CLI o la plantilla, un `ds init` en una carpeta vacía.
