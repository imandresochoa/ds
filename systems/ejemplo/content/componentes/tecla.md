---
titulo: Tecla
resumen: Un atajo de teclado. Sola o en grupo, como el ⌘ K del buscador.
estado: produccion
funcion: contenido
nivel: atomo
creado: 2026-11-05
actualizado: 2026-11-05
tokens: [muted, muted-foreground, radius-sm]
plataformas:
  web:
    estado: produccion
    superficies:
      - id: web
        fuente: components/ui/kbd.tsx
---

```html preview
<kbd class="inline-flex items-center gap-1">
  <kbd class="pointer-events-none inline-flex h-5 w-fit min-w-5 items-center justify-center gap-1 rounded-sm border bg-muted px-1 font-sans text-xs font-medium text-muted-foreground select-none">⌘</kbd>
  <kbd class="pointer-events-none inline-flex h-5 w-fit min-w-5 items-center justify-center gap-1 rounded-sm border bg-muted px-1 font-sans text-xs font-medium text-muted-foreground select-none">K</kbd>
</kbd>
```

## En el buscador

```html preview
<button class="relative inline-flex h-8 w-64 shrink-0 items-center justify-start gap-2 rounded-lg bg-muted pl-3 text-sm font-normal whitespace-nowrap text-foreground transition-colors hover:bg-muted/50 dark:bg-card">
  Buscar en la documentación…
  <kbd class="absolute top-1.5 right-1.5 inline-flex items-center gap-1">
    <kbd class="pointer-events-none inline-flex h-5 w-fit min-w-5 items-center justify-center rounded-sm border bg-muted px-1 font-sans text-xs font-medium text-muted-foreground select-none">⌘</kbd>
    <kbd class="pointer-events-none inline-flex h-5 w-fit min-w-5 items-center justify-center rounded-sm border bg-muted px-1 font-sans text-xs font-medium text-muted-foreground select-none">K</kbd>
  </kbd>
</button>
```

## Uso

```tsx
import { Kbd, KbdGroup } from '@/components/ui/kbd';

<KbdGroup>
  <Kbd>⌘</Kbd>
  <Kbd>K</Kbd>
</KbdGroup>
```

## Reglas

| Regla | Cómo se comprueba |
| --- | --- |
| Una tecla por `Kbd`; la combinación va en `KbdGroup`. | No hay «⌘K» en un solo `Kbd`. |
| Se esconde donde no hay teclado. | En el buscador, `hidden sm:flex`. |
