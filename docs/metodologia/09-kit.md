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
| **Directorio** (opcional) | Solo un `directorio.json` con las carpetas de los sistemas que se sirven juntos. | Uno por estudio o equipo. |

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

## Versiones del kit

- **Parche**: arreglos de interfaz sin cambios en el contenido.
- **Menor**: funciones nuevas compatibles (una sección, un campo opcional).
- **Mayor**: cambios que obligan a tocar fichas o `system.json`. Van con una guía de migración en `CHANGELOG.md`.
