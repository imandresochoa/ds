---
titulo: Enlace con producción
resumen: Cómo se garantiza que lo que está en producción está en el sistema, y que el sistema no miente.
---

El sistema vive en un repo distinto del producto. El enlace entre los dos lo hace `npx ds sync`. Lee lo publicado: `origin/<produccion.rama>` (`main` por defecto) del repo de producción (`produccion.repo` en `system.json`), no la rama que tenga la copia local. Con `--local` lee la copia tal cual, cambios sin commit incluidos.

## Qué hace el sync

1. **Instantánea.** Copia las hojas de estilo de cada superficie (y sus fuentes e imágenes) a `produccion/`. Los ejemplos en vivo cargan esa copia: lo que ves es el CSS de producción, no una recreación. Los `@import` locales y de paquetes npm se incrustan (los de paquete se leen del `node_modules` de la copia local de producción), porque el ejemplo no puede resolverlos.
2. **Tokens.** Lee las propiedades personalizadas de `:root` y de cada modo (claro, oscuro…) y las variables de `@theme` de Tailwind 4, y las guarda en `tokens.produccion.json`. Las fichas de tokens muestran esos valores, un modo al lado del otro: nunca se escriben a mano. Ver «Modos y `@theme`».
3. **Huellas.** Para cada ficha con fuentes, reúne las reglas CSS de sus clases (o el archivo entero si es un componente de código) y calcula una huella. La compara con la última revisada en `produccion.lock.json`.
4. **Clases inventadas.** Comprueba que cada clase usada en los ejemplos existe en producción o en el CSS experimental.
5. **Cobertura.** Lista lo que producción tiene y ninguna ficha documenta: los tokens y, por superficie, las clases o los componentes. Es la lista de tareas pendientes del sistema. Ver «Cobertura».
6. **Cambios sin commit.** Avisa si la instantánea incluye archivos de producción todavía sin commit.

## Modos y `@theme`

Un modo es otro juego de valores para los mismos tokens: claro y oscuro, alto contraste, una segunda marca. El sync reconoce:

- `:root`, el modo base. Se llama `light` si hay modo oscuro, `dark` si solo hay claro y `base` en otro caso.
- `[data-theme="…"]` (también `data-mode`, `data-color-scheme` y `data-scheme`), `.dark` y `.light`, solos o sobre `:root`, `html` o `body`.
- `:root` dentro de `@media (prefers-color-scheme: dark)` (o `light`), con `:not(…)` o sin él.

Un modo hereda de la base lo que no redefine. En `tokens.produccion.json`, un token que vale lo mismo en todos los modos sigue siendo un texto; uno que cambia guarda un valor por modo, con la base primero:

```json
{
  "web": {
    "radius": "0.5rem",
    "background": { "light": "var(--gray-0)", "dark": "oklch(0.145 0 0)" }
  }
}
```

El informe (`sync-report.json` → `tokens.<superficie>.modos`) dice qué selectores activan cada modo, y `design.md` lo publica para los agentes. Los valores bajo otra condición (`@media` de ancho o de impresión, `@container`) no son el valor del token y no se leen.

Las variables de `@theme` y `@theme inline` también son tokens: radios, sombras, fuentes, tamaños de texto. Sus `var(--x)` se resuelven contra `:root` en cada modo, así que `--color-background: var(--background)` tiene un valor claro y uno oscuro (el informe guarda lo escrito en `tokens.<superficie>.theme`). Se leen solo de las hojas del producto y de sus `@import` locales, no de paquetes npm: `tw-animate-css` y similares traen las suyas, que no son decisiones del producto. Si un nombre está en `:root` y en `@theme`, manda `:root`.

## Cobertura

- **Clases**, en las superficies con CSS de clases propias: clases definidas en sus hojas que ninguna ficha declara en `clases`. Las que solo activan un modo (`.dark`) no cuentan.
- **Componentes**, en las superficies Tailwind: allí las clases son utilidades y contarlas no dice nada. Se cuentan los archivos `.tsx`, `.jsx`, `.vue`, `.svelte` y `.astro` de `src/components/` (o de las carpetas de `componentes` en `system.json`), sin tests ni stories, que ninguna ficha declara como `fuente`.
- **Tokens**, en todas: los de `tokens.produccion.json` que ninguna ficha de tokens nombra. Una variable de `@theme` que solo apunta a otro token (`--color-x: var(--x)`) cuenta como documentada si lo está su destino.

`"cobertura": true` elige clases o componentes según la superficie; `"clases"` o `"componentes"` lo fuerzan.

## Comandos

```bash
npx ds sync                              # actualiza instantánea, tokens, huellas e informe
npx ds sync --accept componentes/boton   # tras revisar la ficha, guarda su huella
npx ds check                             # falla si algo cambió sin revisar o no existe, si falta una hoja
                                         # de estilos o si los colores de una ficha no cuadran
```

## Declarar fuentes en una ficha

```yaml
plataformas:
  web:
    estado: produccion
    superficies:
      - id: landing                      # superficie definida en system.json
        fuente: public/site/styles.css   # ruta en el repo de producción
        clases: [button, button-outline] # reglas que forman la huella
      - id: portal
        fuente: src/components/ui/button.tsx   # sin clases: la huella es el archivo
```

## Reglas

- Una ficha en producción sin fuentes no se puede verificar; el sync lo avisa en componentes y patrones.
- Solo se acepta una huella después de leer el cambio y actualizar la ficha. Aceptar sin revisar rompe el enlace.
- Cuando producción cambia por una decisión de diseño, primero se actualiza la ficha y después se acepta.
- `check:sync` debe pasar antes de publicar el sistema.
