---
titulo: Kit y sistemas
resumen: Qué vive en el kit, qué vive en cada sistema y cómo se mantienen sincronizados.
---

## Tipos de repo

| Repo | Contiene | Ejemplo |
| --- | --- | --- |
| **Kit** (paquete `@imandresochoa/ds`, repo `imandresochoa/ds`) | El motor: interfaz, CLI `ds`, scripts de sync y publicación, plantilla, skills y esta metodología. No nombra ningún producto. | Uno solo, compartido. |
| **Sistema** (`<producto>-design-system`) | El contenido de un producto: `system.json`, `DESIGN.md`, fichas, CSS experimental, instantánea de producción y huellas. | Uno por producto. |
| **Producción** | El código real del producto. El sistema lo lee; no lo modifica. | El repo de cada producto. |
| **Directorio** (opcional) | Un `directorio.json` con las carpetas de los sistemas que se sirven juntos, y el kit como dependencia. Sin contenido propio. | Uno por estudio o equipo. |

```
kit ──(dependencia npm)──▶ sistema ──(lee por ruta, ds sync)──▶ producción
```

Es el patrón de Docusaurus, Storybook o Starlight: el motor se instala; el contenido es tuyo. Así cada sistema recibe las mejoras del kit subiendo de versión, sin mezclar cambios a mano.

## Directorio

Un directorio junta varios sistemas en un solo sitio. Su portada es el Directorio: una tarjeta por sistema con sus fichas por estado, su sync y su cobertura de producción, y los enlaces a su `registry.json` y su `design.md`. Para los agentes, el sitio publica `/directorio.json` con lo mismo, y `llms.txt` enumera todos los sistemas.

```bash
npx @imandresochoa/ds init --directorio "Nuestros sistemas" --carpeta ../directorio --sistemas ../a-design-system,../b-design-system
cd ../directorio && npx ds dev
```

```json
{
  "nombre": "Nuestros sistemas",
  "descripcion": "",
  "sistemas": ["../a-design-system", "../b-design-system"],
  "publicacion": { "ruta": "/ds" }
}
```

- Las rutas de `sistemas` son relativas al directorio. Cada sistema sigue en su repo, con su sync y su ritmo. El directorio solo los lee.
- `ds dev`, `ds build` y `ds doctor` funcionan igual que en un sistema. El sync se hace en cada sistema (`npx ds sync` en su carpeta); el directorio enseña el último.
- Todos los sistemas se sirven con la versión del kit del directorio. Si un sistema necesita otra, se publica por su cuenta.
- La ruta de publicación es la del directorio (`publicacion.ruta`, o `DS_RUTA`). La de cada sistema no cuenta aquí.
- Solo salen los sistemas que lista `directorio.json`. Nunca se añaden registries de terceros: un agente podría meter en producción código que nadie ha revisado.

## Por qué el sistema no vive dentro del repo de producción

Es una opción válida (lo hacen equipos con un monorepo), pero con un solo entorno de despliegue cualquier cambio en producción sale a producción. Separados:

- documentar no arriesga el producto;
- el sistema tiene su propio historial y su propio ritmo;
- el enlace se mantiene igual de estricto: las huellas detectan cualquier cambio de producción.

Cuando el producto tenga staging y CI, se añade a su CI un `ds check` que avise si un cambio de producción deja una ficha desajustada (ver «Git, GitHub y entornos»).

## Desarrollar el kit con datos reales

La interfaz se pule mejor con contenido real. Para eso se enlaza el kit en local desde el repo del sistema:

```bash
cd producto-design-system
npx ds enlazar ../ds   # el kit necesita su propio npm install
npx ds dev
npx ds desenlazar                                   # vuelve a la versión fijada en package.json
```

`ds enlazar` crea el enlace solo en ese repo (no usa `npm link`, que necesita permisos sobre la carpeta global de npm). Un `npm install` en el sistema también deshace el enlace.

Con el kit enlazado, `ds dev` ejecuta el motor desde la carpeta del kit: cada cambio en la interfaz se ve al momento con los datos del sistema. Los cambios se commitean **en el kit**, nunca en el sistema.

Sin enlazar, `ds` copia el motor a `.ds/kit` (ignorado por git) y lo ejecuta desde ahí.

## Actualizar un sistema

```bash
npm install @imandresochoa/ds@X.Y.Z
npx ds skills     # actualiza las skills de Claude Code y Codex
npx ds sync && npx ds check
```

La skill `actualizar-kit` lo hace y resume el changelog.

## Feedback para el kit

`ds feedback` envía al kit sugerencias anónimas: qué le habría venido bien a quien lo instala y monta un sistema. La skill `montar-sistema` lo ofrece al cerrar. El comando funciona siempre, con o sin sistema.

```bash
npx ds feedback --texto "<sugerencias>"            # en seco: enseña el JSON exacto y no envía nada
npx ds feedback --texto "<sugerencias>" --enviar   # lo envía (un agente, solo tras el sí de la persona)
```

- **Qué lleva.** Campos fijos (versión del kit, agente, sistema operativo, versión mayor de Node, origen del sistema y stack en etiquetas genéricas de una lista cerrada, como `react` o `tailwind-4`) y un texto libre de sugerencias. No es un informe de errores con causa y solución.
- **Anonimizado en local.** Antes de enseñarlo, el CLI quita rutas, URLs, dominios, correos, usuarios (`@alguien`), claves (también las de Figma), commits y colores. Con `system.json`, quita también los nombres del sistema y del producto (`id`, `nombre`, `produccion.repo`, `web` y `codigo`, las carpetas, `package.json` y los remotos de git) y, tras un sync, sus tokens, clases y componentes. Deja marcadores como `<producto>`, `<ruta>`, `<token>` o `<clase>`.
- **Solo con un sí.** Sin `--enviar`, en una terminal pregunta y, si no, solo enseña. `--ver` nunca envía. No se guarda nada en el equipo.
- **Dónde acaba.** En un issue público de [imandresochoa/ds](https://github.com/imandresochoa/ds/issues?q=label%3Afeedback) con la etiqueta `feedback`. Lo crea una función del proyecto de Vercel del kit, que vuelve a validar el informe, limita el tamaño y el ritmo de envíos y no guarda IPs. `DS_FEEDBACK_URL` cambia el endpoint.

## Versiones del kit

- **Parche**: arreglos de interfaz sin cambios en el contenido.
- **Menor**: funciones nuevas compatibles (una sección, un campo opcional).
- **Mayor**: cambios que obligan a tocar fichas o `system.json`, o que cambian la forma de lo que se publica para agentes (`registry.json`, las piezas de `r/`, `directorio.json`). Van con una guía de migración en `CHANGELOG.md`.
