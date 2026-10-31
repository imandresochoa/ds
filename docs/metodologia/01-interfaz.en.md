---
titulo: The interface
resumen: "The structure of ui.shadcn.com: header, three-column Docs and wide pages for Blocks, Charts and Initiatives."
origen: "8a56fc277f13"
---

The interface copies the structure and style of ui.shadcn.com: neutral, no decoration, with the content as the only source of color. It also copies its way of thinking about a system: documentation that reads top to bottom, and pieces you see live and copy. The difference is that here each piece links to its code in production.

## Structure

- **Front page** (`/`). With one system, it goes to it. With several (a directory), it is the Directory: one card per system with its entries, its sync and its coverage, and links to its registry and its `design.md` (see “Kit and systems”).
- **Header** (fixed). On the left, the system's brand (a selector if there are several) and the navigation: Home, Docs, Components, Blocks, Charts and Initiatives. On the right, search, the code repo (if `produccion.codigo` exists), light or dark mode and **New**, with the Primitives Lab, the prompt for each section and “Request a change”.
- **Home** (`/<sistema>`). A notice with the latest entry created, the system's name and description, “Get started” and “View components”. Below, a showcase with the live examples of the entries marked `destacado: true`. If there are none, it uses the ones that have an example, production ones first, up to nine. With no examples, it shows one card per section.
- **Docs.** Three columns, as in shadcn:
  - **Sidebar**: “Sections” (Introduction and one item per section), “Get started” (the system's own pages in `content/docs/`, plus Production and For agents, which the kit adds), one group per section with its entries and, if the system turns it on, Methodology.
  - **Content**: title, description, badges (status, code, initiative), “Copy page” as Markdown, and previous and next.
  - **Right**: “On this page” and the “Working with an agent?” card, which copies the system's context.
- **Section index** (`/<sistema>/componentes`, `/fundamentos`, `/tokens`). Like the shadcn components index: “New” (created in the last 30 days, with a blue dot) and “All”, in an alphabetical grid. Foundations and Tokens are grouped by `grupo`.
- **Entry.** Live examples with their code below. If the code is longer than eight lines, it collapses behind “View code”. The Web, iOS and Android tabs follow shadcn's base switcher, and only the platforms that exist appear. At the end come “Tokens it uses”, “Link to production”, “Uses” (the pieces it composes) and “Related”.
- **Wide pages.** Blocks and Charts take the shape of shadcn's Blocks and Charts: header, navigation by category and gallery.
  - Each block sits in a viewer with Preview and Code, desktop, tablet and mobile widths, and a button that copies the prompt for an agent to use it. It is the equivalent of `npx shadcn add`.
  - Charts go in cards, in a grid.
  - Initiatives shows “In progress” and “Published” cards.
  - An empty section explains what goes in it and gives the prompt to ask the agent for it.
- **Primitives Lab** (`/<sistema>/lab`). The equivalent of shadcn's Create, but only with primitives. It has two tabs:
  - **Generate** creates the tokens, with shadcn names, from a few primitives: neutral, brand and error; font families, base size, scale and line height; spacing unit; base radius; shadow opacity and blur; and motion base duration, scale and curves.
  - **Adjust tokens** changes the ones the system already has, from each production surface or from `experimental/`.
  - It shows light and dark side by side, with no components: color pairs with their contrast, neutral scale, type scale, spacing, radii, shadows and motion (each duration and each curve, animated; they stop with “reduce motion”).
  - Each pair below AA comes up at the top with “Adjust”, which moves it to the closest value that passes.
  - It writes nothing. The state lives in the URL (`?preset=`), and “Copy for your agent” passes it along with the prompt to apply it (`npx ds preset aplicar`, see “Create a new system”).
  - It downloads no fonts and makes no requests: the samples use the fonts installed on the computer.
- **Footer**: links to `design.md` and `llms.txt`. It does not appear in Docs.

## Entry status

A badge next to the description. The text is the status and the dot sums up the sync: green, in production and synced; amber, it needs a review; red, it declares something that no longer exists; blue, in development; violet, in exploration; gray, deprecated. On hover it shows the status, the sync, the platforms and the sources. In lists only the dot appears, and only if the entry is not in production.

## Structure, not components

The kit ships no components, blocks or charts. It ships their structure: the sections, their categories, the viewer and the empty states. Each system fills it with what already exists in its product or with what it designs from scratch.

| Section | Categories (`categoria`) |
| --- | --- |
| Blocks | `seccion`, `pantalla`, `flujo` |
| Charts | `area`, `barras`, `lineas`, `circular`, `radar`, `radial`, `tooltip` |

An unknown category also works: it shows with its name, after the known ones.

## Technology

- **Tailwind 4 and shadcn/ui primitives** (new-york-v4 style, MIT license), copied into `components/ui/`. Only the kit's interface uses them. Entry examples do not: they render in an iframe with the production CSS.
- **Tokens** in `app/globals.css`, with the shadcn convention (`x` and `x-foreground` pairs in oklch, radius scale), plus `--estado-*` and `--nuevo`.
- **Typography**: Geist and Geist Mono.
- **Code**: highlighted with Shiki, with a light theme and a dark one.

## Shortcuts

- `⌘K` or `/`: search.
- `⌘D`: light or dark mode.
