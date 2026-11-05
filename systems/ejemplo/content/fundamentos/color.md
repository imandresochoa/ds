---
titulo: Color
resumen: Neutros en pares de fondo y texto, con modo claro y oscuro. El color con tono se reserva para el estado.
estado: produccion
grupo: Base
creado: 2026-11-05
actualizado: 2026-11-05
tokens:
  - nombre: background
    rol: El fondo de la página.
  - nombre: foreground
    rol: El texto sobre el fondo.
  - nombre: card
    rol: El fondo de las tarjetas.
  - nombre: card-foreground
    rol: El texto dentro de una tarjeta.
  - nombre: popover
    rol: El fondo de menús, diálogos y tarjetas flotantes.
  - nombre: popover-foreground
    rol: El texto dentro de un menú o un diálogo.
  - nombre: primary
    rol: La acción principal y los titulares.
  - nombre: primary-foreground
    rol: El texto sobre `primary`.
  - nombre: secondary
    rol: Las acciones y etiquetas secundarias.
  - nombre: secondary-foreground
    rol: El texto sobre `secondary`.
  - nombre: muted
    rol: Fondos discretos (teclas, listas de pestañas, avisos).
  - nombre: muted-foreground
    rol: El texto secundario (resúmenes, metadatos).
  - nombre: accent
    rol: El fondo al pasar el ratón o de un elemento activo.
  - nombre: accent-foreground
    rol: El texto sobre `accent`.
  - nombre: destructive
    rol: Lo que borra o falla.
  - nombre: border
    rol: Los bordes y separadores.
  - nombre: input
    rol: El borde de los campos.
  - nombre: ring
    rol: El anillo de foco.
  - nombre: surface
    rol: Las franjas de fondo suave (el pie de un ejemplo, la barra de código).
  - nombre: surface-foreground
    rol: El texto sobre `surface`.
  - nombre: code
    rol: El fondo de los bloques de código.
  - nombre: code-foreground
    rol: El texto de los bloques de código.
  - nombre: selection
    rol: El fondo del texto seleccionado.
  - nombre: selection-foreground
    rol: El texto seleccionado.
relacionados: [fundamentos/estados]
---

La interfaz es en blanco y negro. Cada color va en un par: el fondo (`primary`) y el texto que va encima (`primary-foreground`). Así el contraste se decide una vez, en el token, y no en cada pieza. Los valores están en `oklch` y cambian con el modo: `:root` es el claro y `.dark`, el oscuro.

```html preview
<div class="grid grid-cols-2 gap-3 text-xs font-medium sm:grid-cols-4">
  <div class="flex h-16 w-28 items-end rounded-lg border bg-background p-2 text-foreground">background</div>
  <div class="flex h-16 w-28 items-end rounded-lg bg-primary p-2 text-primary-foreground">primary</div>
  <div class="flex h-16 w-28 items-end rounded-lg bg-secondary p-2 text-secondary-foreground">secondary</div>
  <div class="flex h-16 w-28 items-end rounded-lg bg-muted p-2 text-muted-foreground">muted</div>
  <div class="flex h-16 w-28 items-end rounded-lg bg-accent p-2 text-accent-foreground">accent</div>
  <div class="flex h-16 w-28 items-end rounded-lg bg-surface p-2 text-surface-foreground">surface</div>
  <div class="flex h-16 w-28 items-end rounded-lg bg-destructive p-2 text-white">destructive</div>
  <div class="flex h-16 w-28 items-end rounded-lg border-2 border-ring bg-background p-2 text-foreground">ring</div>
</div>
```

## Reglas

| Regla | Cómo se comprueba |
| --- | --- |
| Un fondo va siempre con su `-foreground`. | Ninguna pieza pone `bg-primary` con un texto que no sea `text-primary-foreground`. |
| Los colores se escriben con tokens, nunca con valores. | No hay `oklch(…)` ni hexadecimales fuera de `app/globals.css`. |
| El color con tono es para el estado. | Solo `destructive` y los tokens de [Estados](/ejemplo/fundamentos/estados) tienen croma. |
| Lo secundario se rebaja con `muted-foreground`, no con opacidad. | Los resúmenes y metadatos usan `text-muted-foreground`. |

## Antipatrones

- **Un acento de marca.** La interfaz enseña sistemas de otros; un color propio competiría con sus ejemplos.
- **Gris a mano.** `text-neutral-500` se ve igual en claro, pero no cambia en oscuro.
- **Opacidad para jerarquía.** `opacity-60` también apaga los iconos y los bordes.

## Accesibilidad

- `foreground` sobre `background` y `primary-foreground` sobre `primary` superan 4,5:1 en los dos modos.
- `muted-foreground` es solo para texto secundario: no lleva información que no esté en otra parte.

## Tokens

Salen de `app/globals.css`. Tailwind los expone como utilidades a través de `@theme inline` (`--color-primary: var(--primary)` da `bg-primary`).
