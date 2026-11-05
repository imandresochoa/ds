---
titulo: Estados
resumen: Seis tonos que resumen el estado de una ficha y su enlace con producción en un punto de color.
estado: produccion
grupo: Base
creado: 2026-11-05
actualizado: 2026-11-05
tokens:
  - nombre: estado-ok
    rol: En producción y sincronizada.
  - nombre: estado-aviso
    rol: Hay que revisarla (pendiente de verificar o cambió en producción).
  - nombre: estado-error
    rol: Declara algo que ya no existe en producción.
  - nombre: estado-desarrollo
    rol: En desarrollo.
  - nombre: estado-exploracion
    rol: En exploración.
  - nombre: estado-obsoleto
    rol: Obsoleta o sin iniciar.
  - nombre: nuevo
    rol: Lo que acaba de llegar al sistema.
relacionados: [fundamentos/color, componentes/punto-de-estado]
---

El único color con tono de la interfaz. Cada estado de la metodología tiene el suyo, y el kit elige cuál toca a partir del estado de la ficha y del último sync.

```html preview
<div class="grid gap-2 text-sm">
  <span class="inline-flex items-center gap-1.5"><span class="inline-flex size-2 rounded-full bg-estado-ok"></span>En producción</span>
  <span class="inline-flex items-center gap-1.5"><span class="inline-flex size-2 rounded-full bg-estado-aviso"></span>Pendiente de verificar</span>
  <span class="inline-flex items-center gap-1.5"><span class="inline-flex size-2 rounded-full bg-estado-error"></span>No está en producción</span>
  <span class="inline-flex items-center gap-1.5"><span class="inline-flex size-2 rounded-full bg-estado-desarrollo"></span>En desarrollo</span>
  <span class="inline-flex items-center gap-1.5"><span class="inline-flex size-2 rounded-full bg-estado-exploracion"></span>Exploración</span>
  <span class="inline-flex items-center gap-1.5"><span class="inline-flex size-2 rounded-full bg-estado-obsoleto"></span>Obsoleto</span>
</div>
```

## Reglas

| Regla | Cómo se comprueba |
| --- | --- |
| El tono nunca va solo: lleva el nombre del estado al lado o en `sr-only`. | Cada punto tiene un texto visible o para lectores de pantalla. |
| Los tonos de estado no decoran. | `bg-estado-*` solo aparece en `StatusBadge.tsx` y en el Lab. |
| `nuevo` marca lo reciente, no un estado. | Solo lo usan el aviso de la portada y la píldora «Nuevo» de las tarjetas. |

## Antipatrones

- **Semáforo sin texto.** Un punto verde no dice nada a quien no distingue el verde.
- **Píldoras de colores.** El estado va en un punto pequeño; una píldora de color pesa más que el ejemplo.

## Tokens

Salen de `app/globals.css`, con un valor más claro en modo oscuro para mantener el contraste.
