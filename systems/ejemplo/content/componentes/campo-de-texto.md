---
titulo: Campo de texto
resumen: Una línea de texto editable. Borde `input`, anillo de foco y estado inválido con `aria-invalid`.
estado: produccion
funcion: formularios
nivel: atomo
creado: 2026-11-05
actualizado: 2026-11-05
tokens: [input, ring, destructive, muted-foreground, radius-md]
plataformas:
  web:
    estado: produccion
    superficies:
      - id: web
        fuente: components/ui/input.tsx
---

```html preview
<div class="grid w-72 gap-3">
  <input placeholder="Buscar en la documentación…" class="h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground md:text-sm dark:bg-input/30 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50">
  <input aria-invalid="true" value="ficha-sin-titulo" class="h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs outline-none md:text-sm dark:bg-input/30 aria-invalid:border-destructive aria-invalid:ring-[3px] aria-invalid:ring-destructive/20">
  <input disabled placeholder="Desactivado" class="h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs outline-none placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30">
</div>
```

## Uso

```tsx
import { Input } from '@/components/ui/input';

<Input placeholder="Buscar en la documentación…" />
```

## Reglas

| Regla | Cómo se comprueba |
| --- | --- |
| Lleva una etiqueta visible o `aria-label`. | Ningún `Input` sin nombre accesible. |
| El error se marca con `aria-invalid`, no con clases. | El borde `destructive` sale de `aria-invalid:border-destructive`. |
| El texto es de 16 px en móvil y 14 px desde `md`. | `text-base md:text-sm`: iOS no hace zoom al enfocar. |

## Antipatrones

- **Placeholder como etiqueta.** Desaparece al escribir.

## Accesibilidad

- El foco tiene el mismo anillo que el botón.
- El mensaje de error se enlaza con `aria-describedby`.
