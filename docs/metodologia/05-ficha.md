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
grupo: Base                   # tokens y fundamentos: agrupación en la barra lateral
creado: 2026-10-11
actualizado: 2026-10-11
iniciativa: sistema-agentic-first   # opcional
tokens: [ink, paper]          # tokens que usa (en fichas de tokens: lista con nombre y rol)
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

## Cuerpo por plataforma (`web.md`)

- Un apartado por superficie (Landing, Portal).
- Ejemplos en vivo con bloques ` ```html preview ` . Opciones: `superficie=portal`, `fondo=night` (cualquier token de color).
- El código de uso para copiar (` ```tsx `, ` ```swift `, ` ```kotlin `).
- La **API** en tabla: clases o props, qué hacen y valores por defecto.

## Páginas de Docs

Las páginas que no son fichas (introducción, instalación, guías) van en `content/docs/`. `index.md` es la Introducción; sin él, la Introducción es `DESIGN.md` sin su título. El orden se fija en `content/docs/meta.json` con `{"paginas": ["instalacion", "..."]}`. `produccion` y `agentes` están reservados: esas páginas las pone el kit.

## Fundamento y tokens: sin solaparse

- **El fundamento** explica cómo y cuándo se usa algo (reglas, antipatrones) y enlaza a sus tokens.
- **La ficha de tokens** solo tiene la tabla: nombre, rol y valor de producción. Si un token está también en `experimental/` (por ejemplo, porque salió del Lab de primitivos), la tabla enseña ese valor en la columna «Experimental». Las reglas de uso no van ahí.
- Se enlazan entre sí con `relacionados`.

## `usa` y `relacionados`

- **`usa`** dice qué piezas compone esta: los componentes de un bloque, o el icono dentro de un botón. Con ella, el registry arma el grafo (`usa` y `usadoPor`) y un agente sabe qué se ve afectado si cambia una pieza. Los `tokens` de la ficha entran solos en el grafo, a través de la ficha de tokens que los documenta.
- **`relacionados`** es «ver también»: el fundamento de una ficha de tokens, o el sustituto de una pieza obsoleta. No es una dependencia.
- Un id de `usa` que no existe se avisa en `ds build` y `ds dev`.

## Escribir para agentes

- Frases cortas y comprobables. Nada de «elegante» o «limpio».
- Nombres exactos de clases y tokens, en código.
- Los ejemplos usan textos reales aprobados de producción. Nunca se inventa copy.
- Lo que falta se dice: «Pendiente de documentar». No se rellena.
