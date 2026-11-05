---
titulo: Etiqueta
resumen: Una palabra o dos que clasifican lo que tienen al lado. En píldora y sin interacción propia.
estado: produccion
funcion: contenido
nivel: atomo
creado: 2026-11-05
actualizado: 2026-11-05
tokens: [primary, primary-foreground, secondary, secondary-foreground, destructive, border, muted]
relacionados: [componentes/boton, componentes/punto-de-estado]
plataformas:
  web:
    estado: produccion
    superficies:
      - id: web
        fuente: components/ui/badge.tsx
---

```html preview
<span class="inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap bg-primary text-primary-foreground">Web</span>
<span class="inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap bg-secondary text-secondary-foreground">Átomo</span>
<span class="inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap border-border text-foreground">Acciones</span>
<span class="inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap bg-destructive text-white dark:bg-destructive/60">Obsoleto</span>
```

## Con aviso

La portada pone encima del titular lo último que ha llegado al sistema: una etiqueta `secondary` con fondo `muted`, el punto `nuevo` y una flecha.

```html preview
<a href="#" class="inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap text-secondary-foreground bg-muted hover:bg-secondary/90"><span class="flex size-2 rounded-full bg-nuevo"></span>Nuevo: Botón<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-3"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg></a>
```

## API

| Prop | Valores | Por defecto |
| --- | --- | --- |
| `variant` | `default`, `secondary`, `outline`, `ghost`, `destructive`, `link` | `default` |
| `asChild` | Pinta el hijo (un enlace) con el estilo de la etiqueta; solo así tiene `hover`. | `false` |

## Reglas

| Regla | Cómo se comprueba |
| --- | --- |
| Clasifica, no actúa. | Una etiqueta solo es enlace con `asChild` (el aviso de la portada). |
| Texto corto, sin punto final. | Una o dos palabras. |

## Antipatrones

- **Etiqueta como botón.** Si hace algo, es un [Botón](/ejemplo/componentes/boton).
- **Estado en etiqueta de color.** El estado de una ficha va en el [Punto de estado](/ejemplo/componentes/punto-de-estado).
