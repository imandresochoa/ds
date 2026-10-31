# Design System Agentic First Kit

Kit para crear sistemas de diseño **agentic-first** enlazados 1:1 con producción. Interfaz con la estructura de ui.shadcn.com. No nombra ningún producto: cada sistema vive en su propio repo y usa este kit como dependencia.

```
kit (este repo) ──npm──▶ <producto>-design-system ──ds sync──▶ repo de producción
```

## Crear un sistema

Con un agente (Claude Code o Codex):

```bash
npx @imandresochoa/ds@latest instalar
```

Instala la skill `montar-sistema` en tu usuario (`~/.claude/skills/` y `~/.agents/skills/`). Después, abre el agente en el repo de tu producto, o en una carpeta vacía, y escribe «monta el sistema de diseño». La skill pregunta de dónde partís (un repo, una web o Figma, o nada todavía) con los componentes de preguntas del agente, crea el repo del sistema junto al del producto y lo llena. Para quitar la skill: `npx @imandresochoa/ds instalar --quitar`.

Sin agente:

```bash
npx @imandresochoa/ds@latest init
```

Hace las mismas preguntas en la terminal. Más detalle en [`docs/metodologia/08-nuevo-sistema.md`](docs/metodologia/08-nuevo-sistema.md).

## Publicar

`npx ds build` exporta un sitio estático a `out/`. Va en la raíz de un dominio salvo que `system.json` declare una ruta:

```json
"publicacion": { "ruta": "/ds" }
```

Con ella, páginas, assets, enlaces, `.md`, `llms.txt` y ejemplos en vivo llevan `/ds` delante, y `out/` se sirve bajo esa ruta. Hace falta cuando el sistema vive dentro de otro sitio de Next (su `/_next` chocaría con el del sistema). Detalles en [`docs/metodologia/10-git-y-entornos.md`](docs/metodologia/10-git-y-entornos.md).

Cada sitio publica para agentes `llms.txt`, `design.md` y un registry de solo lectura: `/<sistema>/registry.json` es el índice y cada pieza tiene su JSON en `/<sistema>/r/<sección>/<slug>.json`.

### Varios sistemas en un sitio

```bash
npx @imandresochoa/ds init --directorio "Nuestros sistemas" --carpeta ../directorio --sistemas ../a-design-system,../b-design-system
```

El repo de directorio sirve juntos los sistemas de su `directorio.json`. La portada es el Directorio, con una tarjeta por sistema, y se publica `/directorio.json` para agentes. Ver [`docs/metodologia/09-kit.md`](docs/metodologia/09-kit.md).

## Comandos

Fuera de un sistema:

| Comando | Qué hace |
| --- | --- |
| `npx @imandresochoa/ds instalar` | Instala la skill `montar-sistema` en tu usuario, para Claude Code y Codex. |
| `npx @imandresochoa/ds init "<Nombre>"` | Crea el repo del sistema: plantilla, kit y skills. Con `--json` y parámetros, lo usa el agente. |
| `npx @imandresochoa/ds init --directorio` | Crea un repo de directorio, que sirve juntos varios sistemas. |

Desde el repo del sistema:

| Comando | Qué hace |
| --- | --- |
| `npx ds info [--json]` | Sistema, secciones, producción, último sync, skills y rutas del kit. |
| `npx ds search <texto>` | Busca fichas antes de crear una. |
| `npx ds ver <pieza>` | El JSON de una pieza, como en el registry: lo que usa, quién la usa, fuentes y sync. |
| `npx ds dev` | Servidor de desarrollo en http://localhost:4100. |
| `npx ds sync [--accept <id>]` | Lee producción: instantánea CSS, tokens, huellas, cobertura. |
| `npx ds check` | Falla si algo está desajustado, ausente o inventado. |
| `npx ds patrones [--json]` | Clases de hojas y prefijos distintos con la misma forma: piezas candidatas para el inventario. |
| `npx ds preset ver\|aplicar\|resolver` | Lee un preset del Lab de primitivos (`/<sistema>/lab`) y lo escribe en `experimental/`, nunca en producción. |
| `npx ds build` | Exporta el sitio estático a `out/`, para la raíz de un dominio o para la ruta de `publicacion.ruta` (`DS_RUTA` la cambia). |
| `npx ds skills` | Copia o actualiza las skills del kit en `.claude/skills/` (Claude Code) y `.agents/skills/` (Codex). |
| `npx ds doctor` | Comprueba la configuración. |
| `npx ds feedback --texto "<…>"` | Sugerencias anónimas para el kit. Enseña el JSON anonimizado y solo lo envía con tu sí (`--enviar`). |
| `npx ds version` | Versión del kit instalada. |
| `npx ds enlazar <ruta>` / `desenlazar` | Usa un checkout local del kit, o vuelve a la versión fijada. |

`ds dev`, `ds build` y `ds doctor` también funcionan en un repo de directorio.

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
| `app/`, `components/`, `lib/` | Interfaz (Next, exportación estática). `lib/meta.mjs` define secciones, estados y prompts; `lib/registry.mjs`, el registry; `lib/lab.mjs`, el Lab de primitivos. |
| `scripts/` | Sync con producción, publicación para agentes y diagnóstico. |
| `plantilla/` | Lo que `ds init` copia en un repo de sistema nuevo. |
| `skills/` | Skills para agentes que se instalan en cada sistema. |
| `systems/ejemplo/` | Sistema de ejemplo para desarrollar el kit. |
| `docs/metodologia/` | La metodología. Va en el paquete; el sitio de cada sistema la muestra solo si la activa. |
| `docs/DECISIONES.md`, `docs/TAREAS.md` | Decisiones con fecha y tareas del kit. |

## Licencia

[MIT](LICENSE). Las primitivas de `components/ui/` vienen de shadcn/ui, también con licencia MIT (ver su [README](components/ui/README.md)).
