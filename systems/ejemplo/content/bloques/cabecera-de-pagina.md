---
titulo: Cabecera de página
resumen: "El arranque de las páginas anchas (la portada, las galerías): aviso, titular, descripción y dos acciones, centrados."
estado: produccion
categoria: seccion
destacado: true
creado: 2026-11-05
actualizado: 2026-11-05
usa: [componentes/etiqueta, componentes/boton]
tokens: [primary, foreground, nuevo]
plataformas:
  web:
    estado: produccion
    superficies:
      - id: web
        fuente: components/site/PageHeader.tsx
---

```html preview
<section class="border-grid">
  <div class="container-wrapper">
    <div class="container flex flex-col items-center gap-2 px-6 py-8 text-center md:py-16 lg:py-20 xl:gap-4">
      <a href="#" class="inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap text-secondary-foreground bg-muted"><span class="flex size-2 rounded-full bg-nuevo"></span>Nuevo: Cabecera de página<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-3"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg></a>
      <h1 class="leading-tighter max-w-4xl text-3xl font-semibold tracking-tight text-balance text-primary lg:leading-[1.1] xl:text-5xl xl:tracking-tighter">ds</h1>
      <p class="max-w-4xl text-base text-balance text-foreground sm:text-lg">El sistema de diseño de esta web: los tokens, componentes y bloques con los que está hecha la interfaz del kit, enlazados con su código.</p>
      <div class="flex w-full items-center justify-center gap-2 pt-2">
        <a href="#" class="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-md text-sm font-medium whitespace-nowrap h-8 px-3 bg-primary text-primary-foreground hover:bg-primary/90">Empezar</a>
        <a href="#" class="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-md text-sm font-medium whitespace-nowrap h-8 px-3 hover:bg-accent hover:text-accent-foreground">Ver componentes</a>
      </div>
    </div>
  </div>
</section>
```

## Partes

| Parte | Componente | Qué lleva |
| --- | --- | --- |
| `Announcement` | [Etiqueta](/ejemplo/componentes/etiqueta) `secondary` | La última ficha que ha llegado, con el punto `nuevo` si es reciente. |
| `PageHeaderHeading` | — | El nombre del sistema o de la galería. `text-primary`, `font-semibold`. |
| `PageHeaderDescription` | — | Una o dos frases. `text-balance` para que no quede una palabra sola. |
| `PageActions` | [Botón](/ejemplo/componentes/boton) `sm` | Una acción `default` y otra `ghost`. Sin sombra. |

## Reglas

| Regla | Cómo se comprueba |
| --- | --- |
| Un `h1` por página, y es este. | Ninguna página ancha tiene otro `h1`. |
| Como mucho, una acción principal. | `PageActions` tiene un solo botón `default`. |
| El aviso solo sale si hay algo que anunciar. | Sin fichas, la portada no lo pinta. |

## Antipatrones

- **Titular de marketing.** El titular es el nombre: el sistema no se vende, se usa.
