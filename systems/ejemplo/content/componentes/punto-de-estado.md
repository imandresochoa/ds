---
titulo: Punto de estado
resumen: El estado de una ficha y su enlace con producción en un punto y una palabra. Al pasar el ratón, el detalle.
estado: produccion
funcion: feedback
nivel: atomo
destacado: true
creado: 2026-11-05
actualizado: 2026-11-05
tokens: [estado-ok, estado-aviso, estado-error, estado-desarrollo, estado-exploracion, estado-obsoleto]
relacionados: [fundamentos/estados]
plataformas:
  web:
    estado: produccion
    superficies:
      - id: web
        fuente: components/docs/StatusBadge.tsx
---

```html preview
<div class="grid gap-3 text-sm">
  <span class="inline-flex items-center gap-1.5 text-foreground"><span aria-hidden="true" class="inline-flex size-1.5 shrink-0 rounded-full bg-estado-ok"></span>En producción</span>
  <span class="inline-flex items-center gap-1.5 text-foreground"><span aria-hidden="true" class="inline-flex size-1.5 shrink-0 rounded-full bg-estado-aviso"></span>En producción <span class="text-muted-foreground">· Cambió en producción</span></span>
  <span class="inline-flex items-center gap-1.5 text-foreground"><span aria-hidden="true" class="inline-flex size-1.5 shrink-0 rounded-full bg-estado-exploracion"></span>Exploración</span>
</div>
```

## Cómo elige el tono

`tone()` resume estado y sync en uno de los seis tonos de [Estados](/ejemplo/fundamentos/estados):

| Ficha | Tono |
| --- | --- |
| `exploracion` o `desarrollo` | El de su estado. |
| `sin-iniciar` u `obsoleto` | `estado-obsoleto`. |
| Sync `ausente` o `sin-repo` | `estado-error`. |
| Sync `nuevo` o `desajuste` | `estado-aviso`. |
| En producción y sincronizada | `estado-ok`. |

## Reglas

| Regla | Cómo se comprueba |
| --- | --- |
| El punto es `aria-hidden`; el estado se lee en el texto. | En las tarjetas sin texto visible va un `sr-only`. |
| Una ficha en producción y sincronizada no enseña punto en las tarjetas. | `EntryCard` solo lo pinta si `estado !== 'produccion'`. |

## Antipatrones

- **Color sin palabra.** Ver [Estados](/ejemplo/fundamentos/estados).
