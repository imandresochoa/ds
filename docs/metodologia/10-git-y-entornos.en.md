---
titulo: Git, GitHub and environments
resumen: How a change enters the kit, a system and production, who merges in each one, where the system fits in the product's environments and how it is published.
origen: "6d3769609aac"
---

The 1:1 link with production only holds if changes always come in the same way: a branch, a pull request with checks and a deliberate merge.

## Minimum vocabulary

| Term | What it is |
| --- | --- |
| **Repository** | A project's folder with its whole history. Git keeps the history; GitHub keeps a shared copy. |
| **Commit** | A snapshot of the changes with a message that explains what changes and why. |
| **Branch** | A parallel line of commits. It lets you work without touching what already works. |
| **`main`** | The main branch, the official version. Other branches start from it and go back to it. |
| **Pull request (PR)** | The request, on GitHub, to join a branch into `main`. It shows what changes and lets you review and check before accepting. |
| **Merge** | Accepting the PR: the branch's commits move into `main`. |
| **CI** | A robot (GitHub Actions) that runs the checks on each PR and marks the result green or red. |
| **Environment** | A copy of the product that runs on its own, with its website, its database and its keys. |
| **Production** | The environment customers use. |
| **Staging** | An environment identical to production, with no customers and with test data. The dress rehearsal. |
| **Preview** | A temporary environment for a specific PR, which disappears when it closes. |
| **Promotion** | Taking to production the same version that already worked in staging. |
| **Rollback** | Going back to the previous version when the new one fails. |

## How a change comes in

The flow is GitHub Flow, the same in all three repos:

1. Start from an up-to-date `main` and create a branch with a name that says what is being done.
2. Make small commits. In a system, the message names the entry's `id` (`feat(ds): componentes/boton …`).
3. Push the branch and open a PR. The description answers three questions: **what changes, why, and how it was tested** (with the commands run and their result).
4. Wait for CI and review. If something fails, more commits on the same branch.
5. Merge and delete the branch.

```bash
git switch main && git pull
git switch -c componentes-boton-tamanos
# cambios…
git add . && git commit -m "feat(ds): componentes/boton documenta los tamaños"
git push -u origin componentes-boton-tamanos
gh pr create      # o desde la web de GitHub
```

Rules:

- **`main` always works.** Nobody works directly on it.
- **One PR, one change.** A batch of entries can go in one PR; a batch and an interface change cannot.
- **Branches are short-lived**: hours or a few days. The longer a branch lives, the more conflicts.

## The three repos

| | Kit | System | Production |
| --- | --- | --- | --- |
| **Checks before merge** | The “Comprobar” workflow: `npm ci`, types, build and a test `ds init`. | `ds sync` and `ds check` green. | The product's tests and, once there is CI, the system's `ds check`. |
| **What happens on merge** | Nothing is published on its own. If something systems use changes, a version is tagged (see “Kit and systems”). | The system is published, if it is deployed. | It deploys: to production if there is no staging; to staging if there is. |
| **Who merges** | Whoever maintains the kit; an agent, if it has explicit authorization and the checks pass. | Same as the kit. | **Always a person responsible for the product.** An agent opens the PR, but does not merge. |

Merging in production is different because, without staging, **merging is deploying**: the change reaches customers in minutes. That is why that decision is not delegated.

## Rules for agents

- One branch per task. Never commits on `main`.
- Before opening a PR in a system: `npx ds sync` and `npx ds check`. The result goes in the description.
- In production, open the PR and stop. If the production checkout has someone else's uncommitted changes, they are not touched: work in a separate copy of the repo with `git worktree add`, which creates another folder with its own branch on the same history.
- If a check fails, it is fixed on the branch; the check is not turned off.

## The product's environments and the system

### Without staging

This is where many products start: what goes into `main` goes out to production. That is why the system lives in its own repo (see “Kit and systems”): documenting cannot break the product. The sync's fingerprints detect any change in production the next time `ds sync` runs.

### With staging

When the product has staging and CI, the system hooks into that CI:

```
Rama + PR ──▶ CI: tests + ds check ──▶ merge: main → staging ──▶ probar ──▶ promoción → producción
```

1. **`ds check` on every production PR.** CI downloads the system repo next to the production one and runs `npx ds sync` and `npx ds check`. At first it only **warns**: the out-of-step entry is updated in a system PR. Once the entries are complete, it **blocks** the merge.
2. **Staging to review design for real.** Design changes are looked at in staging, with demo data, before promoting. With per-PR previews, design and copy review happens on the preview link, before the merge.
3. **Initiatives.** A piece from an initiative reaches production the same way: PR in production, staging and promotion. Its entry moves from “In development” to “In production” when the version reaches production, not when it is merged into staging.

## Publishing the system

`npx ds build` exports the site to `out/`: the pages in HTML, their `.md` version (Docs pages too: `/<sistema>/docs.md` and `/<sistema>/docs/<página>.md`), `design.md`, `llms.txt`, `llms-full.txt`, `registry.json` with one piece per file in `r/` and, in a directory, `/directorio.json`. Also the production snapshot the live examples load (`/_ds/`). It is a static site: any file host that resolves `/x` to `x.html` can serve it.

### At the root or under a path

By default, the site goes at the root of a domain (`https://ds.producto.com/<id>/…`). If it has to live inside another site, under a folder, the path is declared in `system.json`:

```json
"publicacion": { "ruta": "/ds" }
```

With it, `ds build` puts `/ds` in front of everything the site writes: the pages, `/_next`, the interface and entry links, the `.md` files, the links in `llms.txt`, `design.md`, `registry.json` and the pieces in `r/`, and the live examples' stylesheets. `out/` does not change shape (it has no `ds/` folder inside): whoever serves it strips the path before looking up the file, so `https://dominio/ds/x` responds with `out/x`.

- In a directory, the path is declared in its `directorio.json` and each system's own path does not count.
- `DS_RUTA` beats `system.json` (and `directorio.json`) for a given build: `DS_RUTA=/otra npx ds build`, or `DS_RUTA= npx ds build` to export at the root.
- `ds dev` always serves at the root, with or without a path.
- `ds doctor` says where it is published and fails if the path is not valid (one or more folders, no spaces: `/ds`, `/sistema/diseno`).

When the path is needed:

| The system is published… | Path |
| --- | --- |
| On its own domain or subdomain. | None. |
| Inside another site, with rewrites, and that site does not use `/_next`, `/_ds`, `/llms.txt`, `/directorio.json` or `/<id>`. | None: it can be mounted at the root. |
| Inside another site that is also Next (a prototype, the product's website). | Yes: its `/_next` collides with the system's. |

With rewrites, the path is the same on both sides: the system is exported with `/ds` and the host site sends `/ds/:path*` to the system's deployment without the path (`https://<despliegue del sistema>/:path*`). Any access control or `noindex` is set by the host site; the system does not know about it.

## Written decisions

Each team's way of working (branch flow, environments, who promotes) is decided once and written in a decision record (ADR): a short file with context, decision and consequences. The system's own decisions go in its `docs/DECISIONES.md`.
