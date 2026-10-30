# Decisiones

Registro de decisiones del método y del repositorio. No se reescriben: si algo cambia, se añade una entrada nueva que lo explica.

## 2026-10-11 · Repositorio propio para los sistemas de diseño

Los sistemas viven en un repo separado de los productos, para que la estructura sea reutilizable en cualquier producto. El enlace con cada producto lo hace el sync leyendo su repo en local.

## 2026-10-11 · Interfaz al estilo de Codex

Doble barra lateral (rail de iconos + barra de sección) con las medidas de la app de escritorio de Codex, tomadas de capturas. La interfaz es neutra para que el color lo ponga el contenido.

## 2026-10-11 · Markdown con frontmatter como formato único

Cada ficha es Markdown con datos YAML. La web, los `.md`, `design.md`, `llms.txt` y `registry.json` salen de los mismos archivos. Así personas y agentes leen la misma fuente.

## 2026-10-11 · Ejemplos con el CSS real de producción

Los ejemplos en vivo cargan una instantánea de las hojas de estilo de producción en un iframe. Las superficies con Tailwind se compilan en el navegador con la misma versión de Tailwind. Recrear a mano sería otra fuente que mantener.

## 2026-10-11 · Huellas en lugar de copiar el código

El sync no duplica componentes: calcula una huella de las reglas CSS (o del archivo) de cada ficha. Si cambia, la ficha se marca hasta que alguien la revisa y acepta. Inspirado en la trazabilidad por ID de Gemba y en el «sync the README» de Daniel Saltaren.

## 2026-10-11 · Cuatro estados más «sin iniciar»

Exploración, En desarrollo, En producción y Obsoleto, por ficha y por plataforma. Las iniciativas agrupan lo que aún no está en producción, con secciones fijas.

## 2026-10-11 · Plataformas como pestañas, superficies dentro de web

Web, iOS y Android son pestañas de cada componente. Las partes de un producto con código propio (por ejemplo, landing y área de cliente) son superficies de web, porque comparten tokens pero no código.

## 2026-10-11 · Claves en español

El frontmatter usa claves en español (`titulo`, `estado`, `plataformas`), igual que el resto de la documentación del estudio.

## 2026-10-11 · Primera revisión de Andrés sobre la interfaz

- El nombre del sistema va fijo arriba a la izquierda, sin icono, con atrás y adelante a su lado. Aparecía en tres sitios; la barra de sección muestra ahora el nombre de la sección.
- Mostrar u ocultar la barra lateral pasa al rail, encima del sistema. El menú del sistema se abre hacia arriba.
- Estado, sync, nivel e iniciativa pasan de una línea de metadatos bajo el título a pastillas pequeñas con fondo en la barra de título, junto a las acciones. El id y la fecha bajan al pie.
- Hover y pulsación comparten fondo en filas, rail y botones, para que el estado no desaparezca al pulsar.

## 2026-10-11 · Una sola pastilla de estado

El estado y el sync se resumen en una pastilla: el texto es el estado y el color dice si producción coincide con la ficha (verde), hay que revisarla (ámbar) o hay un error (rojo). El detalle aparece al pasar el ratón. El nivel y la iniciativa salen de la barra superior. «En desarrollo» pasa a azul para no confundirse con el ámbar de revisión. Las pestañas de plataforma solo aparecen si hay más de una. La explicación técnica de cada superficie pasa a Fundamentos › Superficies.

## 2026-10-11 · Metodología interna y Fundamentos antes que Tokens

La metodología explica cómo construimos sistemas: es interna y es la base para crear los siguientes. No forma parte del sistema de diseño de un producto ni la ve un cliente. Sale del rail y queda en «…»; cada sistema decide si la muestra con `"metodologia"` en `system.json` (la plantilla la trae desactivada; los sistemas propios del estudio, activada). Abajo del rail: ocultar barra lateral, «…» y el sistema. Fundamentos pasa delante de Tokens: primero el criterio, después sus valores.

## 2026-10-11 · Fundamentos y tokens sin solaparse

Cuando un tema tiene fundamento y tokens (color, tipografía), el fundamento lleva las reglas de uso y la ficha de tokens solo la tabla de nombre, rol y valor. Se enlazan con `relacionados`. Las reglas de color pasan de Tokens a una ficha nueva en Fundamentos.

## 2026-10-11 · Componentes agrupados por función

Comparado con Shopify (Polaris) y Vercel (Geist): ninguno muestra átomos, moléculas y organismos; listan los componentes por función. La barra lateral agrupa ahora por `funcion` (Acciones, Navegación, Formularios, Feedback, Contenido, Superposiciones). El nivel atómico sigue en cada ficha y en `registry.json` como regla de composición. Linear no tiene un sistema público con el que comparar.

## 2026-10-11 · Kit y sistemas en repos separados

El motor pasa a un repo propio, `design-system-agentic-first-kit`, que no nombra ningún producto. Cada sistema vive en su repo (`<producto>-design-system`) con solo su contenido y usa el kit como dependencia de npm a través del CLI `ds`. Es el patrón de Docusaurus o Storybook: las mejoras llegan subiendo de versión, sin mezclar cambios a mano en cada sistema. Para pulir la interfaz con datos reales, el kit se enlaza en local (`npm link`). El sistema no vive dentro del repo de producción mientras el producto no tenga staging: documentar no debe poder romper producción.

## 2026-10-11 · `ds enlazar` en lugar de `npm link`

`npm link` necesita escribir en la carpeta global de npm, que en muchos equipos no tiene permisos. `ds enlazar <ruta>` crea el enlace solo en el repo del sistema y `ds desenlazar` vuelve a la versión fijada.

## 2026-10-12 · Portada con mosaico de secciones

Entrar en un sistema abría el shell con la barra lateral desplegada. Ahora `/<sistema>` es una portada sin barras, tomada de brand.dropbox.com: un mosaico con una caja por sección alrededor de la casilla del sistema, que lleva a Inicio. Se descartó el hero con texto que se convertía en mosaico al hacer scroll: lo útil son las cajas, y se ven al entrar. Las cajas son siempre las secciones del sistema. Una plantilla fija por número de cajas dejaba barras de 1:4 en pantallas casi cuadradas, así que la composición se elige por proporción de pantalla entre varias plantillas en molinete, midiendo lo alargada que queda la caja peor. Una sección nueva o la metodología activada no rompen la composición. Cada caja lleva el icono de su sección en el rail, animado, para que portada y rail hablen el mismo idioma. El panel de Inicio pasa a `/<sistema>/inicio`. Las cajas son neutras y el color es el del sistema (casilla, rellenos y caja bajo el ratón), para que la interfaz siga sin competir con el contenido.

## 2026-10-13 · Ilustraciones de la portada al estilo de Claude

Los iconos del rail en grande, con trazo fino y rellenos planos, se quedaban en iconos y no en ilustraciones. Pasan al estilo de las ilustraciones de Claude: lámina de color con grano, papel recortado y tinta a mano, con manos donde el motivo lo pide (el lápiz sobre la regla, el matraz). El motivo sigue siendo el icono de cada sección, para que portada y rail hablen el mismo idioma. Papel y tinta son fijos y la lámina toma el color del sistema, ajustado para que la tinta y el papel se lean siempre; así ningún sistema necesita colores nuevos en `system.json`.

## 2026-10-26 · Modos dentro de los tokens y cobertura por componentes en Tailwind

Un producto con modo claro y oscuro desde el primer día solo se documentaba a medias: el sync leía `:root` y, si había `:root` dentro de `@media (prefers-color-scheme: dark)`, el último valor pisaba al primero. Los modos pasan a ser parte de los tokens: el mismo nombre con un valor por modo, guardado en `tokens.produccion.json` como texto si no cambia y como `{ light, dark }` si cambia, para que los sistemas de un solo modo no noten nada. Se descartó tratar cada modo como una superficie (duplicaba fichas, huellas y cobertura de lo que es el mismo producto) y guardar los modos en un archivo aparte (dos fuentes para un mismo token). El modo base se nombra por contraste (`light` si hay oscuro) para no obligar a configurar nada. Las fichas de tokens ponen los modos uno al lado del otro porque es así como se juzga un rol: si se lee en los dos.

Las variables de `@theme` de Tailwind 4 también son tokens: en un proyecto Tailwind, radios, sombras y fuentes solo existen ahí. Se resuelven contra `:root` en cada modo y se leen solo de las hojas propias, porque paquetes como `tw-animate-css` traen decenas de variables que no son decisiones del producto. Las que solo apuntan a otro token cuentan como documentadas con él, para que el puente de shadcn (`--color-x: var(--x)`) no duplique la lista de pendientes.

En una superficie 100 % Tailwind las clases son utilidades: contar clases sin documentar devolvía la clase del modo oscuro y las de un paquete de animación. Allí la cobertura cuenta componentes, los archivos de `src/components/` que ninguna ficha declara como fuente, que es la unidad con la que se documenta.

## 2026-10-29 · Ruta de publicación en vez de montar el sistema en la raíz

Un sistema se publicaba en la raíz de un dominio, o dentro de otro sitio con rewrites de cada ruta que usa (`/<id>`, `/_next`, `/_ds`, `/llms.txt`). Si el sitio que lo aloja también es Next, los dos `/_next` chocan y los rewrites no pueden separarlos. La salida es servir el sistema bajo una carpeta propia: `publicacion.ruta` en `system.json`, que `ds build` aplica como `basePath` de Next y pone delante de lo que Next no ve (los archivos para agentes, los enlaces escritos en las fichas, las hojas de los ejemplos en vivo). Se descartó `assetPrefix` solo: separa `/_next` pero no las páginas, los `.md` ni `/_ds`. También se descartó que las fichas y `llms.txt` usaran enlaces relativos para servir en cualquier ruta sin configurar nada: cambiaba lo publicado de todos los sistemas y muchos agentes no resuelven bien enlaces relativos.

Es una opción de publicación, no del contenido: la ruta va en `system.json` porque es del sistema, `DS_RUTA` la cambia en un build concreto (otro entorno, o la raíz) y `ds dev` no la usa, para que el servidor de desarrollo siga en el mismo sitio en todos los sistemas. Sin ruta, el sitio exportado es el de antes.

## 2026-10-30 · Interfaz y estructura de shadcn/ui

La interfaz y la forma de pensar un sistema pasan a ser las de ui.shadcn.com. Ese modelo lo conocen las personas y los agentes, y separa bien la documentación que se lee de las piezas que se copian. Sustituye a la interfaz al estilo de Codex, a la portada con mosaico y al rail.

- **Estructura**: una cabecera con Inicio, Docs, Componentes, Bloques, Gráficos e Iniciativas. Docs va a tres columnas: barra lateral, contenido y «En esta página». Bloques, Gráficos e Iniciativas son páginas anchas.
- **Tecnología**: Tailwind 4 y primitivas de shadcn/ui copiadas en `components/ui/` (MIT), solo para la interfaz del kit. Los ejemplos de las fichas siguen en un iframe con el CSS de producción.
- **Bloques sustituye a Patrones** (con categoría `seccion`, `pantalla` o `flujo`) y llega **Gráficos**. Las dos secciones son estructura: el kit no trae ningún componente, bloque ni gráfico. Cada sistema las llena con lo que existe en su producto o con lo que diseñe desde cero.
- **Componentes en lista alfabética**, con «Nuevos» arriba, como shadcn. Esto revisa la entrada «Componentes agrupados por función»: la `funcion` sigue en la ficha y ordena `llms.txt` y el registry.
- **Docs por sistema**: cada sistema escribe sus páginas en `content/docs/`. El kit añade «Producción» y «Para agentes» con los datos del sync, que antes estaban en Inicio.
- **Abrir en Claude o ChatGPT** solo si el sistema pone `"abrirEnAgentes": true`, porque envía la URL de la página a un servicio externo. Por defecto, solo se copia.
- **Compatibilidad**: `content/patrones/` se sigue leyendo como Bloques. `nivel: seccion` cuenta como `categoria: seccion`. Las huellas y los `relacionados` con `patrones/…` siguen funcionando.

Se descartaron tres opciones: «Create», porque los sistemas ya tienen sus menús; «Typeset», porque la tipografía la define cada sistema; y un registry compatible con `npx shadcn add`, porque nada debe escribir en el repo de producción. El registry propio, de solo lectura, queda para una fase posterior.

## 2026-10-30 · Instalación desde npm y skill de montaje con preguntas nativas

Empezar un sistema pasa a ser un comando y una frase al agente: `npx @imandresochoa/ds instalar` y, después, «monta el sistema de diseño».

- **Skill global.** `ds instalar` deja la skill de entrada en la carpeta de usuario de Claude Code (`~/.claude/skills/`) y de Codex (`~/.agents/skills/`). Así funciona antes de que exista el sistema y desde el repo del producto. Se descartó preguntar primero en la terminal con `ds init`: las preguntas se partían entre la terminal y el agente.
- **Preguntas nativas.** La skill pregunta con `AskUserQuestion` en Claude Code y con `request_user_input` en Codex, con 3 opciones como mucho, la recomendada primero y un plan B en texto numerado. En Codex, `request_user_input` solo funciona en modo Plan.
- **La primera pregunta es de dónde partís**: un repo, una web o Figma, o nada todavía. Sin repo no hay enlace con el código: los primitivos quedan en exploración hasta que lo haya.
- **El sistema nunca se crea dentro de producción.** `ds init` lo impide y propone `../<producto>-design-system`.
- **`ds info` y `ds search`** dan a un agente el estado del sistema y las fichas existentes sin abrir la web, como `shadcn info` y `shadcn search`. Las skills encuentran la metodología con `ds info`, sin depender de la ruta del paquete.
- **npm.**
  - El paquete es público y se llama `@imandresochoa/ds`. La metodología va dentro y deja de ser interna; el sitio de cada sistema solo la muestra si la activa.
  - Se publica con trusted publishing desde GitHub Actions, sin tokens guardados. Para tener procedencia, el repo tiene que ser público.
  - `"private": true` se mantiene hasta aprobar la primera publicación.

## 2026-10-30 · Repo público nuevo, sin historial

- **Por qué.** Los primeros commits del repo nombran productos concretos, y la regla del kit es no nombrar ninguno. Reescribir el historial cambiaría todos los hashes y rompería los sistemas que fijan el kit a un commit o a una etiqueta.
- **Qué.** El kit sigue en `imandresochoa/ds`, público, a partir de una instantánea de la 0.8.0. El repo antiguo se renombra a `design-system-agentic-first-kit-legacy` y sigue privado: conserva el historial, las etiquetas hasta la 0.7.1 y los PRs. Como el nombre antiguo no se reutiliza, GitHub lo sigue redirigiendo al legacy y los sistemas fijados a versiones anteriores instalan igual.
- **Cuidado.** Lo que sale del historial antiguo no se sube a `imandresochoa/ds`: los cambios pasan como commits nuevos.

## 2026-10-30 · Primera publicación en npm

- **Qué.** La 0.9.0 es la primera versión en npm. La publica Andrés a mano, con su cuenta y 2FA, porque npm no deja configurar el trusted publisher de un paquete que aún no existe.
- **Después.** Se configura el trusted publisher (`imandresochoa/ds`, `publicar.yml`) y se prohíbe publicar con tokens. Las versiones siguientes salen del workflow, con procedencia.
- **Descartado.** Publicar la primera versión desde Actions con un token de npm guardado como secreto: sería un token de escritura de larga duración que habría que acordarse de revocar.

## 2026-10-30 · Lab de primitivos

Un sistema que parte de una web, de Figma o de nada ajusta sus primitivos en el Lab, sin escribir los tokens a mano. Es el Create de shadcn, pero solo con primitivos, porque el kit no lleva componentes.

- **Dónde.** Es una página de cada sistema, `/<sistema>/lab`, en `ds dev` y en el sitio publicado, y la primera opción de «Nuevo». Así ve los tokens del sistema. Una herramienta aparte no los vería.
- **Qué ajusta.**
  - «Generar»: neutro, marca y error; texto (familias, tamaño base, escala, interlineado); espaciado; radio y sombras.
  - «Ajustar tokens»: los que el sistema ya tiene, de producción o de `experimental/`.
  - El movimiento queda para más adelante.
- **Nombres.** Un sistema nuevo usa los de shadcn y los de Tailwind 4. Un producto que ya existe conserva los suyos.
- **Preset.**
  - Lleva valores libres en la URL (`?preset=`, JSON en base64url).
  - Se valida al leerlo: se descartan con aviso los valores que podrían meter CSS (`;`, `{}`, `url(`, `@`…).
  - El archivo que se escribe guarda el preset en un comentario, para volver a abrirlo con `ds preset resolver`.
- **Quién escribe.**
  - El Lab no escribe nada.
  - `npx ds preset aplicar` escribe en `experimental/`, nunca en producción, y no pisa un archivo que no generó el Lab.
  - La skill `montar-sistema` lo aplica y crea las fichas de tokens en exploración. Si hay producción, lo hace dentro de una iniciativa.
- **Contraste.**
  - El Lab avisa de cada par por debajo de AA (4,5:1 en texto y 3:1 en el anillo de foco) y propone el valor más cercano que llega.
  - `ds preset aplicar` no escribe un par por debajo de AA que cambie el preset, salvo con `--aceptar-contraste`. Ese paso lo decide la persona, no el agente.
  - Los pares que ya fallaban, y que el preset no toca, se avisan sin bloquear.
- **Privacidad.** El Lab no hace peticiones de red ni carga fuentes de un servicio externo: las muestras usan las fuentes instaladas en el equipo.

**Descartado:**
- Un código corto con un catálogo cerrado de opciones, como el de shadcn: los primitivos de un producto son libres.
- Las fuentes de Google Fonts: enviarían a un tercero la IP de quien abre el Lab.
- Bloquear el preset entero si cualquier par baja de AA: un producto puede arrastrar pares que el preset no toca.

## 2026-10-30 · Una etiqueta publicada no se mueve

- **Qué pasó.** El workflow no pudo publicar la 0.10.0: `npm ci` falló porque al `package-lock.json` le faltaban dos dependencias de los paquetes wasm opcionales. Lo generó en macOS una versión de npm más antigua que la de GitHub Actions.
- **Qué se decidió.** La etiqueta `v0.10.0` se queda donde está. El arreglo sale como 0.10.1, con el mismo contenido. A partir de ahora, si el workflow falla, se publica la siguiente versión de parche (ver «Publicar una versión» en `AGENTS.md`).
- **Por qué.** Una etiqueta pública puede estar ya fijada en un sistema (`github:imandresochoa/ds#vX.Y.Z`) o citada en un informe. Si se mueve, el mismo nombre deja de señalar el mismo código.
- **Descartado.** Borrar `v0.10.0` y crearla en el commit arreglado. npm quedaría sin huecos, pero se reescribiría una etiqueta pública.
- **Pendiente.** Un workflow en cada PR con `npm ci` (ver `TAREAS.md`), para que esto se vea antes de publicar.

## 2026-10-30 · Registry por piezas

Un agente que solo necesitaba saber qué usa un bloque tenía que bajarse `registry.json` entero, con todas las fichas. Ahora el registry tiene la forma del de shadcn/ui: un índice y un JSON por pieza.

- **El índice es `registry.json`.** Se queda en la misma ruta, pero `fichas` pasa a `piezas`, con lo justo para elegir una: `id`, `tipo`, `titulo`, `resumen`, `estado`, `categorias`, `destacado`, `iniciativa` y los enlaces `json`, `md` y `url`. Siguen `sistema`, `estados`, `tokens` y `modos`, y se añade `tipos`. Se descartó dejar `registry.json` igual y añadir un `r/index.json`: serían dos índices que mantener, y la 0.x es el momento de cambiarlo.
- **Una pieza por archivo**, en `/<sistema>/r/<sección>/<slug>.json`. La sección va en la ruta porque dos secciones pueden tener el mismo slug. Lleva el índice más `nivel`, fechas, `usa` y `usadoPor`, `relacionados`, `tokens` (con su rol y su valor de producción en las fichas de tokens), `plataformas` con sus superficies, `sync` con sus fuentes y huellas, `reglas` y `antipatrones`.
- **Reglas y antipatrones en Markdown.** Son el texto de esas secciones de la ficha (`## Reglas`, `## Antipatrones` o `## Rechaza estos reflejos`). La metodología fija el orden de las secciones, no su formato, y convertir las tablas en datos fallaría sin avisar.
- **`usa` es explícito.** Es una clave nueva de la ficha con las piezas que compone. Los `tokens` de la ficha entran solos, a través de la ficha de tokens que los documenta, y `usadoPor` se calcula al revés. Un id que no existe se avisa al generar. Se descartó sacarlo de `relacionados`, porque mezcla «usa» con «ver también», y deducirlo de las clases de los ejemplos, porque falla en superficies Tailwind y con clases compartidas.
- **El CLI da la misma forma sin build.** `ds search --json` devuelve piezas como las del índice, más `archivo`. `ds ver <pieza>` imprime el JSON de una pieza. Los dos leen las fichas con `lib/registry.mjs`, igual que `ds build`, así que no hace falta exportar el sitio para consultarlos.
- **Solo lectura.** No es compatible con `npx shadcn add`, como ya se decidió con la interfaz de shadcn/ui: nada del sistema escribe en producción.

**Directorio.** La lista de sistemas sale de un repo de directorio aparte, con un `directorio.json` que apunta a las carpetas de los sistemas y los sirve juntos. Así el kit no nombra ningún producto y la cobertura se lee en local, sin peticiones de red. Se descartó una clave `directorio` en el `system.json` de cada sistema: la lista se repetiría en cada uno y habría que pedir la cobertura por red a cada sitio publicado. Hoy `ds dev` y `ds build` sirven un solo sistema, así que juntarlos es parte de esa tarea.

## 2026-10-30 · Directorio

Un repo de directorio sirve juntos los sistemas que lista su `directorio.json`. El núcleo ya leía varios sistemas (`DS_SISTEMAS`), pero el CLI siempre servía uno: ahora `ds dev`, `ds build` y `ds doctor` reconocen `directorio.json` y `ds init --directorio` lo crea.

- **Un sitio con todos.** La portada (`/`) es el Directorio y cada sistema conserva sus rutas (`/<sistema>/…`, su registry y su `design.md`). `llms.txt` los enumera todos y `/directorio.json` da a un agente la misma tarjeta que ve una persona. Se descartó generar solo un índice que enlazara al sitio publicado de cada sistema: obligaba a declarar la URL pública de cada uno, y un agente tendría que ir a varios dominios para comparar.
- **Qué lleva la tarjeta.** Las fichas por estado, el sync de las que tienen fuentes (cuántas coinciden con producción) y la cobertura de cada superficie según el último sync: clases, componentes o tokens documentados de los que hay en el código. Son los datos que ya calcula `ds sync`; el directorio no lee producción.
- **Sin aceptación aparte.** Un sistema sale en el Directorio porque está en `directorio.json`, que se escribe a mano. No hace falta una clave en `system.json`: la lista explícita ya es el consentimiento.
- **Una versión del kit.** Todos los sistemas del directorio se sirven con el kit del directorio. Si uno necesita otra versión, se publica por su cuenta.
- **Sin terceros.** Solo nuestros sistemas, como se acordó: nada de registries ajenos.

