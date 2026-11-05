---
titulo: Tipografía
resumen: Geist para la interfaz y Geist Mono para el código. La jerarquía sale del tamaño y del peso.
estado: produccion
grupo: Base
creado: 2026-11-05
actualizado: 2026-11-05
tokens:
  - nombre: font-sans
    rol: El texto de la interfaz.
  - nombre: font-heading
    rol: Los titulares.
  - nombre: font-mono
    rol: El código, los nombres de tokens y las rutas.
---

```html preview
<div class="grid max-w-md gap-3">
  <p class="text-3xl font-semibold tracking-tight text-primary">Botón</p>
  <p class="text-base text-muted-foreground">Lanza una acción o lleva al siguiente paso.</p>
  <p class="text-sm font-medium">En esta página</p>
  <code class="w-fit rounded-md bg-muted px-1.5 py-0.5 font-mono text-sm">components/ui/button.tsx</code>
</div>
```

## Reglas

| Regla | Cómo se comprueba |
| --- | --- |
| Dos familias: `font-sans` y `font-mono`. | No hay otra `font-family` en `app/globals.css` ni en los componentes. |
| Los titulares van en `font-semibold` con `tracking-tight`. | Los `h1` de `PageHeader` y de las fichas usan esas utilidades. |
| Los nombres de clases, tokens y rutas van en `font-mono`. | Dentro del texto, siempre en `<code>`. |
| El cuerpo de las páginas usa `.ds-prose`. | Las fichas renderizadas llevan esa clase. |

## Antipatrones

- **Negrita para todo.** `font-medium` basta para etiquetas y botones; `font-bold` no se usa.
- **Mayúsculas de sección.** Los encabezados van en tipo oración, como el resto del texto.

## Tokens

Las familias las carga `next/font` (paquete `geist`) como `--font-geist-sans` y `--font-geist-mono`. Los ejemplos en vivo las cargan de Google Fonts con `cssExtra` en `system.json`.
