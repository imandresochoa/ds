---
name: revisar-sync
description: Interpreta el informe del sync con producción y propone qué fichas actualizar o aceptar. Úsala tras `ds sync`, cuando `ds check` falle o cuando pregunten «qué ha cambiado en producción».
---

# Revisar el enlace con producción

1. Ejecuta `npx ds sync` y lee `sync-report.json`.
2. Para cada ficha con estado distinto de `ok`:

| Estado | Qué significa | Qué hacer |
| --- | --- | --- |
| `nuevo` | Fuente declarada sin huella revisada. | Comprueba que la ficha describe el código real; si es así, acepta. |
| `desajuste` | Producción cambió desde la última revisión (`cambioDesde` indica el commit). | `git -C <repo de producción> log -p <cambioDesde>..origin/<produccion.rama> -- <fuente>` para ver el cambio (nunca `HEAD`: el sync compara con lo publicado, no con la copia local). Actualiza la ficha (reglas, ejemplos, variantes) y después acepta. |
| `ausente` | El archivo o una clase ya no existe. | Busca si se renombró o se eliminó. Corrige la ficha o pásala a `obsoleto`. Nunca aceptes una ausencia. |

3. **Clases inventadas** (`clasesInventadas`): cámbialas por clases reales o mueve el estilo a `experimental/`.
4. **Avisos**: estado `produccion` sin fuentes, o fuentes con estado distinto de `produccion`. Corrige el estado.
5. **Cobertura**: no es un error; es la lista de lo que falta documentar.
6. **Cambios sin commit** en producción: solo aparecen si el sync leyó la copia local (no existe `origin/<rama>`). Avisa de que la instantánea incluye trabajo no publicado.

Acepta ficha a ficha: `npx ds sync --accept <id>`. Usa `--accept all` solo si la persona lo pide y has revisado todas.

Termina con `npx ds check` y un resumen: qué cambió en producción, qué fichas actualizaste y qué queda pendiente.
