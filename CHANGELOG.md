# Changelog

Versiones del kit. Los sistemas fijan una versión exacta con `npm install @imandresochoa/ds@X.Y.Z` o, desde GitHub, `npm install github:imandresochoa/ds#vX.Y.Z`.

## Sin publicar

- **Selector de superficie en la cabecera.** Con dos superficies o más en `system.json`, junto a la marca del sistema aparece un selector (Todas, o una superficie). Filtra la barra lateral, ⌘K, los índices, las galerías, la home y la página de Producción. La elección va en la URL (`?superficie=<id>`) y el navegador la recuerda. Las fichas sin superficie se ven siempre. Viene del feedback de un sistema con dos interfaces muy distintas (imandresochoa/ds#28). Migración: ninguna.
- **`ds feedback` ya no borra palabras sueltas.** La anonimización tomaba como nombre del producto la primera palabra de la carpeta o del repo y la quitaba de todo el texto: con una carpeta `feedback-prueba`, cada «feedback» salía como `<producto>`. Ahora quita el nombre entero en todas sus formas y sin los sufijos habituales de un repo (`-design-system`, `-web`, `-app`, `-site`, `-frontend`, `-landing`…). El vocabulario del kit (feedback, tokens, fichas, sync…) nunca se trata como nombre.

## 1.1.1 · 2026-10-31

Un arreglo sobre la 1.1.0, que incluye entera. Migración: ninguna; `npm install @imandresochoa/ds@1.1.1`.

- **Los colores de las fichas se buscan también en el código.** `ds check` comprobaba que cada color escrito en una ficha existiera en las hojas de producción, y fallaba con los ejemplos que copian un SVG dibujado en un `.tsx` o una paleta de `src/data/`. Ahora busca también en el código y los datos de producción (`.tsx`, `.ts`, `.js`, `.vue`, `.svelte`, `.astro`, `.html` y `.json`), sin tests ni Markdown. Migración: ninguna.

## 1.1.0 · 2026-10-31

Sale de la primera instalación real con `montar-sistema`: lo que el agente echó en falta al montar un sistema y lo que vio en producción. Todo es nuevo y opcional, así que la versión es menor: ninguna ficha ni ningún `system.json` cambia.

- **Recomendaciones para producción.** El sync añade `hallazgos` a `sync-report.json`: colores y valores compuestos escritos a mano que ya son tokens, copias de tokens fuera de `:root` y de los modos, tokens que nada usa y hojas que ninguna superficie carga, con archivo y línea. No cambian `ds check`. La skill nueva `recomendar-produccion` los revisa y escribe `docs/RECOMENDACIONES.md` en el sistema. `montar-sistema` la usa con el plan de fichas y `auditar-sistema` la mantiene al día. Para tenerla: `npx ds skills`.
- **`montar-sistema` pregunta al principio lo que luego echaba en falta.** Junto al origen, el **alcance** (todo, tanda tras tanda; plan y primera tanda; o solo el plan). Pide la **lista de piezas** de la persona y el **archivo de Figma**, cuyos componentes con nombre mandan sobre lo que se deduce del CSS. Pregunta las **decisiones abiertas** antes de escribir `DESIGN.md`. Un apartado nuevo, «Tandas», encadena las fichas: sin pararse, pero revisando cada una, con un commit por tanda y `docs/INVENTARIO.md` al día para retomar. `inventariar-produccion` y `nueva-ficha` usan esos nombres.
- **`ds patrones [--json]`**, de solo lectura: agrupa clases de hojas y prefijos distintos que comparten forma (radio, sombra, fondo, borde, relleno y los mismos `var(--token)`), leídas de la instantánea de `ds sync`. Opciones: `--min-hojas`, `--min-rasgos`, `--limite` y `--todos`.
- La skill `inventariar-produccion` usa `ds patrones` para proponer las piezas que cruzan prefijos, y parte de la lista de piezas de la persona y de los componentes con nombre de Figma, si los hay. Para tenerla: `npx ds skills`.
- **Marco de los ejemplos en vivo que aguanta `100vh`.** El marco mide lo que ocupa el ejemplo aunque la hoja del producto fije `html, body { height: 100% }` (antes se quedaba en 150 px). Si el contenido depende del alto de la vista (`100vh`, `100dvh`), no crece sin fin: se queda en un alto de vista conocido y el contenido se desplaza dentro. Claves nuevas y opcionales: `vista` / `vista=<px>` en el bloque ` ```html preview ` y `altoVista` en cada superficie de `system.json` (640 por defecto). Los arreglos a mano (`cssExtra` con `height: auto`, `min-height` en línea) ya no hacen falta, pero no estorban.
- **Ejemplos en cada modo.** Si una superficie tiene más de un modo en el último sync, el marco del ejemplo (en la ficha y en la galería de bloques) lleva un conmutador Claro/Oscuro que aplica el selector del informe (`tokens.<superficie>.modos`): atributo o clase en `html` o `body`, y los modos de `@media (prefers-color-scheme)` emulados. `modo=<id>` en el bloque elige el modo con el que se abre.
- **`ds feedback`**: sugerencias anónimas para el kit, con campos fijos (kit, agente, SO, origen y stack) y un texto libre, anonimizado en local. Enseña el JSON exacto y solo lo envía con `--enviar` o con un sí en la terminal. `montar-sistema` lo ofrece al cerrar.
- Migración: ninguna. `npm install @imandresochoa/ds@1.1.0` y `npx ds skills`, para tener las skills al día.

## 1.0.0 · 2026-10-30

Cierra el rediseño al modelo de shadcn/ui en cinco fases: interfaz (0.9.0), instalación con `montar-sistema` (0.9.0), Lab de primitivos (0.10.1), registry propio y Directorio, y metodología al día. Desde aquí, la versión mayor solo cambia si hay que tocar fichas, `system.json` o lo que se publica para agentes (ver «Versiones del kit» en la metodología).

- **Registry por piezas**, de solo lectura:
  - `/<sistema>/registry.json` pasa a ser el índice: `piezas` con lo justo para elegir una y el enlace a su JSON.
  - Cada pieza tiene su JSON en `/<sistema>/r/<sección>/<slug>.json`: estado por plataforma, `usa` y `usadoPor`, fuentes, sync, reglas y antipatrones.
  - `llms.txt` y la página «Para agentes» lo explican.
- **`usa`**, clave nueva y opcional de la ficha: las piezas que compone. Los `tokens` entran solos en el grafo. La ficha la enseña en el apartado «Usa». Un id que no existe se avisa al generar.
- **Directorio.** `ds init --directorio` crea un repo con `directorio.json`, que lista las carpetas de varios sistemas. `ds dev`, `ds build` y `ds doctor` los sirven juntos: la portada es el Directorio (una tarjeta por sistema con sus fichas, su sync y su cobertura de producción) y se publica `/directorio.json` para agentes. La ruta de publicación es la del directorio.
- Workflow «Comprobar» en cada PR y en `main`: `npm ci`, typecheck, build y un `ds init` de prueba con Node 24, como «Publicar en npm».
- **Movimiento en el Lab.** Duración base, escala y una familia de curvas (Estándar, Suave, Enfática) dan `--duration-fast|normal|slow`, `--ease-in|out|in-out` y las duraciones y curvas por defecto de las transiciones. Una muestra animada que respeta «reducir movimiento». `ds preset aplicar --solo movimiento`. Los presets anteriores no escriben tokens de movimiento.
- **`ds ver <pieza>`** imprime el JSON de una pieza (por id o por slug). **`ds search --json`** devuelve piezas con la forma del índice, más `archivo`.
- **Metodología, plantilla y skills revisadas** contra lo que hace el kit:
  - Las skills `revisar-sync` y `auditar-sistema` comparan con `origin/<produccion.rama>`, no con `HEAD` ni con `main` fijo.
  - `auditar-sistema` incluye los avisos de `usa`.
  - El título canónico de los antipatrones es `## Antipatrones`, porque pasa tal cual al JSON de la pieza. `## Rechaza estos reflejos` se sigue leyendo.
  - Están documentadas las claves de `system.json` que faltaban (`iniciales`, `color`, `abrirEnAgentes`, `produccion.publico`, `superficies.*.url` y `fondo`), la portada con varios sistemas y lo que exporta `ds build`.
  - Los enlaces a `TAREAS.md` y `DECISIONES.md` apuntan al repo del kit, porque esos archivos no van en el paquete.
- `ds preset ver|resolver --port <n>` da el enlace al Lab de un `ds dev` en otro puerto.
- Migración desde la 0.10.1:
  - Si algo lee `registry.json`: `fichas` pasa a `piezas`. `seccion`, `funcion`, `categoria` y `nivel` pasan a `tipo` y `categorias`. `plataformas`, `sync` y `tokens` de cada ficha están en su JSON (el enlace `json` de cada pieza).
  - Si algo lee `ds search --json`: `seccion` pasa a `tipo`.
  - En los bloques, pasa a `usa` los componentes que tenías en `relacionados`. Lo que no cambies sigue saliendo en «Relacionados».
  - Si tus fichas usan `## Rechaza estos reflejos`, no hace falta cambiarlas. En las nuevas, usa `## Antipatrones`.
  - `npm install @imandresochoa/ds@1.0.0` y `npx ds skills`, para tener las skills al día.

## 0.10.1 · 2026-10-30

- Mismo contenido que la 0.10.0, que no llegó a npm. El workflow de publicación falló en `npm ci`: a `package-lock.json` le faltaban `@emnapi/core` y `@emnapi/runtime`, que piden los paquetes wasm opcionales de Tailwind y de sharp, y npm 11.19 (el de Node 24 en GitHub Actions) no lo acepta. El lockfile está regenerado con esa versión de npm.
- La etiqueta `v0.10.0` se queda donde está: una etiqueta publicada no se mueve.
- Migración: ninguna. Instala `@imandresochoa/ds@0.10.1` (en npm no hay 0.10.0) y ejecuta `npx ds skills`. Si fijaste `github:imandresochoa/ds#v0.10.0`, sigue funcionando.

## 0.10.0 · 2026-10-30

- **Lab de primitivos** (`/<sistema>/lab`), primera opción de «Nuevo» y en ⌘K:
  - «Generar» crea los tokens con los nombres de shadcn a partir de neutro, marca y error, texto, espaciado, radio y sombras.
  - «Ajustar tokens» cambia los que el sistema ya tiene: los de cada superficie de producción o los de `experimental/`.
  - Muestra claro y oscuro con el contraste de cada par, avisa de los que no llegan a AA y propone el valor más cercano que llega.
  - No escribe nada ni hace peticiones de red: el estado va en la URL (`?preset=`).
- **`ds preset ver|aplicar|resolver`.** Lee un preset del Lab (código, enlace o JSON), lo escribe en `experimental/` y devuelve el enlace para volver a abrirlo.
  - Escribe en `experimental/tokens.css`. Al ajustar tokens de `experimental/`, los cambia en la hoja que los declara.
  - Nunca escribe en producción.
  - No escribe pares por debajo de AA sin `--aceptar-contraste`, ni pisa un archivo que no generó el Lab sin `--sobrescribir`.
  - `--solo` aplica solo algunos grupos. `--archivo` elige otro `.css` dentro de `experimental/`.
- Las fichas de tokens enseñan en una columna «Experimental» los valores de `experimental/`.
- Skill `montar-sistema`: apartado «Aplicar un preset del Lab». Los flujos «Desde una web o Figma» y «Desde cero» usan el Lab.
- Metodología: «Nombres de los tokens» (shadcn en un sistema nuevo; los suyos en un producto que ya existe) y «Primitivos con el Lab».
- La lectura de tokens del CSS pasa de `scripts/sync-production.mjs` a `lib/css-tokens.mjs`, que comparten el sync y la interfaz. El sync da el mismo resultado.
- Migración: ninguna. `npm install @imandresochoa/ds@0.10.0` y, para tener la skill nueva, `npx ds skills`.

## 0.9.0 · 2026-10-30

- Interfaz nueva con la estructura de ui.shadcn.com: cabecera con Inicio, Docs, Componentes, Bloques, Gráficos e Iniciativas; Docs a tres columnas con «En esta página»; índice de componentes alfabético con «Nuevos»; galerías de Bloques y Gráficos con visor (Vista y Código, escritorio, tablet y móvil); ⌘K y modo oscuro (⌘D). Tailwind 4 y primitivas de shadcn/ui (MIT) en `components/ui/`, solo para la interfaz.
- Desaparecen la portada con mosaico, el rail y `/<sistema>/inicio`. Lo que había en Inicio pasa a las páginas de Docs «Producción» y «Para agentes».
- Secciones nuevas: **Bloques**, que sustituye a Patrones y agrupa por `categoria` (`seccion`, `pantalla`, `flujo`), y **Gráficos** (`area`, `barras`, `lineas`, `circular`, `radar`, `radial`, `tooltip`). Son estructura: el kit no trae ninguna pieza.
- Páginas de Docs por sistema en `content/docs/` (`index.md` es la Introducción; sin él, se usa `DESIGN.md`). Se publican en `/<sistema>/docs.md` y `/<sistema>/docs/<página>.md`.
- `destacado: true` en una ficha la saca en el escaparate de la home.
- `registry.json`: campos `categoria` y `destacado`. `llms.txt`: páginas de Docs; componentes agrupados por función, y bloques y gráficos por categoría.
- `"abrirEnAgentes": true` en `system.json` activa «Abrir en Claude» y «Abrir en ChatGPT» en «Copiar página». Por defecto está apagado, porque envía la URL de la página a un servicio externo.
- Instalación y montaje:
  - `ds instalar` deja la skill `montar-sistema` en la carpeta de usuario de Claude Code (`~/.claude/skills/`) y de Codex (`~/.agents/skills/`). Con `--aqui`, la deja en la carpeta actual; con `--quitar`, la borra.
  - La skill pregunta de dónde partís (repo, web o Figma, o nada) con las herramientas de preguntas del agente y monta el sistema. Sustituye a `crear-sistema`.
  - `ds init` crea la carpeta, hace `git init` e instala el kit.
  - `ds init` acepta `--carpeta`, `--desde`, `--produccion`, `--url`, `--kit` y `--json` para el agente. Sin nombre, en una terminal, hace las preguntas.
  - `ds init` se niega a crear el sistema dentro del repo de producción o en una carpeta con otro proyecto.
  - `ds init` guarda el origen en `system.json` (`origen`).
  - `ds info [--json]` y `ds search <texto>`, como `shadcn info` y `shadcn search`.
  - Las skills se instalan también en `.agents/skills/` para Codex. Las que necesitan la metodología la buscan con `ds info --json` (`kit.metodologia`), sin depender del nombre del paquete.
- `ds sync` ya no se cae con un repo de producción sin commits o sin `origin`: avisa y sigue.
- El kit pasa a un repo público nuevo, `imandresochoa/ds`, que empieza en la 0.8.0 sin el historial anterior. El repo antiguo queda privado como `design-system-agentic-first-kit-legacy`, y la URL antigua redirige a él, así que los sistemas fijados a una versión anterior siguen instalando.
- Licencia MIT (`LICENSE`). Las primitivas de `components/ui/` siguen con la licencia MIT de shadcn/ui, en su README.
- El paquete pasa a llamarse `@imandresochoa/ds` y se publica en npm. `files` en lista blanca y workflow manual de publicación con trusted publishing (`.github/workflows/publicar.yml`).
- Seguridad: Next.js sube a 16.4.3 por una vulnerabilidad crítica de 16.0–16.4.
- Migración: no es obligatoria. `content/patrones/` y `nivel: seccion|pantalla|flujo` se siguen leyendo, y las huellas y los `relacionados` con `patrones/…` siguen funcionando. Para pasar al formato nuevo, ejecuta `git mv content/patrones content/bloques`, cambia `nivel:` por `categoria:` en esas fichas y luego `npx ds sync`. Los enlaces guardados a `/<sistema>/inicio` pasan a `/<sistema>/docs/produccion`. Por el nuevo nombre del paquete, reinstala el kit (`npm uninstall design-system-agentic-first-kit` y `npm install @imandresochoa/ds@0.9.0`) y ejecuta `npx ds skills`. Así se borra `crear-sistema`, se copia `montar-sistema` y las skills llegan también a `.agents/skills/`. En `AGENTS.md`, cambia las rutas `node_modules/design-system-agentic-first-kit/docs/metodologia/` por «la ruta de `npx ds info --json` → `kit.metodologia`».

## 0.8.0 · 2026-10-29

- Ruta de publicación: `system.json` → `"publicacion": { "ruta": "/ds" }` exporta el sitio para servirlo bajo esa carpeta de otro sitio. `ds build` la aplica como `basePath` de Next (páginas, `/_next` y `<Link>`) y la pone delante de lo que no pasa por Next: los enlaces a `.md`, `design.md`, `llms.txt` y `registry.json` de la interfaz, «Copiar como Markdown», «Abrir .md», el contexto para agentes, los enlaces del cuerpo de las fichas, las hojas de los ejemplos en vivo (también las `url(assets/…)` de las superficies Tailwind) y, en los archivos publicados, los enlaces de `llms.txt`, `design.md` (también en la parte escrita a mano), los `.md` de cada ficha y `md`/`url` de `registry.json`. `out/` no cambia de forma: se sirve tal cual bajo la ruta.
- `DS_RUTA` gana a `publicacion.ruta` en un build (`DS_RUTA= npx ds build` exporta en la raíz). La ruta solo se aplica al exportar: `ds dev` sigue en la raíz. `ds doctor` dice dónde se publica y falla si la ruta no es válida. Con varios sistemas en un mismo sitio, los que declaren ruta deben coincidir.
- Corrección: la pastilla de estado repetía la clave de React cuando varias superficies de una ficha citan el mismo archivo (`fuente: src/components/ui/Button.jsx` en tres superficies) y la consola de `ds dev` avisaba «Encountered two children with the same key». Ahora cada fuente usa su `clave` del informe (plataforma, superficie y fuente).
- Migración: ninguna. Sin `publicacion.ruta` ni `DS_RUTA`, el sitio exportado es el mismo que en 0.7.1. Para publicar bajo una carpeta: fija `#v0.8.0`, `npm install`, añade `publicacion.ruta`, `npx ds doctor` y `npx ds build`, y sirve `out/` bajo esa ruta (con rewrites, `/ds/:path*` → `https://<despliegue del sistema>/:path*`). `npx ds skills` trae la nota de `crear-sistema`.

## 0.7.1 · 2026-10-26

- `ds build` fallaba en un sistema sin fichas de componentes ni de patrones («returned an empty array from generateStaticParams»): las páginas de iOS y Android no tenían ninguna ruta que generar y, con `output: export`, Next no lo acepta. Lo mismo pasaba con la página de ficha en un sistema sin fichas y sin metodología. Ahora generan una ruta de relleno (`/<sistema>/_/_`) que da 404.
- Migración: ninguna. Si añadiste una ficha de componente solo para que el build pasara, ya puedes quitarla.

## 0.7.0 · 2026-10-26

- Modos: el sync lee, además de `:root`, los tokens de cada modo: `[data-theme="…"]` (también `data-mode`, `data-color-scheme` y `data-scheme`), `.dark` y `.light`, solos o sobre `:root`, `html` o `body`, y `:root` dentro de `@media (prefers-color-scheme: …)`. `tokens.produccion.json` guarda un valor por modo cuando cambia (`{ "light": …, "dark": … }`) y un texto cuando no. `sync-report.json` → `tokens.<superficie>.modos` dice qué selectores activan cada modo.
- Las fichas de tokens enseñan una columna por modo, con las muestras de color una al lado de otra; si un token vale lo mismo en todos, una sola celda. Las muestras resuelven las `var()`. Los chips «Tokens que usa» llevan una muestra por modo. `design.md` publica una columna por modo y cómo se activa cada uno; `registry.json` añade `modos`.
- `@theme` y `@theme inline` (Tailwind 4): sus variables son tokens (radios, sombras, fuentes, texto), con las `var(--x)` resueltas contra `:root` en cada modo. Se leen solo de las hojas del producto y sus `@import` locales, no de paquetes npm. Si un nombre está en `:root` y en `@theme`, manda `:root`.
- Cobertura por componentes: en superficies Tailwind, `"cobertura": true` cuenta los archivos de componentes (`.tsx`, `.jsx`, `.vue`, `.svelte`, `.astro` de `src/components/`, sin tests ni stories) que ninguna ficha declara como `fuente`, en `cobertura["componentes:<superficie>"]`. `"cobertura": "clases"` o `"componentes"` lo fuerzan y `componentes` cambia la carpeta. Inicio enseña la lista de lo que falta de cada tipo. `ds doctor` comprueba los dos campos.
- Cobertura de tokens: una variable de `@theme` que solo apunta a otro token (`--color-x: var(--x)`) cuenta como documentada si lo está su destino. Las clases que solo activan un modo (`.dark`) dejan de contar como clases sin documentar.
- Corrección: el valor de un token de `:root` ya no lo pisan las reglas bajo `@media (prefers-color-scheme: dark)`, otra `@media` (ancho, impresión) o `@container`. Antes ganaba la última.
- Migración:
  - Sistemas sin modos: nada cambia en `tokens.produccion.json`.
  - Sistemas con modos: los tokens que cambian de modo pasan de texto a `{ modo: valor }`. Si algo tuyo lee ese archivo (scripts, prompts), lee `valor.light ?? valor` o el modo que necesites.
  - La cobertura de tokens crece con las variables de `@theme` (sobre todo radios, sombras y fuentes). Documéntalas en sus fichas de tokens.
  - Superficies Tailwind con `"cobertura": true`: la cobertura de clases (`cobertura.<superficie>`) pasa a ser de componentes (`cobertura["componentes:<superficie>"]`). Pon `"cobertura": "clases"` si quieres la anterior, y `"componentes": [...]` si tus componentes no están en `src/components`.
  - Pasos: fija `#v0.7.0`, `npm install`, `npx ds skills`, `npx ds sync` y revisa la cobertura nueva.

## 0.6.1 · 2026-10-13

- Sync: los `@import` de paquetes npm (`tw-animate-css`, `shadcn/tailwind.css`, `@fontsource-variable/inter`…) se incrustan en la instantánea leyéndolos del `node_modules` de la copia local de producción, y sus fuentes e imágenes se copian a `assets/_paquetes/`. Antes se copiaban tal cual y el Tailwind del navegador fallaba («The browser build does not support @import»), así que los ejemplos en vivo de una superficie Tailwind con shadcn salían sin estilos. Si un paquete no está instalado, el `@import` se quita, se avisa y queda en `paquetesAusentes` del informe.
- Ejemplos de superficies Tailwind: las `url(assets/…)` de la instantánea pasan a absolutas, porque la hoja va incrustada en el iframe y no como `<link>`.
- Las clases que definan esas hojas de paquete cuentan como clases de producción (igual que los `@import` locales desde 0.3.3), también en la cobertura.
- `ds desenlazar` fallaba con `EISDIR` en Node 24 (borraba el enlace con `rmSync`); ahora usa `unlinkSync`.
- Migración: ninguna. Ejecuta `npm install` en el repo de producción y después `npx ds sync`.

## 0.6.0 · 2026-10-13

- Rutina diaria: la auditoría (`auditar-sistema`) se programa una vez al día. La skill explica cómo programarla y trae el texto de la tarea; `crear-sistema` la programa al montar un sistema; la plantilla de `AGENTS.md` tiene un apartado «Rutina diaria» que dice si ya está programada, y los agentes la proponen si no lo está.
- Migración: `npx ds skills`, copia el apartado «Rutina diaria» de `plantilla/AGENTS.md` a tu `AGENTS.md` y pide a tu agente que la programe.

## 0.5.0 · 2026-10-13

- Sync y check leen lo publicado (`origin/<produccion.rama>`, `main` por defecto) en vez de la copia local; `--local` recupera el comportamiento anterior. Avisa si la copia local va por detrás.
- `ds check` falla si una superficie apunta a una hoja de estilos que ya no existe (antes solo lo anotaba).
- Colores: `ds check` falla si una ficha en producción escribe colores que no existen en producción, o si una ficha fuera de producción tiene la mayoría de sus colores ya en producción (seguramente se aplicó y nadie cambió el estado).
- Skill `auditar-sistema`: la revisión completa (check, arreglos, revisión visual, cobertura) para antes de publicar, tras cada merge en producción o como rutina diaria.
- Migración: `npx ds skills` para copiar la skill nueva. Opcional: `produccion.rama` en `system.json` si producción no publica desde `main`.

## 0.4.0 · 2026-10-13

- Portada en `/<sistema>`, sin barras: el mosaico de secciones alrededor de la casilla del sistema, con una entrada breve. `lib/landing.ts` elige, para cada proporción de pantalla, la plantilla más armónica de 4 a 8 cajas (sin barras estrechas); cada caja lleva una ilustración animada del icono de su sección, al estilo de las de Claude: lámina del color del sistema, papel recortado y tinta a mano (`components/LandingArt.tsx`).
- Inicio pasa a `/<sistema>/inicio`. El nombre del sistema en la barra de título lleva a la portada.
- Migración: ninguna. Los enlaces guardados a `/<sistema>#produccion` pasan a `/<sistema>/inicio#produccion`.

## 0.3.4 · 2026-10-11

- Metodología: capítulo «Git, GitHub y entornos» (vocabulario, cómo entra un cambio, quién hace merge en cada repo, reglas para agentes y cómo se engancha el sistema a la CI y al staging del producto).

## 0.3.3 · 2026-10-11

- Sync: los `@import` locales de una hoja de producción («./x.css», «../x.css», con `layer()` opcional) se incrustan en la instantánea. Los ejemplos en vivo los necesitan (el iframe no resuelve rutas del repo) y cuentan para clases y huellas.

## 0.3.2 · 2026-10-11

- `ds enlazar <ruta>` y `ds desenlazar`: usar un checkout local del kit sin `npm link`.
- Ejemplos en vivo: la altura se ajusta aunque el iframe cargue antes de hidratar; secciones, cabeceras y pies ocupan todo el ancho.

## 0.3.1 · 2026-10-11

- Sync: la lista de archivos sin commit ya no corta la primera letra del primer archivo.

## 0.3.0 · 2026-10-11

- Skills: `crear-sistema`, `inventariar-produccion`, `nueva-ficha`, `revisar-sync`, `actualizar-kit`, `mejorar-kit`.
- `ds version`.

## 0.2.0 · 2026-10-11

- CLI `ds` (`init`, `dev`, `build`, `sync`, `check`, `skills`, `doctor`).
- Contenido en repos externos (`DS_SISTEMAS`), plantilla de sistema y sistema de ejemplo.
- Metodología genérica, guía de adopción y guía «Kit y sistemas».
