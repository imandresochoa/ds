---
titulo: Git, GitHub y entornos
resumen: Cómo entra un cambio en el kit, en un sistema y en producción, quién hace merge en cada uno, dónde encaja el sistema en los entornos del producto y cómo se publica.
---

El enlace 1:1 con producción solo se sostiene si los cambios entran siempre por el mismo camino: una rama, un pull request con comprobaciones y un merge decidido.

## Vocabulario mínimo

| Término | Qué es |
| --- | --- |
| **Repositorio** | La carpeta de un proyecto con todo su historial. Git guarda el historial; GitHub guarda una copia compartida. |
| **Commit** | Una foto de los cambios con un mensaje que explica qué cambia y por qué. |
| **Rama** | Una línea de commits paralela. Sirve para trabajar sin tocar lo que ya funciona. |
| **`main`** | La rama principal, la versión oficial. Las demás ramas nacen de ella y vuelven a ella. |
| **Pull request (PR)** | La petición, en GitHub, de juntar una rama con `main`. Muestra qué cambia y permite revisar y comprobar antes de aceptar. |
| **Merge** | Aceptar el PR: los commits de la rama pasan a `main`. |
| **CI** | Un robot (GitHub Actions) que ejecuta las comprobaciones en cada PR y marca el resultado en verde o en rojo. |
| **Entorno** | Una copia del producto que funciona por su cuenta, con su web, su base de datos y sus claves. |
| **Producción** | El entorno que usan los clientes. |
| **Staging** | Un entorno igual que producción, sin clientes y con datos de prueba. El ensayo general. |
| **Preview** | Un entorno temporal para un PR concreto, que desaparece al cerrarlo. |
| **Promoción** | Llevar a producción la misma versión que ya funcionó en staging. |
| **Rollback** | Volver a la versión anterior cuando la nueva falla. |

## Cómo entra un cambio

El flujo es GitHub Flow, igual en los tres repos:

1. Partir de `main` actualizada y crear una rama con un nombre que diga qué se hace.
2. Hacer commits pequeños. En un sistema, el mensaje nombra el `id` de la ficha (`feat(ds): componentes/boton …`).
3. Subir la rama y abrir un PR. La descripción responde a tres preguntas: **qué cambia, por qué y cómo se ha probado** (con los comandos ejecutados y su resultado).
4. Esperar a la CI y a la revisión. Si algo falla, más commits en la misma rama.
5. Hacer merge y borrar la rama.

```bash
git switch main && git pull
git switch -c componentes-boton-tamanos
# cambios…
git add . && git commit -m "feat(ds): componentes/boton documenta los tamaños"
git push -u origin componentes-boton-tamanos
gh pr create      # o desde la web de GitHub
```

Reglas:

- **`main` siempre funciona.** Nunca se trabaja directamente en ella.
- **Un PR, un cambio.** Una tanda de fichas puede ir en un PR; una tanda y un cambio de interfaz, no.
- **Las ramas duran poco**: horas o pocos días. Cuanto más dura una rama, más conflictos.

## Los tres repos

| | Kit | Sistema | Producción |
| --- | --- | --- | --- |
| **Comprobaciones antes del merge** | Tipos y build. | `ds sync` y `ds check` en verde. | Los tests del producto y, cuando haya CI, `ds check` del sistema. |
| **Qué pasa al hacer merge** | Nada se publica solo. Si cambia algo que usan los sistemas, se etiqueta una versión (ver «Kit y sistemas»). | Se publica el sistema, si está desplegado. | Se despliega: en producción si no hay staging; en staging si lo hay. |
| **Quién hace merge** | Quien mantiene el kit; un agente, si tiene autorización expresa y las comprobaciones pasan. | Igual que el kit. | **Siempre una persona responsable del producto.** Un agente abre el PR, pero no hace merge. |

El merge en producción es distinto porque, sin staging, **hacer merge es desplegar**: el cambio llega a los clientes en minutos. Por eso esa decisión no se delega.

## Reglas para agentes

- Una rama por tarea. Nunca commits en `main`.
- Antes de abrir un PR en un sistema: `npx ds sync` y `npx ds check`. El resultado va en la descripción.
- En producción, abrir el PR y parar. Si el checkout de producción tiene cambios sin commit de otra persona, no se tocan: se trabaja en una copia aparte del repo con `git worktree add`, que crea otra carpeta con su propia rama sobre el mismo historial.
- Si una comprobación falla, se arregla en la rama; no se desactiva la comprobación.

## Entornos del producto y el sistema

### Sin staging

Es la situación de partida de muchos productos: lo que entra en `main` sale a producción. Por eso el sistema vive en su propio repo (ver «Kit y sistemas»): documentar no puede romper el producto. Las huellas del sync detectan cualquier cambio de producción la próxima vez que se ejecute `ds sync`.

### Con staging

Cuando el producto tiene staging y CI, el sistema se engancha a esa CI:

```
Rama + PR ──▶ CI: tests + ds check ──▶ merge: main → staging ──▶ probar ──▶ promoción → producción
```

1. **`ds check` en cada PR de producción.** La CI descarga el repo del sistema junto al de producción y ejecuta `npx ds sync` y `npx ds check`. Al principio solo **avisa**: la ficha desajustada se actualiza en un PR del sistema. Cuando las fichas estén completas, **bloquea** el merge.
2. **Staging para revisar diseño en real.** Los cambios de diseño se miran en staging, con datos de demo, antes de promocionar. Con previews por PR, la revisión de diseño y de textos se hace sobre el enlace del preview, antes del merge.
3. **Iniciativas.** Una pieza de una iniciativa llega a producción por el mismo camino: PR en producción, staging y promoción. Su ficha pasa de «En desarrollo» a «En producción» cuando la versión llega a producción, no al hacer merge en staging.

## Publicar el sistema

`npx ds build` exporta el sitio a `out/`: las páginas en HTML, su versión `.md`, `design.md`, `llms.txt`, `registry.json` y la instantánea de producción que cargan los ejemplos en vivo (`/_ds/`). Es un sitio estático: lo sirve cualquier hosting de archivos que resuelva `/x` a `x.html`.

### En la raíz o bajo una ruta

Por defecto, el sitio va en la raíz de un dominio (`https://ds.producto.com/<id>/…`). Si tiene que vivir dentro de otro sitio, bajo una carpeta, la ruta se declara en `system.json`:

```json
"publicacion": { "ruta": "/ds" }
```

Con ella, `ds build` pone `/ds` delante de todo lo que el sitio escribe: las páginas, `/_next`, los enlaces de la interfaz y de las fichas, los `.md`, los enlaces de `llms.txt`, `design.md` y `registry.json`, y las hojas de los ejemplos en vivo. `out/` no cambia de forma (no lleva una carpeta `ds/` dentro): quien lo sirve quita la ruta antes de buscar el archivo, de modo que `https://dominio/ds/x` responde con `out/x`.

- `DS_RUTA` gana a `system.json` en un build concreto: `DS_RUTA=/otra npx ds build`, o `DS_RUTA= npx ds build` para exportar en la raíz.
- `ds dev` sirve siempre en la raíz, con o sin ruta.
- `ds doctor` dice dónde se publica y falla si la ruta no es válida (una o más carpetas, sin espacios: `/ds`, `/sistema/diseno`).

Cuándo hace falta la ruta:

| El sistema se publica… | Ruta |
| --- | --- |
| En su propio dominio o subdominio. | Ninguna. |
| Dentro de otro sitio, con rewrites, y ese sitio no usa `/_next`, `/_ds`, `/llms.txt` ni `/<id>`. | Ninguna: se puede montar en la raíz. |
| Dentro de otro sitio que también es Next (un prototipo, la web del producto). | Sí: su `/_next` choca con el del sistema. |

Con rewrites, la ruta es la misma en los dos lados: el sistema se exporta con `/ds` y el sitio que lo aloja lleva `/ds/:path*` al despliegue del sistema sin la ruta (`https://<despliegue del sistema>/:path*`). Cualquier control de acceso o `noindex` lo pone el sitio que lo aloja; el sistema no lo sabe.

## Decisiones escritas

La forma de trabajar de cada equipo (flujo de ramas, entornos, quién promociona) se decide una vez y se escribe en un registro de decisión (ADR): un archivo corto con contexto, decisión y consecuencias. Las decisiones propias del sistema van en su `docs/DECISIONES.md`.
