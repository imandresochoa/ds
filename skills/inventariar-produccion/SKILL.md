---
name: inventariar-produccion
description: Recorre el repo de producción y entrega un inventario priorizado de lo que falta documentar en el sistema de diseño (componentes, patrones, fundamentos y tokens). Úsala para planificar el relleno de un sistema o cuando pregunten «qué nos falta».
---

# Inventario de producción

Solo lectura. El resultado es un plan, no fichas.

1. `npx ds sync` y lee `sync-report.json` → `cobertura` (clases o componentes, y tokens sin documentar, por superficie).
2. Recorre producción por superficie:
   - **Componentes**: carpeta de componentes (por ejemplo `src/components/`; en superficies Tailwind, `cobertura` ya lista los archivos sin ficha) y familias de clases del CSS (prefijos comunes: `btn-*`, `card-*`).
   - **Patrones**: secciones de página, pantallas y flujos (rutas de la app, bloques `<section>` de la web).
   - **Fundamentos**: tipografía, color, espaciado, iconografía, movimiento, voz (busca guías en `docs/`).
3. Cruza con las fichas existentes (`content/`) para no repetir.
4. Para cada pieza: nombre propuesto, sección, `funcion` y `nivel`, fuente en producción, clases principales, **uso** (cuántas páginas o archivos la usan: `grep -rl`) y dependencias (qué otras piezas usa).
5. Prioriza: primero lo más usado y lo que otras piezas necesitan (átomos antes que organismos), después lo visible en las páginas principales.

## Entrega

Un archivo `docs/INVENTARIO.md` en este repo con:

- Resumen de cobertura actual.
- Tabla por superficie: pieza, sección, función, nivel, fuente, uso, prioridad (P1, P2, P3).
- Tandas propuestas de 4 a 6 fichas, en orden.
- Dudas que necesitan a la persona (por ejemplo, piezas duplicadas entre superficies).
