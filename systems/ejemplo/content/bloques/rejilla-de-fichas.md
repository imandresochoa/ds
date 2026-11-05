---
titulo: Rejilla de fichas
resumen: "El índice de una sección: cada ficha en una tarjeta con su primer ejemplo en vivo, el nombre y el estado debajo."
estado: produccion
categoria: seccion
creado: 2026-11-05
actualizado: 2026-11-05
usa: [componentes/punto-de-estado]
tokens: [muted, border, foreground, nuevo, radius-xl]
plataformas:
  web:
    estado: produccion
    superficies:
      - id: web
        fuente: components/docs/EntryCard.tsx
---

```html preview
<section class="grid w-full gap-x-4 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
  <a href="#" class="group flex min-w-0 flex-col gap-2.5 rounded-xl outline-none">
    <div class="relative flex h-40 items-center justify-center overflow-hidden rounded-xl border bg-muted/30 transition-colors group-hover:border-foreground/25">
      <span class="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground">Empezar</span>
    </div>
    <div class="flex min-w-0 items-center gap-2 px-0.5 text-sm font-medium">
      <span class="truncate underline-offset-4 group-hover:underline">Botón</span>
      <span class="ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-full bg-muted px-2 py-0.5 text-xs font-normal text-muted-foreground"><span aria-hidden="true" class="size-1.5 rounded-full bg-nuevo"></span>Nuevo</span>
    </div>
  </a>
  <a href="#" class="group flex min-w-0 flex-col gap-2.5 rounded-xl outline-none">
    <div class="relative flex h-40 items-center justify-center overflow-hidden rounded-xl border bg-muted/30 transition-colors group-hover:border-foreground/25">
      <span class="inline-flex h-9 w-56 items-center rounded-md border border-input px-3 text-sm text-muted-foreground">Buscar en la documentación…</span>
    </div>
    <div class="flex min-w-0 items-center gap-2 px-0.5 text-sm font-medium">
      <span class="truncate underline-offset-4 group-hover:underline">Campo de texto</span>
    </div>
  </a>
  <a href="#" class="group flex min-w-0 flex-col gap-2.5 rounded-xl outline-none">
    <div class="relative flex min-h-40 grow flex-col gap-3 overflow-hidden rounded-xl border bg-muted/30 p-5 transition-colors group-hover:border-foreground/25">
      <p class="line-clamp-4 text-sm text-muted-foreground">Cambian entre vistas del mismo contenido sin salir de la página.</p>
    </div>
    <div class="flex min-w-0 items-center gap-2 px-0.5 text-sm font-medium">
      <span class="truncate underline-offset-4 group-hover:underline">Pestañas</span>
      <span aria-hidden="true" class="inline-flex size-1.5 shrink-0 rounded-full bg-estado-exploracion"></span><span class="sr-only">Exploración</span>
    </div>
  </a>
</section>
```

## Formas de tarjeta

La miniatura cambia según lo que enseña la sección (`CARD_KINDS`):

| Tipo | Rejilla | Miniatura |
| --- | --- | --- |
| `componente` | 2, 3 y 4 columnas | 160 px de alto, al 80 % y centrada. |
| `bloque` | 2 y 3 columnas | 224 px de alto, con el ancho de un escritorio (1280 px) y desde arriba. |
| `grafico` | 2 y 3 columnas | 192 px de alto, con el ancho de una tarjeta de panel. |
| `texto` | 2 y 3 columnas | Sin ejemplo: el resumen. |

## Reglas

| Regla | Cómo se comprueba |
| --- | --- |
| La tarjeta entera es el enlace. | Un solo `<a>` por tarjeta, con foco visible. |
| El estado solo sale si no es «En producción». | Las fichas en producción no llevan punto. |
| Sin ejemplo, el resumen. | Una ficha sin `html preview` enseña su `resumen`. |

## Antipatrones

- **Captura en vez de ejemplo.** La miniatura es el ejemplo en vivo, reducido: una imagen se queda vieja.
