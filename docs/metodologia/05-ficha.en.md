---
titulo: Anatomy of an entry
resumen: How to write an entry so that a person and an agent both understand it.
origen: "40faca4baa09"
---

An entry is a `slug.md` file or a `slug/` folder with `index.md` and one file per platform (`web.md`, `ios.md`, `android.md`). Use a folder when the entry has a per-platform implementation.

## Frontmatter

```yaml
---
titulo: Botón
resumen: Una frase. Qué es y cuándo se usa.
estado: produccion            # exploracion | desarrollo | produccion | obsoleto
funcion: acciones             # componentes: acciones | navegacion | formularios | feedback | contenido | superposiciones (ordena llms.txt y el registry)
nivel: atomo                  # componentes: atomo | molecula | organismo (regla de composición)
categoria: seccion            # bloques: seccion | pantalla | flujo · gráficos: area | barras | lineas | circular | radar | radial | tooltip
destacado: true               # opcional: su primer ejemplo sale en la home
grupo: Base                   # tokens y fundamentos: agrupación en la barra lateral
creado: 2026-10-11
actualizado: 2026-10-11
iniciativa: sistema-agentic-first   # opcional
tokens: [ink, paper]          # tokens que usa (en fichas de tokens: lista con nombre y rol)
usa: [componentes/icono]      # piezas que compone: el grafo del registry (los tokens entran solos)
relacionados: [componentes/enlace-de-texto]   # ver también: no es una dependencia
plataformas:
  web:
    estado: produccion
    superficies: [...]        # ver «Enlace con producción»
  ios:
    estado: sin-iniciar
---
```

## Shared body (`index.md`)

In this order, leaving out what does not apply:

1. **When to use it** and **When not to**, with the alternative linked.
2. **Rules**, in a table: the rule and how to check it.
3. **Anti-patterns**, with the name in bold.
4. **Accessibility**.
5. **Differences between surfaces**: observations from the sync. They are not decisions.

The `## Reglas` and `## Antipatrones` headings go as they are into the piece's JSON (`reglas` and `antipatrones`): do not rename them. `## Rechaza estos reflejos`, the previous name, is still read as anti-patterns.

## Per-platform body (`web.md`)

- One section per surface (Landing, Portal).
- Live examples with ` ```html preview ` blocks. Options: `superficie=portal`, `fondo=night` (any color token).
- The usage code to copy (` ```tsx `, ` ```swift `, ` ```kotlin `).
- The **API** in a table: classes or props, what they do and default values.

## Docs pages

Pages that are not entries (introduction, installation, guides) go in `content/docs/`. `index.md` is the Introduction; without it, the Introduction is `DESIGN.md` without its title. The order is set in `content/docs/meta.json` with `{"paginas": ["instalacion", "..."]}`. `produccion` and `agentes` are reserved: the kit adds those pages.

## Foundation and tokens: no overlap

- **The foundation** explains how and when something is used (rules, anti-patterns) and links to its tokens.
- **The tokens entry** only has the table: name, role and production value. If a token is also in `experimental/` (for example, because it came from the Primitives Lab), the table shows that value in the “Experimental” column. Usage rules do not go there.
- They link to each other with `relacionados`.

## `usa` and `relacionados`

- **`usa`** says which pieces this one composes: the components in a block, or the icon inside a button. With it, the registry builds the graph (`usa` and `usadoPor`) and an agent knows what is affected if a piece changes. The entry's `tokens` enter the graph on their own, through the tokens entry that documents them.
- **`relacionados`** is “see also”: the foundation of a tokens entry, or the replacement for a deprecated piece. It is not a dependency.
- An id in `usa` that does not exist triggers a warning in `ds build` and `ds dev`.

## Languages and translations

A system is written in one language and can be translated into another. You turn it on in `system.json`:

```json
"idiomas": ["es", "en"],
"en": { "nombre": "Example system", "descripcion": "…" }
```

- **The first one is the main language.** Entries are written in it and it is served at the usual URLs. Without `idiomas`, it is `["es"]`: nothing changes. Today the translation can be into English, under `/en/` (`/en/<sistema>/componentes/boton`).
- **A translation is a sibling file**: `boton.en.md` next to `boton.md`, `index.en.md` and `web.en.md` inside a folder, `DESIGN.en.md` next to `DESIGN.md`. It only carries what is read: `titulo`, `resumen`, `grupo` and the body. Status, sources, platforms and the rest come from the original, so the sync still has a single source.
- **Links don't change.** Write `/<sistema>/…` as in the original; the translation puts `/en` in front of them.
- **If it's missing, the original is shown.** The page exists in English, with a notice and the content in its own language. If the original changed after it was translated, the notice says so.
- **`origen`** stores the fingerprint of the original that was translated. `npx ds traducciones` lists the missing and outdated ones; `npx ds traducciones --aceptar <ruta>` writes the fingerprint, only after reviewing the translation against the original. `ds check` warns about outdated ones but doesn't fail.
- The `## Reglas` and `## Antipatrones` headings are read from the original: the registry and `ds ver` exist only in the main language.

## Writing for agents

- Short, checkable sentences. No “elegant” or “clean”.
- Exact names of classes and tokens, in code.
- Examples use real, approved copy from production. Copy is never invented.
- What is missing is stated: “Pending documentation”. It is not filled in.
