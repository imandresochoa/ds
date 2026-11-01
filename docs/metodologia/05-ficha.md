---
titulo: Anatomía de una ficha
resumen: Cómo se escribe una ficha para que la entiendan una persona y un agente.
---

Una ficha es un archivo `slug.md` o una carpeta `slug/` con `index.md` y un archivo por plataforma (`web.md`, `ios.md`, `android.md`). Usa carpeta cuando la ficha tenga implementación por plataforma.

## Frontmatter

```yaml
---
titulo: Botón
resumen: Una frase. Qué es y cuándo se usa.
estado: produccion            # exploracion | desarrollo | produccion | obsoleto
funcion: acciones             # componentes: acciones | navegacion | formularios | feedback | contenido | superposiciones (ordena llms.txt y el registry)
nivel: atomo                  # componentes: atomo | molecula | organismo (regla de composición)
categoria: seccion            # bloques: seccion | pantalla | flujo · gráficos: area | barras | lineas | circular | radar | radial | tooltip
destacado: true               # opcional: su primer ejemplo sale en la home
grupo: Base                   # fundamentos: agrupación en la barra lateral
creado: 2026-10-11
actualizado: 2026-10-11
iniciativa: sistema-agentic-first   # opcional
tokens: [ink, paper]          # tokens que usa (en un fundamento: los que documenta, con nombre y rol)
usa: [componentes/icono]      # piezas que compone: el grafo del registry (los tokens entran solos)
relacionados: [componentes/enlace-de-texto]   # ver también: no es una dependencia
plataformas:
  web:
    estado: produccion
    superficies: [...]        # ver «Enlace con producción»
  ios:
    estado: sin-iniciar
---
```

## Cuerpo común (`index.md`)

En este orden, omitiendo lo que no aplique:

1. **Cuándo usarlo** y **Cuándo no**, con la alternativa enlazada.
2. **Reglas**, en tabla: la regla y cómo se comprueba.
3. **Antipatrones**, con nombre en negrita.
4. **Accesibilidad**.
5. **Diferencias entre superficies**: observaciones del sync. No son decisiones.

Los títulos `## Reglas` y `## Antipatrones` pasan tal cual al JSON de la pieza (`reglas` y `antipatrones`): no los renombres. `## Rechaza estos reflejos`, el nombre anterior, se sigue leyendo como antipatrones.

## Cuerpo por plataforma (`web.md`)

- Un apartado por superficie (Landing, Portal).
- Ejemplos en vivo con bloques ` ```html preview ` . Opciones, todas opcionales:
  - `superficie=portal`: qué superficie lo pinta. Por defecto, la primera.
  - `fondo=night`: cualquier token de color.
  - `alinear=inicio`: el contenido arranca a la izquierda en vez de centrado.
  - `vista=720` o `vista` sola: alto de la vista del marco en px, lo que vale `100vh` dentro. Sola, usa `altoVista` de la superficie (640 por defecto). Con ella, el marco mide eso y el ejemplo va sin margen: es para primeras pantallas y pantallas completas.
  - `modo=light`: modo con el que se abre el ejemplo, si la superficie tiene varios. Por defecto, el modo base.
- El ejemplo sale en una tarjeta compacta con el código plegado bajo «Ver código», también cuando es corto. Un ejemplo que se entiende sin leer el código es un buen ejemplo.
- El marco mide lo que ocupa el ejemplo aunque la hoja del producto fije `html, body { height: 100% }`. Si el contenido depende del alto de la vista (`100vh`, `100dvh`), el marco no crece sin fin: se queda en el alto de vista de la superficie y el contenido se desplaza dentro. No hace falta `min-height` en línea ni `cssExtra` para eso.
- Si la superficie tiene más de un modo en el último sync (`tokens.<superficie>.modos` del informe), el marco lleva un conmutador (Claro, Oscuro…) en la franja del pie. Aplica el selector del modo en el documento del ejemplo: el atributo o la clase en `html` (o en `body`, si el selector es de `body`). Un modo que solo existe como `@media (prefers-color-scheme: …)` se emula reescribiendo esas condiciones en las hojas del marco, porque el navegador no deja fijar la preferencia de un iframe.
- El código de uso para copiar (` ```tsx `, ` ```swift `, ` ```kotlin `).
- La **API** en tabla: clases o props, qué hacen y valores por defecto.

## Páginas de Docs

Las páginas que no son fichas (introducción, instalación, guías) van en `content/docs/`. `index.md` es la Introducción; sin él, la Introducción es `DESIGN.md` sin su título. El orden se fija en `content/docs/meta.json` con `{"paginas": ["instalacion", "..."]}`. `produccion` y `agentes` están reservados: esas páginas las pone el kit.

## Un fundamento y sus tokens

Un tema (color, tipografía, espaciado, movimiento) tiene una sola ficha, en Fundamentos, con el criterio y los valores juntos.

- **El cuerpo** explica cómo y cuándo se usa (reglas, antipatrones), como cualquier fundamento.
- **`tokens`** lista los que documenta, con su rol. El valor no se escribe: el kit pinta la tabla con el de producción en el último sync, uno por superficie y por modo. Si un token está también en `experimental/` (por ejemplo, porque salió del Lab de primitivos), la tabla enseña ese valor en la columna «Experimental».

```yaml
tokens:
  - nombre: ink
    rol: Lo que se lee primero (títulos, cuerpo).
  - nombre: paper
    rol: El suelo de la página.
```

- **La tabla** va en el apartado `## Tokens` del cuerpo, debajo de su texto (de dónde salen, qué superficies los usan). Sin ese apartado, el kit lo añade al final. Entra en «En esta página».
- En las demás secciones, `tokens` sigue siendo la lista de los que usa la pieza, sin rol.

## `usa` y `relacionados`

- **`usa`** dice qué piezas compone esta: los componentes de un bloque, o el icono dentro de un botón. Con ella, el registry arma el grafo (`usa` y `usadoPor`) y un agente sabe qué se ve afectado si cambia una pieza. Los `tokens` que usa una pieza entran solos en el grafo, a través del fundamento que los documenta.
- **`relacionados`** es «ver también»: otro fundamento del mismo tema, o el sustituto de una pieza obsoleta. No es una dependencia.
- Un id de `usa` que no existe se avisa en `ds build` y `ds dev`.

## Escribir para agentes

- Frases cortas y comprobables. Nada de «elegante» o «limpio».
- Nombres exactos de clases y tokens, en código.
- Los ejemplos usan textos reales aprobados de producción. Nunca se inventa copy.
- Lo que falta se dice: «Pendiente de documentar». No se rellena.
