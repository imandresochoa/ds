---
titulo: Kit and systems
resumen: What lives in the kit, what lives in each system and how they stay in sync.
origen: "2f6eddc1c155"
---

## Repo types

| Repo | Contains | Example |
| --- | --- | --- |
| **Kit** (package `@imandresochoa/ds`, repo `imandresochoa/ds`) | The engine: interface, `ds` CLI, sync and publishing scripts, template, skills and this methodology. It names no product. | Just one, shared. |
| **System** (`<producto>-design-system`) | A product's content: `system.json`, `DESIGN.md`, entries, experimental CSS, production snapshot and fingerprints. | One per product. |
| **Production** | The product's real code. The system reads it; it does not modify it. | Each product's repo. |
| **Directory** (optional) | A `directorio.json` with the folders of the systems served together, and the kit as a dependency. No content of its own. | One per studio or team. |

```
kit ──(dependencia npm)──▶ sistema ──(lee por ruta, ds sync)──▶ producción
```

It is the pattern of Docusaurus, Storybook or Starlight: the engine is installed; the content is yours. That way each system gets the kit's improvements by upgrading, without merging changes by hand.

## Directory

A directory brings several systems together in a single site. Its front page is the Directory: one card per system with its entries by status, its sync and its production coverage, and links to its `registry.json` and its `design.md`. For agents, the site publishes `/directorio.json` with the same information, and `llms.txt` lists every system.

```bash
npx @imandresochoa/ds init --directorio "Nuestros sistemas" --carpeta ../directorio --sistemas ../a-design-system,../b-design-system
cd ../directorio && npx ds dev
```

```json
{
  "nombre": "Nuestros sistemas",
  "descripcion": "",
  "sistemas": ["../a-design-system", "../b-design-system"],
  "publicacion": { "ruta": "/ds" }
}
```

- The paths in `sistemas` are relative to the directory. Each system stays in its repo, with its own sync and its own pace. The directory only reads them.
- `ds dev`, `ds build` and `ds doctor` work the same as in a system. The sync runs in each system (`npx ds sync` in its folder); the directory shows the latest one.
- Every system is served with the directory's kit version. If a system needs another one, it is published on its own.
- The publishing path is the directory's (`publicacion.ruta`, or `DS_RUTA`). Each system's own path does not count here.
- Only the systems listed in `directorio.json` appear. Third-party registries are never added: an agent could put code nobody has reviewed into production.

## Why the system does not live inside the production repo

It is a valid option (teams with a monorepo do it), but with a single deployment environment any change in production goes out to production. Kept apart:

- documenting does not put the product at risk;
- the system has its own history and its own pace;
- the link stays just as strict: fingerprints detect any change in production.

When the product has staging and CI, a `ds check` is added to its CI to warn if a production change leaves an entry out of step (see “Git, GitHub and environments”).

## Developing the kit with real data

The interface is easier to polish with real content. For that, link the kit locally from the system repo:

```bash
cd producto-design-system
npx ds enlazar ../ds   # el kit necesita su propio npm install
npx ds dev
npx ds desenlazar                                   # vuelve a la versión fijada en package.json
```

`ds enlazar` creates the link only in that repo (it does not use `npm link`, which needs permissions on npm's global folder). An `npm install` in the system also undoes the link.

With the kit linked, `ds dev` runs the engine from the kit folder: every interface change shows up right away with the system's data. Changes are committed **in the kit**, never in the system.

Without a link, `ds` copies the engine to `.ds/kit` (ignored by git) and runs it from there.

## Updating a system

```bash
npm install @imandresochoa/ds@X.Y.Z
npx ds skills     # actualiza las skills de Claude Code y Codex
npx ds sync && npx ds check
```

The `actualizar-kit` skill does it and summarizes the changelog.

## Kit versions

- **Patch**: interface fixes with no content changes.
- **Minor**: new compatible features (a section, an optional field).
- **Major**: changes that require touching entries or `system.json`, or that change the shape of what is published for agents (`registry.json`, the pieces in `r/`, `directorio.json`). They come with a migration guide in `CHANGELOG.md`.
