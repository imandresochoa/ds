---
titulo: Botón
resumen: Lanza una acción o lleva al siguiente paso. Seis variantes y cuatro tamaños.
estado: produccion
funcion: acciones
nivel: atomo
destacado: true
creado: 2026-11-05
actualizado: 2026-11-05
tokens: [primary, primary-foreground, secondary, secondary-foreground, accent, accent-foreground, destructive, border, input, ring, radius-md]
relacionados: [componentes/etiqueta]
plataformas:
  web:
    estado: produccion
    superficies:
      - id: web
        fuente: components/ui/button.tsx
---

## Variantes

```html preview
<button class="inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-all outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 h-9 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90">Empezar</button>
<button class="inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-all outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 h-9 px-4 py-2 bg-secondary text-secondary-foreground hover:bg-secondary/80">Copiar página</button>
<button class="inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-all outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 h-9 px-4 py-2 border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50">Ver código</button>
<button class="inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-all outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 h-9 px-4 py-2 hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50">Ver componentes</button>
<button class="inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-all outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 h-9 px-4 py-2 bg-destructive text-white hover:bg-destructive/90 dark:bg-destructive/60">Borrar</button>
<button class="inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-all outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 h-9 px-4 py-2 text-primary underline-offset-4 hover:underline">Siguiente</button>
```

## Tamaños

```html preview
<button class="inline-flex shrink-0 items-center justify-center gap-1 rounded-md text-xs font-medium whitespace-nowrap h-6 px-2 bg-primary text-primary-foreground">xs</button>
<button class="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-md text-sm font-medium whitespace-nowrap h-8 px-3 bg-primary text-primary-foreground">sm</button>
<button class="inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap h-9 px-4 py-2 bg-primary text-primary-foreground">default</button>
<button class="inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap h-10 px-6 bg-primary text-primary-foreground">lg</button>
```

## Uso

```tsx
import { Button } from '@/components/ui/button';

<Button size="sm">Empezar</Button>
<Button size="sm" variant="ghost" asChild>
  <Link href="/ejemplo/componentes">Ver componentes</Link>
</Button>
```

## API

| Prop | Valores | Por defecto |
| --- | --- | --- |
| `variant` | `default`, `secondary`, `outline`, `ghost`, `destructive`, `link` | `default` |
| `size` | `xs`, `sm`, `default`, `lg`, `icon`, `icon-xs`, `icon-sm`, `icon-lg` | `default` |
| `asChild` | Pinta el hijo (un `Link`) con el estilo del botón. | `false` |

## Reglas

| Regla | Cómo se comprueba |
| --- | --- |
| Un solo botón `default` por grupo de acciones. | En `PageActions`, «Empezar» es `default` y «Ver componentes», `ghost`. |
| En barras y cabeceras, `size="sm"`. | Las acciones de la portada y de la ficha usan `sm` o `xs`. |
| El texto es un verbo o lo que abre. | «Copiar página», «Ver código», «Siguiente». |
| Un enlace con forma de botón usa `asChild`. | No hay `<Link>` con las clases del botón copiadas. |

## Antipatrones

- **Dos principales juntos.** Si todo es importante, nada lo es.
- **Botón de icono sin nombre.** Los tamaños `icon*` llevan `aria-label` o un `sr-only`.

## Accesibilidad

- El foco se ve con el anillo `ring` de 3 px (`focus-visible:ring-[3px]`).
- `disabled` baja la opacidad y quita los eventos; si la acción no está disponible por una razón, explícala cerca.
