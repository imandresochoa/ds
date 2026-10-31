---
name: auditar-sistema
description: Revisa que todo el sistema cuadre con lo publicado en producción (hojas de estilo, fichas, estados, colores, ejemplos) y arregla lo que no. Úsala antes de publicar el sistema, después de cada merge en producción, como rutina diaria y cuando pregunten «¿está todo al día?» o «¿cuadra el sistema?».
---

# Auditar el sistema

El sistema solo es útil si dice la verdad sobre producción. Los desajustes no avisan solos: un rediseño cambia una hoja de estilo, una exploración se aplica y la ficha sigue diciendo «exploración». Esta auditoría los busca todos.

Producción es lo publicado (`origin/<produccion.rama>`, `main` por defecto), no la rama que haya en la copia local. `ds sync` y `ds check` ya leen de ahí.

## 1. Comprobar

```bash
npx ds check
```

Lee `sync-report.json` y apunta cada problema. Si pasa limpio, ve al paso 3: el check no ve lo visual.

## 2. Arreglar, de lo más grave a lo menos

| Señal | Qué significa | Qué hacer |
| --- | --- | --- |
| `falta <hoja>` (`estilosAusentes`) | Una superficie apunta a una hoja que ya no existe: el sistema documenta una versión vieja. | Busca qué la sustituyó: `git -C <repo> log --diff-filter=D --stat -- <hoja>` y el commit siguiente. Cambia `produccion.superficies.*.estilos` en `system.json` y las `fuente` de las fichas. Repite el check. |
| Ficha `ausente` | El archivo o una clase ya no existe. | Busca el nombre nuevo en producción. Reescribe la ficha (reglas, ejemplos, variantes) o pásala a `obsoleto`. Nunca aceptes una ausencia. |
| Ficha `desajuste` | Producción cambió desde la última revisión. | `git -C <repo> log -p <cambioDesde>..origin/<produccion.rama> -- <fuente>` (`main` por defecto). Actualiza la ficha y acepta con `npx ds sync --accept <id>`. |
| `<id> usa <id>, que no existe` (aviso de `ds dev` y `ds build`) | El grafo del registry apunta a una pieza que no está. | Corrige el id en `usa` o crea la ficha que falta. |
| `Colores que no existen en producción` | La ficha escribe a mano valores viejos: no están ni en las hojas ni en el código o los datos de producción. | Toma los valores reales de `tokens.produccion.json` (con modos, el del modo que describe la ficha) o de la hoja. Cambia también nombres que ya no describan el color. |
| `N de M colores ya están en producción` | Una ficha en exploración seguramente se aplicó. | Compruébalo en la hoja de producción. Si se aplicó: estado `produccion`, `tokens` declarados, valores reales, CSS experimental retirado o reducido a la muestra, «Pendiente» actualizado. Si no, corrige los valores. |
| Clases inventadas | Los ejemplos usan clases que producción ya no tiene. | Rehaz el ejemplo con las clases reales o mueve el estilo a `experimental/`. |
| Estado sin fuentes, o fuentes con estado distinto de `produccion` | El estado no dice la verdad. | Corrige el estado. |

Cada ficha que toques: `actualizado` con la fecha de hoy. No inventes copy: usa los textos de producción.

## 3. Mirar

El check no ve lo visual. Con `npx ds dev`, abre las fichas que cambiaron y las de fundamentos:

- Muestras de color del mismo tamaño, con el hex y el nombre que dice la tabla.
- Con modos (claro y oscuro), las dos columnas de las fichas de tokens: un rol que en un modo no se distingue de su fondo es un hallazgo para diseño, no algo que se arregle en la ficha.
- Ejemplos en vivo que se parezcan a la web publicada (`produccion.web`). Compara con una captura de la página real.
- Nada cortado, desbordado o vacío en móvil.

## 4. Cobertura

`cobertura` en el informe lista lo que producción tiene y ninguna ficha documenta. No es un error, pero si creció mucho desde la última auditoría (un rediseño), propón una tanda de fichas nuevas con `inventariar-produccion`.

`hallazgos` lista lo que producción hace a mano (valores que ya son tokens, copias de tokens, hojas que no se cargan). Tampoco es un error del sistema. Si cambió desde la última auditoría, actualiza `docs/RECOMENDACIONES.md` con `recomendar-produccion`: quita lo que producción ya arregló y añade lo nuevo.

## 5. Cerrar

1. `npx ds check` pasa.
2. `npx ds build` pasa, sin avisos de `usa`.
3. Commit en una rama y PR con el resumen.
4. Resumen para la persona, sin jerga: qué no cuadraba, qué arreglaste, qué queda pendiente y por qué.

## Rutina diaria

La auditoría solo sirve si se hace sin que nadie se acuerde. Cada sistema la tiene programada una vez al día; el apartado «Rutina diaria» de `AGENTS.md` dice si ya lo está.

Si no lo está (o pone «sin programar»):

1. Pregunta a la persona a qué hora le viene bien (por defecto, 9:00 de su zona).
2. Prográmala con lo que tenga tu entorno: una tarea programada o rutina del agente (en Claude Code, tareas programadas o `/schedule`), o un `cron` del sistema que lance el agente sin interacción. Una tarea programada empieza sin memoria: usa el texto de abajo, con las rutas reales.
3. Anota en `AGENTS.md` dónde quedó programada y a qué hora.

Texto de la tarea (sustituye lo que va entre `<>`):

```text
Auditoría diaria del sistema de diseño <nombre>. Responde en el idioma de la persona, sin jerga.
Repo del sistema: <ruta local>. Repo de producción: <ruta local>, solo lectura: nunca cambies nada ahí.
1. En el repo del sistema: git checkout main && git pull; npm ci si cambió package-lock.json.
2. Sigue la skill auditar-sistema (.claude/skills/auditar-sistema/SKILL.md o .agents/skills/auditar-sistema/SKILL.md), pasos 1 a 5.
3. Arregla en una rama fix/auditoria-<fecha>. Nunca inventes textos, nunca aceptes huellas sin revisar la ficha, nunca uses --accept all.
4. Si AGENTS.md permite al agente mergear sus PRs, mergea tras verificar; si no, deja el PR abierto.
5. Si AGENTS.md explica cómo se publica el sistema, publícalo y comprueba que responde.
6. Resumen corto: qué no cuadraba, qué arreglaste (enlace al PR), qué queda y qué necesita una decisión.
Si todo cuadra y producción no cambió, una línea: «Todo cuadra».
```
