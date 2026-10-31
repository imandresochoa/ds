---
titulo: Layers and nested systems
resumen: The layers of the system, from foundations to charts, and systems that inherit from others.
origen: "2766d8186621"
---

## The layers

Each entry belongs to a layer. Layers go from judgment to the most composed; a layer only uses pieces from the ones before it. What a piece composes is declared in `usa` (see “Anatomy of an entry”). Foundations come first because they are the why; tokens are that judgment turned into values.

| Layer | What it contains | Example |
| --- | --- | --- |
| **Foundations** | Rules of judgment: typography, color, layout, motion, voice, illustration. They explain how and when, and link to their tokens. | “Headlines are set in a light serif” |
| **Tokens** | Named values and their role, one per mode if the product has several (light, dark). They are read from the production code or, while they are not there yet, from `experimental/`. | `--ink`, `--radius-lg`, `--dur-micro` |
| **Components** | Reusable pieces. They are listed **in alphabetical order**, as in shadcn; their **function** and their **atomic level** are entry data. | Button, Text link, Header |
| **Blocks** | Compositions that solve a problem. They are grouped by `categoria`: **sections**, **screens** and **flows**. | Hero, Pricing, Sign-up |
| **Charts** | How the product presents data. They are grouped by `categoria`: area, bar, line, pie, radar, radial and tooltip. | Revenue by month |
| **Surfaces** | The real pages in production. Today they live in production; the system links to them. | Landing, customer area |

### Alphabetical list to browse, atomic level to compose

shadcn/ui lists components in alphabetical order and marks the new ones; so do we. The `funcion` (actions, navigation, forms, feedback, content, overlays) orders `llms.txt` and the registry, but not the sidebar. The atomic level (`nivel: atomo | molecula | organismo`) stays in each entry as an internal rule: an atom uses no other components, a molecule uses atoms and an organism uses molecules or atoms. What each one uses goes in `usa`. It serves the method and agents, not search.

Blocks and Charts are structure: the kit ships none. Each system fills them with what exists in its product.

**Initiatives** are not a layer: they group work in progress that cuts across layers (see States).

Before 1.0, blocks were called **patterns** and their category went in `nivel`. Both forms are still read: `content/patrones/` shows up as Blocks and `nivel: seccion` counts as `categoria: seccion`.

## Nested systems

A system can **extend** another (`"extiende"` in `system.json`). The child system inherits the parent's structure, rules and tokens and only redefines its own.

```
base (metodología, shell, tokens neutros)
├── producto-a (marca, landing, área de cliente)
└── producto-b (marca, app)
```

Inheritance rules:

- Tokens are redefined by name. A child does not invent a new name for a role that already exists in the parent.
- The parent's entries appear in the child unless the child replaces them with the same `id`.
- The methodology is shared: it lives in the kit (`docs/metodologia/`), it is not duplicated per system, and a system's site only shows it if it turns it on (`"metodologia": true`).

The `base` system and inheritance resolution are pending (see the [kit tasks](https://github.com/imandresochoa/ds/blob/main/docs/TAREAS.md)).

## Three token levels

When a system grows, tokens split into three levels:

1. **Primitive**: the raw palette and scales (`--gray-900`).
2. **Semantic**: the role (`--ink`, `--paper`). This is what components use.
3. **Component**: local adjustments (`--btn-bg`).

Start with semantic tokens and add component tokens when a component needs them. Primitives are only needed when several brands or themes share a palette.

## Token names

- **A new system** uses shadcn names for semantic tokens: `x` and `x-foreground` pairs (`--primary` and `--primary-foreground`), `--background`, `--foreground`, `--muted`, `--border`, `--ring` and `--radius` with its scale. For the rest it uses Tailwind 4 names: `--spacing`, `--text-*`, `--font-*`, `--leading-*`, `--shadow-*` and `--ease-*`. Durations, which have no name in Tailwind, are `--duration-fast`, `--duration-normal` and `--duration-slow`. These are the names the Primitives Lab generates, and an agent recognizes them without explanation.
- **An existing product** keeps its own. The system documents what the product is like: it does not rename it.

## Modes

A mode (light, dark, high contrast, a second brand) is not a layer or a separate set of tokens: it is another value for the same tokens. That is why it lives inside the tokens layer.

- A token has one value per mode. A mode redefines names that already exist and does not invent others: `--ink` in dark, not `--ink-dark`.
- Modes change semantic tokens. Primitives are the palette and do not change by mode; component tokens point to semantic ones and change with them.
- The tokens entry shows the values for each mode side by side. If a role reads well in light and not in dark, the fault is in the token, not the component.
- A new token in a product with modes is proposed with a value for each mode.

The sync reads modes from the production CSS (see “Link to production”).
