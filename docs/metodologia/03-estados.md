---
titulo: Estados e iniciativas
resumen: El recorrido de una pieza hasta producción y cómo se agrupa el trabajo en curso.
---

## Estados

| Estado | Significa | Puede usarse en producción |
| --- | --- | --- |
| **Exploración** | Se está diseñando. Puede cambiar o desaparecer. | No |
| **En desarrollo** | Definido y construido en el sistema (CSS en `experimental/`), pendiente de llevarlo a producción. | No |
| **En producción** | Existe en el código de producción y el sync lo verifica. | Sí |
| **Obsoleto** | Sigue en producción, pero no se usa en trabajo nuevo. Se retirará. | Solo lo existente |

Las plataformas tienen además **Sin iniciar**: la ficha existe pero esa plataforma no tiene implementación.

El estado se declara en dos sitios: en la ficha (`estado`) y en cada plataforma (`plataformas.web.estado`). Un botón puede estar en producción en web y sin iniciar en iOS.

## Estado del enlace con producción

Lo calcula `npx ds sync`. No se escribe a mano.

| Estado | Significa | Qué hacer |
| --- | --- | --- |
| **Sincronizado** | La huella del código coincide con la revisada. | Nada. |
| **Pendiente de verificar** | Fuente nueva, aún sin revisar. | Revisa la ficha contra el código y acepta. |
| **Cambió en producción** | El código cambió desde la última revisión. | Actualiza la ficha y acepta la nueva huella. |
| **No está en producción** | La fuente o alguna clase ya no existe. | Corrige la ficha o cambia su estado. |

## Cómo se ve en la interfaz

Una sola pastilla. El texto es el estado; el color, la combinación de estado y sync:

| Color | Cuándo |
| --- | --- |
| Verde | En producción y sincronizada. |
| Ámbar | En producción, pero cambió en producción o está pendiente de verificar. Hay que revisar la ficha. |
| Rojo | En producción, pero la fuente o alguna clase declarada ya no existe. Es un error. |
| Azul | En desarrollo. |
| Violeta | Exploración. |
| Gris | Obsoleto. |

## Cómo sube una pieza a producción

1. **Exploración.** Ficha nueva con `estado: exploracion`. Si tiene estilos, van en `experimental/*.css`; los ejemplos en vivo ya los cargan. Los tokens pueden salir del Lab de primitivos (`npx ds preset aplicar`). En un producto que ya existe, ese cambio va en una iniciativa.
2. **En desarrollo.** El diseño está cerrado. Se construye en el sistema y se revisa.
3. **Producción.** Se lleva el código al repo del producto. En la ficha se declaran las fuentes (`superficies`), se borra el CSS experimental y se cambia el estado. `npx ds sync --accept <id>` guarda la huella.
4. **Obsoleto.** Cuando algo se va a retirar, se marca así y se enlaza su sustituto en `relacionados`.

## Iniciativas

Una iniciativa agrupa el trabajo nuevo que todavía no está en producción: un área de cliente 2.0, un sistema de ilustraciones, una sección nueva. Las fichas de la iniciativa la nombran en `iniciativa:` y aparecen enlazadas desde ella.

Toda iniciativa tiene las mismas secciones, para que cualquiera sepa dónde mirar:

- **Resumen**: qué se quiere conseguir y para quién.
- **Referencias**: capturas, enlaces y documentos de partida.
- **Exploración**: alternativas y decisiones.
- **Flujos**: recorridos de usuario sobre pantallas reales.
- **Handoff**: lo aprobado para construir. Solo entra aquí lo aprobado, nunca exploraciones.
- **Playground**: pruebas en vivo.

Cuando una iniciativa llega a producción, su estado pasa a `produccion` y sus fichas ya no dependen de ella.

## Trazabilidad

- Los commits que tocan una ficha nombran su `id`: `feat(ds): componentes/boton añade variante light`.
- Las decisiones de método, con fecha y motivo, van en `docs/DECISIONES.md`. No se reescriben: se añade una entrada nueva que corrige la anterior.
