---
name: recomendar-produccion
description: Revisa el código de producción contra su propio sistema y entrega un documento de recomendaciones para mejorar producción (valores escritos a mano que ya son tokens, copias de tokens, hojas que no se cargan, accesibilidad, piezas duplicadas). Úsala al montar un sistema, después de una auditoría o cuando pregunten «qué podemos mejorar en producción».
---

# Recomendaciones para producción

Solo lectura. El resultado es un documento para personas, no cambios: cada recomendación la lleva a producción una persona con un PR en el repo del producto. No es el inventario: `docs/INVENTARIO.md` dice qué falta documentar en el sistema; este documento dice qué mejorar en producción para que use mejor su propio sistema.

## 1. Lo mecánico, del sync

`npx ds sync` y lee `sync-report.json` → `hallazgos`:

| Hallazgo | Qué es | Recomendación habitual |
| --- | --- | --- |
| `superficies.<id>.valoresSueltos` | Un color o un valor compuesto (sombra, pila de fuentes, curva) escrito a mano que ya es un token. `tokens` dice cuál, con el modo si solo lo vale en uno. | Usar `var(--token)`. Si el valor coincide con dos tokens, elige por el rol (texto o fondo) y por el modo del selector. |
| `superficies.<id>.copiasDeTokens` | Una propiedad personalizada fuera de `:root` y de los modos que repite el valor de un token. | Que apunte al token (`--copia: var(--token)`) o quitarla y usar el token. |
| `superficies.<id>.tokensSinUso` | Tokens que nada referencia, ni el CSS ni el código (sin contar los tests). | Quitarlos, o usarlos donde ahora hay valores sueltos. |
| `hojasSinCargar` | Hojas del repo que ninguna superficie carga y que nada importa, o que solo importan los tests. | Confirmar con `git log` cuándo se dejó de cargar y borrarla, o volver a cargarla si se perdió por error. |

Comprueba cada hallazgo en el código antes de recomendarlo: el sync compara valores, no intenciones. Un `#fff` sobre una foto puede no ser `--background`; descártalo y di por qué.

## 2. Lo que pide criterio

Recorre producción y añade lo que el sync no ve:

- **Accesibilidad**: elementos interactivos sin estilo de foco (`:focus-visible`), pares de texto y fondo por debajo de 4,5:1 (3:1 en texto grande y en bordes de controles), animaciones sin `prefers-reduced-motion`.
- **Piezas casi duplicadas**: la misma forma con clases distintas (por ejemplo, cinco clases de píldora). Recomienda unificarlas en una pieza con variantes.
- **Valores casi iguales**: radios de 6, 7 y 8px, o grises muy próximos. Recomienda una escala o un token.
- **Superficies sin tokens**: valores fijos donde otra superficie tiene tokens para lo mismo.
- **Tokens que no describen su rol** (`--blue` que ya es verde) o roles sin token.

No inventes problemas para llenar el documento. Si producción está bien en algo, no lo menciones.

## 3. Prioriza

- **P1**: afecta a accesibilidad, o a muchos sitios a la vez (un token copiado en diez hojas).
- **P2**: deuda que hace que un cambio de token no llegue a todas partes.
- **P3**: limpieza (tokens sin uso, hojas muertas).

El esfuerzo, en tres niveles: bajo (sustituir valores), medio (tocar varias hojas o componentes), alto (unificar piezas o rediseñar una escala).

## Entrega

Un archivo `docs/RECOMENDACIONES.md` en este repo, en el idioma de la persona y sin jerga:

- Fecha y commit de producción (`sync-report.json` → `commit`, `fechaCommit`).
- Resumen: cuántas recomendaciones hay por prioridad y las tres que más rinden.
- Una entrada por recomendación, agrupando los sitios de un mismo arreglo:
  - **Qué** y **por qué**, en una o dos frases.
  - **Dónde**: `archivo:línea` de cada sitio (o los primeros y cuántos más).
  - **Propuesta**: el cambio concreto (`#0a0a0a` → `var(--site-bg)`).
  - Prioridad y esfuerzo.
- Lo descartado, si algo del sync no era un problema, en una línea cada uno.

Si el documento ya existe, actualízalo: quita lo que producción ya arregló y marca lo nuevo.

## No hagas

- Cambiar nada en el repo de producción, ni abrir PRs allí.
- Copiar las listas del sync sin revisarlas.
- Mezclarlo con el inventario o con las fichas: las recomendaciones no cambian el estado de ninguna ficha.
