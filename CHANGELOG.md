# Changelog

Versiones del kit. Los sistemas fijan una versión exacta con `npm install @imandresochoa/ds@X.Y.Z` o, desde GitHub, `npm install github:imandresochoa/ds#vX.Y.Z`.

## Sin publicar

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
- El paquete pasa a llamarse `@imandresochoa/ds`. Sigue con `"private": true` hasta que se apruebe publicarlo. `files` en lista blanca y workflow manual de publicación con trusted publishing (`.github/workflows/publicar.yml`).
- Seguridad: Next.js sube a 16.4.3 por una vulnerabilidad crítica de 16.0–16.4.
- Migración: no es obligatoria. `content/patrones/` y `nivel: seccion|pantalla|flujo` se siguen leyendo, y las huellas y los `relacionados` con `patrones/…` siguen funcionando. Para pasar al formato nuevo, ejecuta `git mv content/patrones content/bloques`, cambia `nivel:` por `categoria:` en esas fichas y luego `npx ds sync`. Los enlaces guardados a `/<sistema>/inicio` pasan a `/<sistema>/docs/produccion`. Por el nuevo nombre del paquete, reinstala el kit (`npm uninstall design-system-agentic-first-kit` y después `npm install` con la versión nueva) y ejecuta `npx ds skills`. Así se borra `crear-sistema`, se copia `montar-sistema` y las skills llegan también a `.agents/skills/`. En `AGENTS.md`, cambia las rutas `node_modules/design-system-agentic-first-kit/docs/metodologia/` por «la ruta de `npx ds info --json` → `kit.metodologia`».

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
