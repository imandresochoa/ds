---
titulo: Reporte al terminar
resumen: Lo que un agente cuenta a la persona al acabar cada tarea, con evidencia, y cómo una corrección que se repite se convierte en una comprobación.
---

Un agente que termina sin contar qué ha hecho obliga a la persona a reconstruirlo leyendo el diff. Uno que lo cuenta sin pruebas («funciona») le pide que se fíe. Por eso cada tarea acaba con un reporte corto, siempre con los mismos apartados y con evidencia.

El reporte **informa; no sustituye la revisión.** Lo que decide un merge es el diff, las comprobaciones y la CI. Un resumen final suele mencionar una parte pequeña de lo que hizo el agente: por eso tiene que decir dónde mirar, no pedir que no se mire.

## Los cinco apartados

| Apartado | Qué lleva | Ejemplo |
| --- | --- | --- |
| **Qué cambió** | Las fichas por su `id` y los archivos que no son fichas. Lo que ve la persona, no la lista de pasos. | `componentes/boton`: documenta los tamaños. `system.json`: nueva superficie `portal`. |
| **Por qué** | Las decisiones en las que se apoya y las que propone, con enlace. | Sigue `decisiones/0002`. Propone `decisiones/0007` (en «propuesta»). |
| **Cómo se comprobó** | Los comandos que se ejecutaron y su resultado, no una valoración. Lo visual, con lo que se miró. | `npx ds sync` y `npx ds check`: 0 errores, 1 aviso (abajo). Ficha revisada en `ds dev`, claro y oscuro. |
| **Qué no se hizo** | Lo descartado, lo que no se pudo comprobar y los avisos pendientes. | No se aceptó la huella de `componentes/tabla`: el cambio de producción no está claro. |
| **Qué necesita de ti** | Las decisiones o los pasos que son de la persona: aceptar una decisión, revisar un PR, una duda. Si no hay nada, se dice. | Aceptar o rechazar `decisiones/0007`. Revisar el PR #12. |

Reglas:

- **Corto.** Unas pocas líneas por apartado. Si hace falta más, el detalle va en el PR y el reporte lo enlaza.
- **Evidencia, no adjetivos.** «El build pasó» no prueba que una ficha diga la verdad; el check y lo que se miró, sí. Si algo no se comprobó, se dice en «Qué no se hizo».
- **Lo descartado también cuenta.** Lo que el agente decidió no hacer es parte del resultado: la persona puede no estar de acuerdo.
- **En tareas largas, se va escribiendo.** El reporte se actualiza por el camino (en el PR o en un archivo de la rama), no se reconstruye de memoria al final.
- **Mismo contenido que el PR.** La descripción de un PR responde a qué cambia, por qué y cómo se ha probado (ver «Git, GitHub y entornos»): es este reporte. Si hay PR, el reporte puede ser su descripción más «Qué necesita de ti».

## Plantilla

```markdown
**Qué cambió**
- `componentes/boton`: …

**Por qué**
- Sigue `decisiones/0002`. Propone `decisiones/0007` (propuesta).

**Cómo se comprobó**
- `npx ds check`: 0 errores, 0 avisos.

**Qué no se hizo**
- …

**Qué necesita de ti**
- Nada. / Aceptar `decisiones/0007`.
```

## Una corrección que se repite se convierte en comprobación

Si la persona corrige lo mismo dos veces (un nombre de clase inventado, un color escrito a mano, un apartado que falta), la tercera vez no debería depender de que alguien lo vea. El agente lo dice en el reporte y propone llevarlo al sitio más estrecho que lo pueda imponer, que es la regla 4 de los principios:

1. **Una comprobación** de `ds check` o del sync, si es mecánico.
2. **Una regla en la ficha o en `DESIGN.md`**, si es criterio.
3. **Una mejora del kit** (skill `mejorar-kit`), si vale para todos los sistemas.

Como con las decisiones, el agente propone y la persona aprueba: nada de esto cambia sin un sí.

## Origen

El reporte con evidencia sigue cómo trabajan los equipos que despliegan muchos cambios hechos por agentes: Lauren Tan (pstack) no da por terminada una tarea sin pruebas que encajen con el cambio y pide enseñar también lo descartado; Antigravity cierra cada tarea con un resumen de cambios para la persona. Convertir correcciones repetidas en comprobaciones también viene de pstack.
