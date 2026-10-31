---
name: inventariar-produccion
description: Recorre el repo de producción y entrega un inventario priorizado de lo que falta documentar en el sistema de diseño (componentes, bloques, gráficos, fundamentos y tokens). Úsala para planificar el relleno de un sistema o cuando pregunten «qué nos falta».
---

# Inventario de producción

Solo lectura. El resultado es un plan, no fichas.

1. **Parte de la lista que ya existe.** Antes de deducir nada, busca las piezas que ya tienen nombre:
   - La lista de piezas que haya dado la persona (en la conversación, en `DESIGN.md` o en `docs/`).
   - Los componentes con nombre de Figma, si el sistema tiene un archivo de Figma (con el MCP de Figma si está conectado, o la lista que dejó `montar-sistema`).

   Esos nombres mandan: cada uno es una pieza del inventario aunque en producción no tenga carpeta ni prefijo propio. Lo que sigue sirve para encontrar dónde vive cada una y lo que falta en la lista.
2. `npx ds sync` y lee `sync-report.json` → `cobertura` (clases o componentes, y tokens sin documentar, por superficie).
3. Recorre producción por superficie:
   - **Componentes**: carpeta de componentes (por ejemplo `src/components/`; en superficies Tailwind, `cobertura` ya lista los archivos sin ficha) y familias de clases del CSS (prefijos comunes: `btn-*`, `card-*`).
   - **Formas compartidas**: `npx ds patrones` (con `--json` para leerlo entero). Agrupa clases de hojas y prefijos distintos que comparten firma: el mismo radio, la misma sombra, el mismo fondo o borde, los mismos `var(--token)`. Encuentra las piezas que el producto repite sin una carpeta común, como una tarjeta escrita cuatro veces con cuatro prefijos. Cada grupo es una candidata, no una pieza: abre las clases y decide si son la misma pieza, variantes de una o una coincidencia (un radio de 50 % en un avatar y en un punto). Un grupo marcado como «variante» de otro es la misma forma con más rasgos en común; suele ser el núcleo de la pieza.
   - **Bloques**: secciones de página, pantallas y flujos (rutas de la app, bloques `<section>` de la web).
   - **Gráficos**: visualizaciones de datos (librería de gráficos, `<svg>` o `<canvas>` con datos).
   - **Fundamentos**: tipografía, color, espaciado, iconografía, movimiento, voz (busca guías en `docs/`).
4. Cruza con las fichas existentes (`content/`) para no repetir.
5. Para cada pieza: nombre propuesto (el de la persona o el de Figma, si lo hay), sección, `funcion` y `nivel` (componentes) o `categoria` (bloques y gráficos), fuente en producción, clases principales (todas las de un grupo de `ds patrones` si es una pieza repartida), **uso** (cuántas páginas o archivos la usan: `grep -rl`) y dependencias: los ids de las piezas que compone, que irán en `usa`.
6. Prioriza: primero las piezas de la lista de la persona y de Figma, después lo más usado y lo que otras piezas necesitan (átomos antes que organismos) y por último lo visible en las páginas principales. Una forma que cruza muchas hojas pesa como una pieza muy usada.

## Entrega

Un archivo `docs/INVENTARIO.md` en este repo con:

- Resumen de cobertura actual.
- Tabla por superficie: pieza, sección, función, nivel o categoría, fuente, uso, prioridad (P1, P2, P3). Las piezas que salen de `ds patrones` llevan sus clases y sus hojas.
- Tandas propuestas de 4 a 6 fichas, en orden.
- Dudas que necesitan a la persona: piezas duplicadas entre superficies, grupos de `ds patrones` que no sabes si son una pieza, y nombres de la lista o de Figma que no encuentras en producción.
