---
titulo: Create a new system
resumen: How to apply this structure to any product, step by step, with or without an agent.
origen: "2aa7d67123b2"
---

A design system is a **repo of its own** that only holds content. The interface, the scripts and this methodology come from the kit as a dependency (see “Kit and systems”). Creating a new one means installing the kit, running `ds init` and filling it in.

A system's site only shows this methodology if it turns it on: in `system.json`, `"metodologia": true`. The template ships with it off, because a product's site is for the people who use it, not for whoever builds the system.

## Before you start

- If you start from a repo: the production repo cloned locally. The system reads it by relative path and does not modify it.
- Node 20.9 or later.

## With an agent

```bash
npx @imandresochoa/ds@latest instalar
```

It installs the `montar-sistema` skill for Claude Code and Codex in your user folder. Then open the agent in the product repo (or in an empty folder) and type “set up the design system”. The skill:

1. Asks **where you are starting from**: a repo with code, a website or Figma, or nothing yet. It does this with the agent's question components (see “Agent layer”).
2. Asks for whatever is missing given the answer (the path, the URL or what the product is), the name and the folder. By default, `../<producto>-design-system`.
3. Creates the system repo with `ds init`, which refuses to do it inside production.
4. Fills it in according to the source:
   - **Repo**: surfaces, first sync, `DESIGN.md`, tokens entries and an entry plan.
   - **Website or Figma**: primitives taken from what is published, in exploration.
   - **Nothing**: `DESIGN.md` with what you tell it and some starting primitives, which you adjust in the Primitives Lab.

## Without an agent

```bash
npx @imandresochoa/ds@latest init
```

`ds init` asks the same questions in the terminal (or takes them from `--desde repo|web|figma|cero`, `--produccion <ruta>`, `--url <url>` and `--carpeta <ruta>`) and creates the system repo: `system.json`, `DESIGN.md`, `AGENTS.md`, `CLAUDE.md`, `.gitignore`, an example entry, the `package.json` scripts, the kit installed and the skills in `.claude/skills/` and `.agents/skills/`. Then, by hand:

1. **Connect production.** If you started from a website, Figma or nothing, `produccion` is `null`: create it in full (`repo`, `rama`, `codigo`, `web` and `superficies`) once there is a repo (see “Platforms and surfaces”). In `system.json`, fill in `produccion.codigo` (base URL to view files), `web` and the **surfaces**: each part of the product with its own code and its own stylesheets. Check with `npx ds doctor`.
2. **First sync.** `npx ds sync`. You now have the CSS snapshot, the production tokens and the list of undocumented classes (coverage).
3. **DESIGN.md.** Product context, order of priorities, integration, visual language, named anti-patterns and accessibility. It is the first thing an agent reads.
4. **Fill in by layers**, following the coverage: foundations, tokens (the values come in on their own), components, blocks and charts. Each entry follows “Anatomy of an entry”.
5. **Review and accept fingerprints**: `npx ds sync --accept <id>` for each reviewed entry. `npx ds check` must pass.
6. **Publish**: `npx ds build` leaves the static site in `out/`. If it goes inside another site, under a folder, declare the path in `publicacion.ruta` first (see “Git, GitHub and environments”).

## Primitives with the Lab

If you start from a website, Figma or nothing, adjust the primitives in the Lab: `npx ds dev` and, in the header, “New” → “Primitives Lab” (`/<sistema>/lab`).

1. In “Generate”, choose neutral, brand and error, the font families and the text scale, the spacing unit, the base radius, the shadows and the motion (base duration, its scale and a family of curves). Each color pair shows its contrast in light and dark.
2. If a pair does not reach AA (4.5:1 for text, 3:1 for the focus ring), the Lab says so and “Adjust” moves it to the closest value that passes.
3. “Copy for your agent” passes the preset and the `montar-sistema` skill applies it. Without an agent: “Copy link” and `npx ds preset aplicar "<enlace>"`.
   - The preset is written to `experimental/tokens.css`, never to production.
   - If a pair the preset changes does not reach AA, nothing is written, unless you pass `--aceptar-contraste`. A person makes that call.
   - A file the Lab did not generate is not overwritten, unless you pass `--sobrescribir`.
4. Create the tokens entries in `content/tokens/`, with status `exploracion`, `nombre` and `rol`. The values are read from `experimental/`.

`npx ds preset resolver` returns the link to reopen in the Lab what is in `experimental/tokens.css`.

With an existing product, the Lab opens its tokens in “Adjust tokens”. What you change goes to `experimental/` inside an initiative. Production does not change until a person takes the change over with a PR.

## What you do not touch in a system repo

- The engine (interface, scripts, methodology). If a system needs something new, it is added to the kit for everyone (`mejorar-kit` skill).
- The files generated by the sync (`produccion/`, `tokens.produccion.json`, `sync-report.json`).
- The skills (`.claude/skills/` and `.agents/skills/`): they are updated with `npx ds skills`.

The rest of `system.json`: `iniciales` and `color` are the system's brand in the header; `metodologia: true` shows this methodology on the site; `abrirEnAgentes: true` adds “Open in Claude” and “Open in ChatGPT” to “Copy page”, which send the page's URL to that service; `idiomas` (`["es"]` by default) adds an English translation under `/en/` (see “Languages and translations” in `05-ficha.md`).

## Recommended fill order

Foundations → tokens → atoms → molecules → organisms → blocks. Each layer uses the one before, so documenting them in order avoids entries that talk about pieces that do not exist yet. If you are in a hurry to show something, start with the most used component (usually the button) and complete its tokens.
