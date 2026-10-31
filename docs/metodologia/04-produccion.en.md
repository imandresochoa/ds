---
titulo: Link to production
resumen: How we make sure that what is in production is in the system, and that the system does not lie.
origen: "bfd38bf9473c"
---

The system lives in a different repo from the product. `npx ds sync` makes the link between the two. It reads what is published: `origin/<produccion.rama>` (`main` by default) of the production repo (`produccion.repo` in `system.json`), not whatever branch the local copy is on. With `--local` it reads the copy as it is, uncommitted changes included.

## What the sync does

1. **Snapshot.** It copies each surface's stylesheets (and their fonts and images) to `produccion/`. Live examples load that copy: what you see is the production CSS, not a recreation. Local and npm package `@import`s are inlined (package ones are read from the `node_modules` of the local production copy), because the example cannot resolve them.
2. **Tokens.** It reads the custom properties in `:root` and in each mode (light, dark…) and the Tailwind 4 `@theme` variables, and saves them in `tokens.produccion.json`. Tokens entries show those values, one mode next to the other: they are never written by hand. See “Modes and `@theme`”.
3. **Fingerprints.** For each entry with sources, it gathers the CSS rules for its classes (or the whole file if it is a code component) and computes a fingerprint. It compares it with the last reviewed one in `produccion.lock.json`.
4. **Invented classes.** It checks that every class used in the examples exists in production or in the experimental CSS.
5. **Coverage.** It lists what production has and no entry documents: tokens and, per surface, classes or components. It is the system's to-do list. See “Coverage”.
6. **Uncommitted changes.** The sync reads what is published (`origin/<rama>`). If that branch does not exist, it reads the local copy and warns about files that are not committed yet. Without `origin/<rama>`, `ds check` fails: the system cannot compare against what is published.

## Modes and `@theme`

A mode is another set of values for the same tokens: light and dark, high contrast, a second brand. The sync recognizes:

- `:root`, the base mode. It is called `light` if there is a dark mode, `dark` if there is only light, and `base` otherwise.
- `[data-theme="…"]` (also `data-mode`, `data-color-scheme` and `data-scheme`), `.dark` and `.light`, alone or on `:root`, `html` or `body`.
- `:root` inside `@media (prefers-color-scheme: dark)` (or `light`), with or without `:not(…)`.

A mode inherits from the base whatever it does not redefine. In `tokens.produccion.json`, a token with the same value in every mode stays a string; one that changes stores a value per mode, base first:

```json
{
  "web": {
    "radius": "0.5rem",
    "background": { "light": "var(--gray-0)", "dark": "oklch(0.145 0 0)" }
  }
}
```

The report (`sync-report.json` → `tokens.<superficie>.modos`) says which selectors turn on each mode, and `design.md` publishes it for agents. Values under other conditions (width or print `@media`, `@container`) are not the token's value and are not read.

`@theme` and `@theme inline` variables are tokens too: radii, shadows, fonts, text sizes. Their `var(--x)` resolve against `:root` in each mode, so `--color-background: var(--background)` has a light value and a dark one (the report keeps what was written in `tokens.<superficie>.theme`). They are read only from the product's stylesheets and their local `@import`s, not from npm packages: `tw-animate-css` and the like bring their own, which are not product decisions. If a name is in both `:root` and `@theme`, `:root` wins.

## Coverage

- **Classes**, on surfaces with their own class-based CSS: classes defined in their stylesheets that no entry declares in `clases`. Those that only turn on a mode (`.dark`) do not count.
- **Components**, on Tailwind surfaces: there, classes are utilities and counting them says nothing. It counts the `.tsx`, `.jsx`, `.vue`, `.svelte` and `.astro` files in `src/components/` (or in the `componentes` folders in `system.json`), excluding tests and stories, that no entry declares as `fuente`.
- **Tokens**, on all of them: those in `tokens.produccion.json` that no tokens entry names. A `@theme` variable that only points to another token (`--color-x: var(--x)`) counts as documented if its target is.

`"cobertura": true` picks classes or components depending on the surface; `"clases"` or `"componentes"` force one.

## Commands

```bash
npx ds sync                              # actualiza instantánea, tokens, huellas e informe
npx ds sync --accept componentes/boton   # tras revisar la ficha, guarda su huella
npx ds check                             # falla si algo cambió sin revisar o no existe, si falta una hoja
                                         # de estilos o si los colores de una ficha no cuadran
```

## Declaring sources in an entry

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

## Rules

- An entry in production with no sources cannot be checked; the sync warns about it for components and blocks.
- A fingerprint is only accepted after reading the change and updating the entry. Accepting without reviewing breaks the link.
- When production changes because of a design decision, the entry is updated first and accepted after.
- `npx ds check` must pass before the system is published.
