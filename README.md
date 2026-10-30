# Design System Agentic First Kit

Kit para crear sistemas de diseño **agentic-first** enlazados 1:1 con producción. Interfaz al estilo de Codex. No nombra ningún producto: cada sistema vive en su propio repo y usa este kit como dependencia.

```
kit (este repo) ──npm──▶ <producto>-design-system ──ds sync──▶ repo de producción
```

## Crear un sistema

```bash
mkdir producto-design-system && cd producto-design-system
git init && npm init -y
npm install github:imandresochoa/design-system-agentic-first-kit
npx ds init "Nombre del producto"
npx ds doctor
```

Después, pide a tu agente «adapta este sistema a mi repo de producción» (skill `crear-sistema`) o sigue [`docs/metodologia/08-nuevo-sistema.md`](docs/metodologia/08-nuevo-sistema.md).

## Publicar

`npx ds build` exporta un sitio estático a `out/`. Va en la raíz de un dominio salvo que `system.json` declare una ruta:

```json
"publicacion": { "ruta": "/ds" }
```

Con ella, páginas, assets, enlaces, `.md`, `llms.txt` y ejemplos en vivo llevan `/ds` delante, y `out/` se sirve bajo esa ruta. Hace falta cuando el sistema vive dentro de otro sitio de Next (su `/_next` chocaría con el del sistema). Detalles en [`docs/metodologia/10-git-y-entornos.md`](docs/metodologia/10-git-y-entornos.md).

## Comandos (desde el repo del sistema)

| Comando | Qué hace |
| --- | --- |
| `npx ds init "<Nombre>"` | Crea `system.json`, `DESIGN.md`, `AGENTS.md`, ficha de ejemplo y skills. |
| `npx ds dev` | Servidor de desarrollo en http://localhost:4100. |
| `npx ds sync [--accept <id>]` | Lee producción: instantánea CSS, tokens, huellas, cobertura. |
| `npx ds check` | Falla si algo está desajustado, ausente o inventado. |
| `npx ds build` | Exporta el sitio estático a `out/`, para la raíz de un dominio o para la ruta de `publicacion.ruta` (`DS_RUTA` la cambia). |
| `npx ds skills` | Copia o actualiza las skills del kit en `.claude/skills/`. |
| `npx ds doctor` | Comprueba la configuración. |

## Desarrollar el kit

```bash
npm install
npm run dev          # usa el sistema de ejemplo de systems/ejemplo
```

Para trabajar con datos reales, enlaza el kit desde un sistema (ver [`docs/metodologia/09-kit.md`](docs/metodologia/09-kit.md)).

## Qué hay dentro

| Ruta | Qué hay |
| --- | --- |
| `bin/ds.mjs` | CLI. |
| `app/`, `components/`, `lib/` | Interfaz (Next, exportación estática). `lib/meta.mjs` define secciones, estados y prompts. |
| `scripts/` | Sync con producción, publicación para agentes y diagnóstico. |
| `plantilla/` | Lo que `ds init` copia en un repo de sistema nuevo. |
| `skills/` | Skills para agentes que se instalan en cada sistema. |
| `systems/ejemplo/` | Sistema de ejemplo para desarrollar el kit. |
| `docs/metodologia/` | La metodología (interna). |
| `docs/DECISIONES.md`, `docs/TAREAS.md` | Decisiones con fecha y tareas del kit. |
