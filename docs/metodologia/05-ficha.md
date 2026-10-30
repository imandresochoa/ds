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
funcion: acciones             # componentes: acciones | navegacion | formularios | feedback | contenido | superposiciones (agrupa la barra lateral)
nivel: atomo                  # componentes: atomo | molecula | organismo (regla de composición) · patrones: seccion | pantalla | flujo
grupo: Base                   # tokens y fundamentos: agrupación en la barra lateral
creado: 2026-10-11
actualizado: 2026-10-11
iniciativa: sistema-agentic-first   # opcional
tokens: [ink, paper]          # tokens que usa (en fichas de tokens: lista con nombre y rol)
relacionados: [componentes/enlace-de-texto]
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

## Fundamento y tokens: sin solaparse

- **El fundamento** explica cómo y cuándo se usa algo (reglas, antipatrones) y enlaza a sus tokens.
- **La ficha de tokens** solo tiene la tabla: nombre, rol y valor de producción. Las reglas de uso no van ahí.
- Se enlazan entre sí con `relacionados`.

## Escribir para agentes

- Frases cortas y comprobables. Nada de «elegante» o «limpio».
- Nombres exactos de clases y tokens, en código.
- Los ejemplos usan textos reales aprobados de producción. Nunca se inventa copy.
- Lo que falta se dice: «Pendiente de documentar». No se rellena.
