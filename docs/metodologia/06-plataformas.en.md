---
titulo: Platforms and surfaces
resumen: Web, iOS and Android in the same entry; landing and portal inside web.
origen: "2a0affbbca3e"
---

## Platforms

Each component and block has platform tabs: **Web**, **iOS** and **Android**. Each tab has its own status and its own file (`web.md`, `ios.md`, `android.md`). What is shared (when to use it, rules, accessibility) lives in `index.md` and shows in every tab.

When a platform has no implementation, the tab shows “Not started” and a prompt for an agent to prepare a first version in exploration.

To add a platform to a system, add it to `plataformas` in `system.json`. For iOS and Android, the link to production works the same way: the source is a Swift or Kotlin file and the fingerprint is the whole file.

## Surfaces

A surface is a part of the product with its own code: for example, a **landing** in static HTML and CSS and a **customer area** in Next and Tailwind. They are defined in `system.json`:

```json
"superficies": {
  "landing": { "nombre": "Landing", "estilos": ["public/site/fonts.css", "public/site/styles.css"], "cobertura": true },
  "portal": { "nombre": "Portal de clientes", "estilos": ["src/app/globals.css"], "tailwind": "4.3.3", "cobertura": true }
}
```

- `nombre`: what the surface is called in the interface.
- `url`: where it can be seen in production. It is informational: people and agents read it.
- `fondo`: background color for the surface's live examples.
- `estilos`: stylesheets that are copied into the snapshot and that the examples load.
- `cobertura`: whether to count what this surface has undocumented. `true` counts classes or, if the surface is Tailwind, components; `"clases"` or `"componentes"` force one (see “Link to production”).
- `componentes`: folder or list of component folders for that coverage. By default, `src/components`.
- `tailwind`: Tailwind version used to compile the surface's examples in the browser.
- `estilosExtra` and `cssExtra`: stylesheets from another surface (fonts) and variables that the framework sets in production.

Outside `superficies`, `produccion` holds `repo` (path to the production repo, relative to the system), `rama` (`main` by default), `publico` (the public files folder, where the snapshot's fonts and images come from; `public` by default), `codigo` (base URL to view a file) and `web`.

If two surfaces implement the same component differently, the entry notes it in “Differences between surfaces”. Unifying them is an initiative, not a silent fix.
