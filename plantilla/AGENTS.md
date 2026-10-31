# AGENTS.md — NOMBRE_DEL_SISTEMA

Repo del sistema de diseño de NOMBRE_DEL_SISTEMA. Aquí solo vive el **contenido**: la interfaz, los scripts y la metodología vienen del kit (`@imandresochoa/ds`, dependencia de npm). Léelo entero antes de cambiar nada.

## Mapa

| Ruta | Qué hay |
| --- | --- |
| `system.json` | Configuración: id, nombre, repo de producción, superficies y plataformas. |
| `DESIGN.md` | Criterio para agentes, escrito a mano. Se publica como `/<id>/design.md` con un apéndice generado. |
| `content/<sección>/` | Fichas en Markdown con frontmatter YAML: `fundamentos`, `tokens`, `componentes`, `bloques`, `graficos`, `iniciativas`. Las páginas de Docs, en `content/docs/`. |
| `docs/INVENTARIO.md` | Plan de fichas por tandas: lo hecho, lo que falta y las dudas. Lo crea la skill `inventariar-produccion`. |
| `experimental/` | CSS de piezas en exploración o desarrollo (aún no están en producción). |
| `produccion/`, `tokens.produccion.json`, `sync-report.json` | Generados por `ds sync`. No se editan. |
| `produccion.lock.json` | Huellas revisadas. Solo cambia con `ds sync --accept`. |
| `.claude/skills/`, `.agents/skills/` | Skills del kit para Claude Code y para Codex. Se actualizan con `npx ds skills`; no las edites aquí. |
| Metodología del kit | La fuente de verdad. Su ruta: `npx ds info --json` → `kit.metodologia`. |

## Reglas

1. **Producción manda.** Documenta cómo es, no cómo debería ser. Lo nuevo va con estado `exploracion`.
2. **No toques el repo de producción** desde aquí salvo que te lo pidan expresamente.
3. **No aceptes huellas sin revisar.** `npx ds sync --accept <id>` solo después de leer el cambio y actualizar la ficha.
4. **No inventes clases, tokens ni textos.** Los ejemplos usan clases que existen (el sync lo comprueba) y textos reales de producción.
5. **Si falta algo, dilo.** Escribe «Pendiente» en lugar de rellenar con suposiciones.
6. **No cambies la interfaz aquí.** Si algo del motor falla o falta, se arregla en el kit (skill `mejorar-kit`).
7. Nombra el `id` de la ficha en los commits: `feat(ds): componentes/boton …`.

## Comandos

```bash
npx ds dev           # http://localhost:4100
npx ds sync          # lee producción: instantánea CSS, tokens, huellas e informe
npx ds check         # falla si hay fichas desajustadas, ausentes o con clases inventadas
npx ds patrones      # clases de hojas y prefijos distintos con la misma forma (piezas candidatas)
npx ds build         # exporta el sitio estático a out/ (bajo publicacion.ruta, si la hay)
npx ds doctor        # comprueba la configuración
npx ds info --json   # sistema, secciones, producción, skills y rutas del kit
npx ds search boton  # busca fichas antes de crear una
npx ds ver boton     # una pieza en JSON: lo que usa, quién la usa y su sync
npx ds preset ver "<enlace del Lab>"      # lee un preset del Lab de primitivos: valores y contraste
npx ds preset aplicar "<enlace del Lab>"  # lo escribe en experimental/, nunca en producción
npx ds preset resolver                    # el enlace para reabrir en el Lab lo que hay en experimental/
npx ds skills        # actualiza las skills del kit
npx ds feedback --texto "<sugerencias>"   # sugerencias anónimas para el kit: enseña el JSON; --enviar, solo con el sí de la persona
```

Al crear una ficha nueva, reinicia `ds dev`: las rutas son estáticas.

Antes de terminar una tarea: `npx ds sync` y `npx ds check`.

## Rutina diaria

Una vez al día, un agente audita el sistema contra producción y arregla lo que no cuadra (skill `auditar-sistema`).

- Programada: sin programar. <!-- Cámbialo por dónde y a qué hora, por ejemplo «tarea programada de Claude Code, 9:00». -->

Si pone «sin programar», prográmala siguiendo el apartado «Rutina diaria» de la skill, o propónselo a la persona antes de terminar tu tarea.

## Skills

- `montar-sistema`: monta el sistema desde el repo, la web o Figma del producto, o desde cero (superficies, tokens, primeras fichas), y aplica los presets del Lab de primitivos.
- `nueva-ficha`: documenta un componente, bloque, gráfico, fundamento, token, iniciativa o página de Docs.
- `auditar-sistema`: revisa que todo el sistema cuadre con producción y arregla lo que no. Antes de publicar y tras cada merge en producción.
- `revisar-sync`: interpreta el informe de sync y propone qué actualizar o aceptar.
- `inventariar-produccion`: lista priorizada de lo que falta documentar.
- `recomendar-produccion`: recomendaciones para mejorar producción con su propio sistema (`docs/RECOMENDACIONES.md`).
- `actualizar-kit`: sube la versión del kit y revisa qué cambia.
- `mejorar-kit`: lleva al kit una mejora de la interfaz o del método.
