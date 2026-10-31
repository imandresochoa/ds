---
titulo: Agent layer
resumen: What an agent reads, in what order, and how the guide improves with evaluations.
origen: "c14f50cf98b0"
---

## What the system publishes

| Resource | What for |
| --- | --- |
| `/llms.txt` | Index of all systems and entries, with links to their Markdown. |
| `/<sistema>/design.md` | Entry point. Hand-written judgment (`DESIGN.md`) and a generated appendix: statuses, public class API, entries and production tokens. |
| `/<sistema>/registry.json` | Registry index: each piece with its type, status, categories and the link to its JSON. Also the production tokens and their modes. |
| `/<sistema>/r/<sección>/<slug>.json` | One piece: status per platform, what it uses and what uses it, sources, sync, rules and anti-patterns. |
| `/<sistema>/llms-full.txt` | All entries in a single file. |
| `/directorio.json` | Only in a directory: each system with its coverage and the link to its registry. |
| `<ruta de la ficha>.md` | Each page in Markdown, at the same path. |
| `/en/llms.txt`, `/en/<sistema>/…` | With a translation (`idiomas` in `system.json`): the same in English, except the registry and the directory, which exist only in the main language. |

In the interface, “Copy page” copies each page as Markdown and the “Working with an agent?” card copies a context ready to paste. From the terminal, `npx ds info --json`, `npx ds search <texto> --json` and `npx ds ver <pieza>` give an agent the same thing without opening the site or building: `search` returns pieces in the index's shape and `ver`, a piece's JSON. The Primitives Lab passes its changes as a link: `npx ds preset ver` reads it and `npx ds preset aplicar` writes it to `experimental/`.

## Reading order for an agent

1. The system's `design.md`.
2. The specific entry (`.md`), or its JSON in `r/` if it needs data: what it uses, what uses it and its sync.
3. If it is going to write copy, the voice guide linked from Foundations.
4. If it is going to create something new, this methodology.

## The registry is read-only

From shadcn/ui we take the shape: an index and one JSON per piece, with its type, its dependencies (`usa`) and its categories. It is not compatible with `npx shadcn add`, on purpose: nothing in the system writes to the production repo. A piece enters production through a PR that a person approves.

## Prompts in the “New” button

Each section has an action (“Propose a component”, “Open an initiative”…) that copies a prompt with the paths and rules of the method. They live in `lib/meta.mjs`.

## Improving the guide with evaluations

Adapted from how Vercel works with its `DESIGN.md`:

- A fixed set of scenarios (prompt, data and screen size frozen) in `evals/`.
- Before changing the guide, the baseline result is saved.
- Each fix goes to the narrowest place that can enforce it: prose in `DESIGN.md`, mechanics in the CSS, or a check in the sync.
- The scenarios are rerun to confirm the fix holds, and a small hidden set is kept that nobody looks at while editing.
- A person reviews each final change.

It is pending in the [kit tasks](https://github.com/imandresochoa/ds/blob/main/docs/TAREAS.md).

## Skills

The kit installs skills in each system (`ds init` and `ds skills`): in `.claude/skills/` for Claude Code and in `.agents/skills/` for Codex. They turn the steps of this methodology into procedures an agent follows without improvising:

| Skill | When |
| --- | --- |
| `montar-sistema` | Set up a system from a product's repo, website or Figma, or from scratch, and apply a Lab preset. It is the entry skill: `ds instalar` puts it in the user folder so it can be used before the system exists. |
| `inventariar-produccion` | Plan what to document, with priorities and batches. |
| `nueva-ficha` | Document a component, block, chart, foundation, token or initiative. |
| `auditar-sistema` | Check that everything matches production and fix it. Before publishing, after each merge in production and as a scheduled daily routine (“Rutina diaria” section of `AGENTS.md`). |
| `revisar-sync` | Understand what changed in production and update or accept entries. |
| `actualizar-kit` | Upgrade the kit version in a system. |
| `mejorar-kit` | Take an improvement found in a system to the kit. |

Skills live in the kit (`skills/`) and are updated with it. They are not edited in the system repo.

## Questions for the person

When a skill needs a decision, it asks with the agent's question tool, not in loose text:

- **Claude Code**: `AskUserQuestion`. 1 to 4 questions per call, 2 to 4 options each, and the “Other” option always available.
- **Codex**: `request_user_input`. It only works in Plan mode; outside it the skill asks in text.

Skills use 3 options at most, short and with the recommended one first, so they work in both. Free-form answers (a path, a URL) are asked for in a normal message. If there is no tool, the question goes with numbered options and the skill waits for the answer.
