---
name: nueva-ficha
description: Crea o completa una ficha del sistema de diseño (componente, bloque, gráfico, fundamento, token o iniciativa) enlazada a producción. Úsala cuando pidan documentar una pieza, «añade el componente X» o «documenta esta sección».
---

# Crear una ficha

Lee primero la metodología del kit (ruta en `npx ds info --json` → `kit.metodologia`): `05-ficha.md` (anatomía) y `03-estados.md` (estados). Antes de crear una ficha, comprueba con `npx ds search <nombre>` que no existe ya. `npx ds ver <pieza>` te da lo que usa una pieza y quién la usa.

`usa` es lo que la pieza compone (el grafo del registry); `relacionados`, «ver también». No los mezcles.

## 1. Decide sección y forma

| Qué es | Sección | Campos clave |
| --- | --- | --- |
| Criterio (cómo y cuándo) | `fundamentos` | `relacionados` a sus tokens |
| Valores con nombre | `tokens` | `grupo`, `tokens: [{nombre, rol}]` |
| Pieza reutilizable | `componentes` | `funcion` (acciones, navegacion, formularios, feedback, contenido, superposiciones), `nivel` (atomo, molecula, organismo), `usa` si compone otros |
| Composición | `bloques` | `categoria` (seccion, pantalla, flujo), `usa` con los componentes que compone |
| Presentación de datos | `graficos` | `categoria` (area, barras, lineas, circular, radar, radial, tooltip), `tokens` de color |
| Página de documentación | `content/docs/` | `titulo`, `resumen`; orden en `content/docs/meta.json` |
| Trabajo en curso | `iniciativas` | secciones fijas: Resumen, Referencias, Exploración, Flujos, Handoff, Playground |

Archivo único `content/<sección>/<slug>.md`, o carpeta `<slug>/index.md` + `web.md`/`ios.md`/`android.md` si hay varias plataformas.

## 2. Si existe en producción

1. Busca la pieza en el repo de producción y lee su código y su CSS.
2. Declara `plataformas.web.superficies` con `id` (superficie de `system.json`), `fuente` (ruta en producción) y `clases` (las clases propias de la pieza, sin las de utilidades).
3. Estado `produccion`.
4. Ejemplos en vivo con ```` ```html preview superficie=<id> ```` usando **solo clases que existen** y **textos copiados de producción** (nunca inventados ni reescritos).
5. `npx ds sync`: la ficha queda «Pendiente de verificar». Revisa el informe; si las clases existen y la ficha describe el código real, `npx ds sync --accept <sección>/<slug>`.

## 3. Si no existe en producción

Estado `exploracion`. Si necesita estilos, van en `experimental/<slug>.css`. Si forma parte de un proyecto mayor, añade `iniciativa: <slug>`.

Si son tokens y la persona quiere elegir sus valores, que los ajuste en el Lab de primitivos (`/<id>/lab` con `npx ds dev`) y sigue el apartado «Aplicar un preset del Lab» de la skill `montar-sistema`. Si no, escríbelos en `experimental/tokens.css`. La ficha enseña los valores de `experimental/` en su columna «Experimental».

## 4. Contenido

- Una frase de `resumen`: qué es y cuándo se usa.
- Reglas **observables** (que se puedan comprobar mirando la interfaz).
- **Rechaza estos reflejos**: antipatrones con nombre.
- Lo que no sepas: «Pendiente».

## 5. Cierra

Reinicia `npx ds dev` (las rutas son estáticas), revisa la página y ejecuta `npx ds check`.
