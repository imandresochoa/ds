---
titulo: States and initiatives
resumen: The path a piece takes to production and how work in progress is grouped.
origen: "7e8cf02272f2"
---

## States

| Status | Meaning | Can be used in production |
| --- | --- | --- |
| **Exploration** | Being designed. It may change or disappear. | No |
| **In development** | Defined and built in the system (CSS in `experimental/`), waiting to be taken to production. | No |
| **In production** | Exists in the production code and the sync checks it. | Yes |
| **Deprecated** | Still in production, but not used in new work. It will be removed. | Only what exists |

Platforms also have **Not started**: the entry exists but that platform has no implementation.

The status is declared in two places: in the entry (`estado`) and in each platform (`plataformas.web.estado`). A button can be in production on web and not started on iOS.

## Status of the link to production

`npx ds sync` computes it. It is not written by hand.

| Status | Meaning | What to do |
| --- | --- | --- |
| **Synced** | The code's fingerprint matches the reviewed one. | Nothing. |
| **Pending review** | New source, not reviewed yet. | Review the entry against the code and accept. |
| **Changed in production** | The code changed since the last review. | Update the entry and accept the new fingerprint. |
| **Not in production** | The source or one of the classes no longer exists. | Fix the entry or change its status. |

## How it looks in the interface

A single pill. The text is the status; the color, the combination of status and sync:

| Color | When |
| --- | --- |
| Green | In production and synced. |
| Amber | In production, but it changed in production or is pending review. The entry needs a review. |
| Red | In production, but the source or a declared class no longer exists. It is an error. |
| Blue | In development. |
| Violet | Exploration. |
| Gray | Deprecated. |

## How a piece moves up to production

1. **Exploration.** New entry with `estado: exploracion`. If it has styles, they go in `experimental/*.css`; the live examples already load them. Tokens can come from the Primitives Lab (`npx ds preset aplicar`). In an existing product, that change goes in an initiative.
2. **In development.** The design is closed. It is built in the system and reviewed.
3. **Production.** The code is taken to the product repo. The entry declares its sources (`superficies`), the experimental CSS is deleted and the status changes. `npx ds sync --accept <id>` saves the fingerprint.
4. **Deprecated.** When something is going to be removed, it is marked this way and its replacement is linked in `relacionados`.

## Initiatives

An initiative groups new work that is not in production yet: a customer area 2.0, an illustration system, a new section. The initiative's entries name it in `iniciativa:` and are linked from it.

Every initiative has the same sections, so anyone knows where to look:

- **Summary**: what it aims to achieve and for whom.
- **References**: screenshots, links and starting documents.
- **Exploration**: alternatives and decisions.
- **Flows**: user journeys over real screens.
- **Handoff**: what is approved to build. Only approved work goes here, never explorations.
- **Playground**: live tests.

When an initiative reaches production, its status changes to `produccion` and its entries no longer depend on it.

## Traceability

- Commits that touch an entry name its `id`: `feat(ds): componentes/boton añade variante light`.
- Method decisions, with date and reason, go in the [kit decisions](https://github.com/imandresochoa/ds/blob/main/docs/DECISIONES.md). They are not rewritten: a new entry is added that corrects the previous one.
