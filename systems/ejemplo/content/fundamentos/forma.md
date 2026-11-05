---
titulo: Forma
resumen: Un radio base del que salen todos los demás. Las piezas pequeñas son más cuadradas que las grandes.
estado: produccion
grupo: Base
creado: 2026-11-05
actualizado: 2026-11-05
tokens:
  - nombre: radius
    rol: El radio base. Cambiarlo cambia toda la escala.
  - nombre: radius-sm
    rol: Teclas y piezas de menos de 24 px.
  - nombre: radius-md
    rol: Botones, campos y pestañas.
  - nombre: radius-lg
    rol: Listas de pestañas y menús.
  - nombre: radius-xl
    rol: Tarjetas y marcos de los ejemplos.
  - nombre: radius-2xl
    rol: Superficies grandes.
  - nombre: radius-3xl
    rol: Superficies a pantalla completa.
---

```html preview
<div class="flex items-end gap-4 text-xs text-muted-foreground">
  <div class="grid justify-items-center gap-2"><div class="size-10 rounded-sm border bg-muted"></div>sm</div>
  <div class="grid justify-items-center gap-2"><div class="size-12 rounded-md border bg-muted"></div>md</div>
  <div class="grid justify-items-center gap-2"><div class="size-14 rounded-lg border bg-muted"></div>lg</div>
  <div class="grid justify-items-center gap-2"><div class="size-16 rounded-xl border bg-muted"></div>xl</div>
  <div class="grid justify-items-center gap-2"><div class="size-20 rounded-2xl border bg-muted"></div>2xl</div>
</div>
```

## Reglas

| Regla | Cómo se comprueba |
| --- | --- |
| Los radios salen de `--radius`. | En `@theme inline`, cada `--radius-*` es un `calc()` de `--radius`. |
| Cuanto más pequeña la pieza, menor el radio. | Teclas `rounded-sm`, botones `rounded-md`, tarjetas `rounded-xl`. |
| Las píldoras (`rounded-full`) son para etiquetas y puntos. | `Badge` y el punto de estado; ningún botón. |

## Antipatrones

- **Radios a mano.** `rounded-[10px]` no cambia si cambia `--radius`.
- **Tarjeta dentro de tarjeta con el mismo radio.** El interior va un paso por debajo.

## Tokens

Salen de `app/globals.css`: `--radius` en `:root` y la escala en `@theme inline`.
