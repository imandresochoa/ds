---
titulo: El estado nunca va solo con color
resumen: Cada punto de estado va con su palabra. El color ayuda a escanear; la palabra es la que informa.
estado: aceptada
fecha: 2026-11-05
decide: Andrés
afecta: [componentes/punto-de-estado, fundamentos/estados]
---

## Contexto

Los seis tonos de estado se distinguen mal entre sí con poca visión del color y en pantallas con poco contraste. Un punto sin texto obliga a recordar qué significa cada color.

## Decisión

El punto de estado siempre va acompañado de la etiqueta del estado. El punto es `aria-hidden`: lo que lee un lector de pantalla es la palabra.

## Consecuencias

- Las listas y las tarjetas ocupan algo más de ancho.
- Añadir un estado nuevo exige nombrarlo, no solo darle un color.

## Alternativas

- **Solo el punto, con el texto al pasar el ratón**: más limpio, pero no funciona en táctil ni con lector de pantalla.
