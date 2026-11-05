---
titulo: Pestañas
resumen: Cambian entre vistas del mismo contenido sin salir de la página, como Vista y Código en el visor de bloques.
estado: produccion
funcion: navegacion
nivel: molecula
creado: 2026-11-05
actualizado: 2026-11-05
tokens: [muted, muted-foreground, background, foreground, radius-lg, radius-md]
plataformas:
  web:
    estado: produccion
    superficies:
      - id: web
        fuente: components/ui/tabs.tsx
---

```html preview
<div role="tablist" class="inline-flex h-9 w-fit items-center justify-center rounded-lg bg-muted p-[3px] text-muted-foreground">
  <button role="tab" aria-selected="true" class="inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap bg-background text-foreground shadow-sm dark:border-input dark:bg-input/30">Vista</button>
  <button role="tab" aria-selected="false" class="inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap text-foreground/60 hover:text-foreground dark:text-muted-foreground">Código</button>
</div>
```

## Línea

La variante `line` quita el fondo de la lista y marca la pestaña activa con una raya debajo.

```html preview
<div role="tablist" class="inline-flex h-9 w-fit items-center justify-center gap-1 bg-transparent text-muted-foreground">
  <button role="tab" aria-selected="true" class="relative inline-flex h-[calc(100%-1px)] items-center justify-center rounded-md px-2 py-1 text-sm font-medium text-foreground after:absolute after:inset-x-0 after:bottom-[-5px] after:h-0.5 after:bg-foreground">Web</button>
  <button role="tab" aria-selected="false" class="relative inline-flex h-[calc(100%-1px)] items-center justify-center rounded-md px-2 py-1 text-sm font-medium text-foreground/60 hover:text-foreground">iOS</button>
  <button role="tab" aria-selected="false" class="relative inline-flex h-[calc(100%-1px)] items-center justify-center rounded-md px-2 py-1 text-sm font-medium text-foreground/60 hover:text-foreground">Android</button>
</div>
```

## Uso

```tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

<Tabs defaultValue="vista">
  <TabsList>
    <TabsTrigger value="vista">Vista</TabsTrigger>
    <TabsTrigger value="codigo">Código</TabsTrigger>
  </TabsList>
  <TabsContent value="vista">…</TabsContent>
  <TabsContent value="codigo">…</TabsContent>
</Tabs>
```

## API

| Prop | Dónde | Valores | Por defecto |
| --- | --- | --- | --- |
| `variant` | `TabsList` | `default`, `line` | `default` |
| `orientation` | `Tabs` | `horizontal`, `vertical` | `horizontal` |

## Reglas

| Regla | Cómo se comprueba |
| --- | --- |
| Las pestañas cambian la vista, no la página. | Para ir a otra URL, un enlace o la navegación de categorías. |
| Entre dos y cinco pestañas. | Con más, un selector. |

## Accesibilidad

- Radix pone `role="tablist"`, `role="tab"` y `aria-selected`, y mueve el foco con las flechas.
