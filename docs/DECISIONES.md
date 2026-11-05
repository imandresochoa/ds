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

## 2026-10-30 · Movimiento en el Lab

El Lab ajusta también el movimiento, el único primitivo que quedó fuera de la fase 3.

- **Qué ajusta.** Una duración base y una escala, de las que salen `--duration-fast`, `--duration-normal` y `--duration-slow` (la base dividida, tal cual y multiplicada), y una familia de curvas que da `--ease-in`, `--ease-out` y `--ease-in-out`. «Estándar» son las curvas por defecto de Tailwind 4; «Suave», cúbicas; «Enfática», exponenciales. `--default-transition-duration` y `--default-transition-timing-function` apuntan a la normal y a `--ease-out`, para que una transición sin más ya use el sistema.
- **Nombres.** Las curvas usan los de Tailwind 4. Las duraciones no tienen espacio de nombres en Tailwind, así que se usan con `duration-(--duration-fast)`.
- **Curvas con nombre, no a mano.** Elegir entre tres familias coherentes es más fácil de juzgar que cuatro números de un `cubic-bezier`, y las tres curvas de una familia casan entre sí. Un producto con curvas propias las cambia en «Ajustar tokens».
- **Muestra.** Un punto que va y vuelve con cada duración y cada curva. Con «reducir movimiento» se queda quieto.
- **Compatibilidad.** Un preset anterior no trae movimiento y no escribe tokens de movimiento al aplicarlo. `--solo movimiento` lo añade.

## 2026-10-30 · 1.0.0

- **Qué la hace estable.** Las cinco fases del rediseño están cerradas. La metodología, la plantilla y las skills están revisadas contra lo que hace el código. Cada PR pasa el workflow «Comprobar» (`npm ci`, tipos, build y un `ds init` de prueba), así que un fallo como el de la 0.10.0 se ve antes de publicar.
- **Qué promete.** Desde la 1.0.0, la versión mayor solo cambia si hay que tocar fichas o `system.json`, o si cambia la forma de lo que se publica para agentes (`registry.json`, las piezas de `r/`, `directorio.json`). Se descartó contar solo las fichas y `system.json`: los agentes leen el registry, y un cambio de forma les rompe igual.
- **Antipatrones con un solo título.** La metodología decía «Antipatrones» y la plantilla, «Rechaza estos reflejos». Como el título pasa al JSON de la pieza, el canónico es `## Antipatrones`. El otro se sigue leyendo para no tocar fichas existentes.
- **Enlaces fuera del paquete.** La metodología va en el paquete, pero `TAREAS.md` y `DECISIONES.md` no. Sus enlaces apuntan al repo del kit en GitHub.


## 2026-10-31 · Quién fusiona los PRs del kit

`AGENTS.md` decía que los PRs del kit los fusiona Andrés. Se quita: vale lo que dice «Git, GitHub y entornos». En el kit, un agente puede fusionar si tiene autorización expresa y el workflow «Comprobar» pasa. En producción sigue fusionando siempre una persona.

Además, `next.config.ts` lleva `agentRules: false`. `next dev` añadía a `AGENTS.md` un bloque de reglas de Next cuando detectaba un agente, y ese bloque acabó en un commit. Con la opción apagada, Next lo quita y no lo vuelve a escribir.

## 2026-10-31 · Recomendaciones para producción

Al montar un sistema, el agente lee producción entera y ve lo que hace a mano: un color de un token escrito tal cual, una copia local de un token, una hoja que ya no se carga. Eso se quedaba en el resumen de la sesión. Ahora tiene su sitio.

- **El sync detecta y la skill redacta.** Lo mecánico (valores sueltos, copias de tokens, tokens sin uso, hojas sin cargar) lo calcula el sync y queda en `sync-report.json` → `hallazgos`, igual en cada ejecución. La skill `recomendar-produccion` lo revisa en el código, añade lo que pide criterio (foco, contraste, piezas casi duplicadas, valores casi iguales) y prioriza. Se descartó dejarlo todo al agente: dos sesiones darían listas distintas y la auditoría diaria no podría ver qué cambió.
- **Un documento aparte del inventario.** `docs/INVENTARIO.md` dice qué falta documentar en el sistema; `docs/RECOMENDACIONES.md`, qué mejorar en producción. Mezclarlos confunde a quién va dirigida cada cosa.
- **Sin escribir en producción.** Las recomendaciones son un documento: cada una entra en producción con un PR que hace una persona (regla 6).
- **No es un fallo.** `ds check` no mira los hallazgos: no dicen que el sistema mienta, sino que producción podría usarlo mejor.
- **Solo valores distintivos.** Se comparan colores y valores compuestos (sombras, pilas de fuentes, curvas). Los valores simples (`8px`, `0`, `1`) darían demasiadas coincidencias casuales. Los radios y espacios casi iguales los busca la skill.

## 2026-10-31 · `montar-sistema` pregunta antes y encadena tandas

Sale del informe de un agente que montó un sistema real. Se paró después del plan, se le escaparon piezas que vivían repartidas en varias hojas con prefijos distintos, no miró los componentes de Figma y dejó partes de `DESIGN.md` en «Pendiente» que la persona sabía. Cinco fichas llevaron buena parte de la sesión y quedaban unas veinticinco.

- **Alcance al principio**, en la misma llamada que el origen. «Todo, tanda tras tanda» es la recomendada: montar un sistema sin sus fichas deja el trabajo a medias.
- **Lo que dice la persona y Figma manda sobre lo deducido.** Agrupar clases por prefijo no ve una pieza con cuatro prefijos. Una lista con nombres o los componentes de Figma sí.
- **Decisiones abiertas antes de escribir `DESIGN.md`**, no al final, para que no se queden en «Pendiente» cosas que la persona sabe.
- **Encadenar no rebaja el listón.** Cada ficha se comprueba y cada huella se revisa. Un commit por tanda, solo en el repo del sistema, e `INVENTARIO.md` al día para retomar en otra sesión. Se descartó un modo que creara fichas sin comprobar el ejemplo: es rápido, pero lo que llega al registry tiene que ser verdad.

## 2026-10-31 · Patrones compartidos en el inventario

En un producto sin carpeta de componentes compartidos, el inventario por prefijos de clase no vio las tarjetas: vivían en cuatro hojas con cuatro prefijos distintos. El agente que lo sufrió pidió detectar patrones compartidos, como un mismo token o un mismo radio en varias hojas.

- **Un comando, no solo la skill.** `ds patrones` lee la instantánea de `produccion/` con postcss y devuelve grupos; la skill los interpreta. Comparar a ojo las reglas de veinte hojas es justo lo que se le escapa a un agente.
- **Firma por rasgos, no por igualdad.** Dos tarjetas escritas por separado casi nunca tienen el mismo relleno. Por eso la firma es lo que comparten (cada pareja de clases da una candidata, que se cierra con todo lo que tienen en común las clases que la contienen) y no la regla entera. Un solo rasgo basta, porque la petición era «un mismo radio»; los grupos con más rasgos salen antes a igual número de hojas.
- **Ruido fuera.** Los resets (`border: 0`, `background: transparent`) no cuentan: en un producto real llenaban los primeros puestos con botones sin estilo. Una firma solo de relleno tampoco. Los selectores con pseudoclases, los de dentro de `@media` y los que cuelgan de una clase de modo (`.dark .x`) quedan fuera porque son ajustes de otra pieza.
- **Lo que nombra la persona va primero.** La lista de piezas que dé la persona y los componentes con nombre de Figma mandan sobre lo deducido del CSS. `ds patrones` sirve para encontrar dónde vive cada una y lo que falta.
- **Se descartó** tocar el sync para guardar los patrones en `sync-report.json`: el informe crecería con algo que solo usa el inventario, y el comando se puede ejecutar cuando haga falta.

## 2026-10-31 · El marco de los ejemplos en vivo

Sale de un agente que montó un sistema real: la hoja del producto declaraba `html, body { height: 100% }`, todos los ejemplos se quedaban en 150 px y tuvo que poner `cssExtra` con `height: auto` y `min-height` en línea para ver una primera pantalla.

- **Medir el contenido, no el documento.** El marco medía `document.documentElement.offsetHeight`, que con `height: 100%` es el alto del propio iframe. Ahora mide hasta dónde llega lo último del `body` (sus hijos con su margen y el padding del body), y el body pone el contenido arriba (`align-content: flex-start`, `box-sizing: border-box`) para que el alto del body no cuente. Se descartó forzar `html, body { height: auto }`: cambia la hoja del producto, y los ejemplos tienen que verse como en producción.
- **Un alto de vista conocido.** Dentro de un iframe, `100vh` es el alto del iframe; si el marco crece con el contenido, una sección de `100vh` lo hace crecer sin fin. El marco mide el contenido con dos altos de vista: si cambia, el contenido depende de la vista y el marco se queda en el alto de vista (`altoVista` de la superficie, 640 por defecto), sin margen alrededor y con desplazamiento dentro. Un ejemplo puede fijarlo con `vista` o `vista=<px>`, como el `iframeHeight` de los bloques de shadcn. Se descartó reescribir las unidades `vh` del CSS (frágil con `dvh`, `svh`, `calc()` y Tailwind) y poner un tope arbitrario al crecimiento (un número sin significado).
- **640 px por defecto.** Es un alto de pantalla de portátil menos la barra del navegador, aproximado, y cabe en la página de una ficha sin ocuparla entera. Cada superficie lo cambia con `altoVista`.
- **Conmutador de modo con los selectores del informe.** El sync ya guarda los selectores de cada modo. El marco quita los atributos y clases de los demás modos y pone los del elegido, en `html` o en `body`. Solo sale si la superficie tiene más de un modo, en la ficha (arriba a la derecha del ejemplo) y en la barra del visor de bloques. La portada y las galerías pequeñas no lo llevan: enseñan el modo base, o el de `modo=`.
- **`@media (prefers-color-scheme)` emulada.** Chrome no aplica a un iframe el `color-scheme` de su elemento como preferencia, y no hay otra forma de fijarla desde la página. Como las hojas de la instantánea se sirven desde el mismo origen, el marco reescribe las condiciones `prefers-color-scheme` de sus @media: cierta la del modo elegido y falsa la otra. Una hoja de otro origen no se puede leer y se queda como está.

## 2026-10-31 · Feedback anónimo de quien monta un sistema

Para saber qué le habría venido bien a la gente al instalar el kit y montar un sistema, `ds feedback` envía sugerencias que redacta el agente, con el sí de la persona. `montar-sistema` lo ofrece al cerrar, y el comando está siempre disponible.

- **Campos fijos y un texto libre.** Versión del kit, agente, SO, versión mayor de Node, origen y stack en etiquetas de una lista cerrada, más «qué te habría venido bien». Se descartó un formato problema → causa → solución: lo útil son las sugerencias, y un formato rígido empuja a contar detalles del producto.
- **Anonimizado en el equipo.** El CLI quita rutas, URLs, dominios, correos, usuarios, claves, commits y colores, y con `system.json` y el último sync, los nombres del sistema y del producto y sus tokens, clases y componentes. Enseña el JSON exacto antes de enviar. Es la regla 1 llevada al feedback: nada del producto sale del equipo.
- **Solo con un sí.** Por defecto en seco. En una terminal pregunta; un agente usa `--enviar` solo tras la respuesta de la persona. No se guarda nada en local.
- **Endpoint propio que abre un issue.** `api/feedback.mjs`, en el proyecto de Vercel que despliega el kit, valida la forma, limita tamaño y ritmo (en memoria, sin IPs) y crea un issue público con la etiqueta `feedback` usando un token de grano fino que vive en Vercel. Las sugerencias van en un bloque de código para que no haya menciones ni enlaces. Descartado: un servicio de analítica (más datos de los necesarios) y que el CLI cree el issue directamente (necesitaría un token o una cuenta de GitHub de quien envía).

## 2026-10-31 · Colores de las fichas, también en el código

`ds check` exige que los colores escritos en una ficha existan en producción, para que una ficha no enseñe valores viejos. Solo miraba las hojas de estilo. En un sistema real fallaban 16 fichas cuyos ejemplos reproducen dibujos: iconos en SVG dentro de componentes y paletas en archivos de datos. Esos colores son de producción aunque no estén en el CSS.

- Se buscan también en el código y los datos (`.tsx`, `.ts`, `.js`, `.vue`, `.svelte`, `.astro`, `.html`, `.json`), sin tests, que pueden traer colores de prueba, ni Markdown, que es documentación y no producción.
- Se descartó quitar los dibujos de los ejemplos o rebajar el aviso: el ejemplo debe parecerse a producción, y el aviso sigue sirviendo para los colores viejos.
- El precio: un color que solo aparece en un comentario del código cuenta como de producción. Es raro y no compensa analizar el código.

## 2026-10-31 · El sistema de ejemplo, publicado

La landing del kit (`ds.aochoa.fyi`, en el repo del digital garden) enseña la interfaz real en una ventana. Para eso, `systems/ejemplo` se publica en `ds.aochoa.fyi/ejemplo`, con un proyecto de Vercel que construye este repo según `vercel.json`. El build exporta con `DS_RUTA=/ejemplo` y sirve `.next-build` como estático, sin el preset de Next de Vercel, porque `out/` no tiene la carpeta de la ruta dentro: el garden lleva `/ejemplo/:path*` al despliegue sin la ruta, como explica «Git, GitHub y entornos».

- **Por qué en el kit.** El ejemplo cambia con el kit. Cada fusión en `main` actualiza la demo, y la landing no necesita saber nada del build.
- **Por qué no en npm.** `vercel.json` no está en `files`, así que no llega a los sistemas.
- **Descartado:** un subdominio propio para el ejemplo. Con todo en un solo dominio, el iframe es del mismo origen y no hay que abrir cabeceras de framing.

## 2026-10-31 · El feedback no quita palabras sueltas

El primer envío real de `ds feedback` llegó con «feedback» cambiado por `<producto>`: la anonimización tomaba la primera palabra del nombre de la carpeta como nombre del producto. Con un repo como `mi-jardin`, se habría borrado cada «mi» de las sugerencias.

- Se quita el nombre entero en todas sus formas (slug, junto, CamelCase…) y, además, sin los sufijos habituales de un repo (`-design-system`, `-ds`, `-web`, `-app`, `-site`, `-frontend`, `-landing`…), que es como suele aparecer el producto a secas.
- Se descartó mantener la primera palabra con más palabras comunes excluidas: la lista nunca acaba, y una sugerencia estropeada es peor que un nombre compuesto poco habitual.
- El precio: si un repo se llama `acme-plataforma` y alguien escribe solo «acme», no se quita. La persona ve el JSON antes de enviarlo y puede corregirlo.

## 2026-10-31 · Selector de superficie en la cabecera

Un feedback de `ds feedback` (imandresochoa/ds#28) contaba un producto con dos interfaces muy distintas. En la web del sistema, la barra lateral, la galería y la búsqueda mezclaban las fichas de las dos, y solo el ejemplo decía de cuál era cada una.

- **Un selector en la cabecera**, junto a la marca, como el de equipo o proyecto de Vercel: Todas o una superficie. Sale solo con dos superficies o más.
- **De qué superficie es una ficha:** de las que declaran sus plataformas y de las que pintan sus ejemplos (`superficie=`). No hace falta un campo nuevo en la ficha. Sin ninguna, la ficha es común y se ve siempre: ocultar los tokens o los principios al elegir una superficie dejaría el sistema cojo.
- **En el cliente, no en rutas.** El sitio se exporta estático: una ruta por superficie multiplicaría las páginas. La elección va en `?superficie=` (para enlazarla) y en el almacenamiento del navegador (para que siga al navegar, porque los enlaces internos no llevan el parámetro). Las piezas de servidor marcan lo suyo con `data-superficies` y una regla de CSS oculta lo demás. Un enlace con el parámetro manda sobre lo recordado.
- **Descartado por ahora:** filtrar también la página de una ficha (sus columnas de tokens por superficie) y el registry. El selector ordena la navegación; no cambia lo que dice una ficha.

## 2026-11-01 · Una sola navegación

La navegación salía tres veces: seis enlaces en la cabecera, un grupo «Secciones» en la barra lateral con lo mismo, y después un grupo por sección, así que Fundamentos y Tokens salían dos veces. La barra mezclaba índices, páginas de Docs y fichas. Además, todas las fichas de un sistema recién montado llevaban el punto de «Nuevo». La referencia es Geist (vercel.com/geist): cabecera con la marca, la búsqueda y unos iconos, y una sola barra lateral con grupos fijos.

- **Solo barra lateral.** La cabecera se queda con la marca y el nombre del sistema (que llevan a la home), el selector de superficie tras una barra, como el proyecto tras el equipo en Vercel, la búsqueda, el repo, el tema y «Nuevo». `Nav.top` y `Nav.sections` desaparecen. El móvil enseña Inicio y los mismos grupos que la barra.
- **Grupos fijos:** Empezar (Introducción, las páginas de `content/docs/`, Producción y Para agentes), una sección por grupo en el orden de `CONTENT_SECTIONS` y Metodología si el sistema la activa. La barra sale de `CONTENT_SECTIONS`: si una sección desaparece de ahí, su grupo también. Un grupo sin fichas (con la superficie elegida) no sale, igual que antes.
- **El índice, con «Vista general» como primer elemento del grupo.** Se descartó enlazar el título del grupo: en Geist no es un enlace, nada indica que se pueda pulsar y, al estar en el índice, no hay dónde marcar la página activa. Un elemento propio sí tiene estado activo y se ve igual que el resto. «Vista general» y no «Todos» porque no tiene género (Iniciativas pediría «Todas») y es lo que Vercel llama «Overview». El precio: se repite la etiqueta en cada grupo, aunque cada una lleva a un sitio distinto. Empezar no lo lleva: su índice es la Introducción. ⌘K enseña esos índices con el nombre de la sección.
- **Fichas por orden alfabético y sin subgrupos**, también en Bloques, Gráficos, Fundamentos e Iniciativas. Antes se ordenaban por categoría sin enseñar la categoría, y la lista parecía desordenada. Con subgrupos, un sistema con 18 bloques tendría tres niveles en la barra. Geist lista sus componentes en una sola columna alfabética; las categorías se ven en el índice de cada sección. El orden de anterior y siguiente es el de la barra.
- **Densidad de Geist:** título de grupo y elementos al mismo tamaño (`text-sm`), el título con más peso y en `foreground`, los elementos en `muted-foreground`, filas de 32 px y 20 px entre grupos. Un título largo pasa a dos líneas en vez de montarse sobre el punto.
- **El punto de «Nuevo».** Sale si la ficha se creó en las dos últimas semanas, pero no en la primera semana del sistema (contada desde la ficha más antigua). Lo que entra al montar un sistema no es novedad, y marcarlo todo no informa de nada. Se descartó no marcar nada cuando todas las fichas de una sección son nuevas: al añadir una ficha de verdad nueva a una sección recién montada, tampoco saldría. Se acortó la ventana de 30 a 14 días porque un punto que dura un mes deja de verse. Los puntos de estado (exploración, sync con avisos) no cambian.

## 2026-11-01 · Índices con tarjetas en vivo y galerías con barra lateral

El índice de una sección era una rejilla de nombres: no se veía un componente hasta entrar en su ficha. En un sistema recién montado, con todas las fichas creadas en el último mes, «Nuevos» y «Todos» repetían la misma lista. Bloques, Gráficos e Iniciativas eran páginas anchas sin barra lateral, así que la barra aparecía y desaparecía al pasar de una sección a otra. La referencia de densidad es vercel.com/geist y los índices de shadcn (`/blocks`, `/charts`).

- **Una tarjeta por ficha con su primer ejemplo en vivo**, reducido dentro de un marco de alto fijo, con el nombre y el punto de estado debajo. Se descartó una captura estática: habría que generarla en cada build y se quedaría vieja respecto a la hoja de producción. Una ficha sin ejemplo se ve con su resumen, para que la falta se note sin romper la rejilla.
- **El ejemplo, escalado con `transform`.** El iframe se pinta con un ancho de vista y `scale()` lo encoge al ancho de la tarjeta. Un componente se ve a escala fija (0,8) y centrado; un bloque, con 1280 px de ancho, que es una pantalla de escritorio, y desde arriba; un gráfico, con 560 px, una tarjeta de panel. Se descartó pintar el componente a tamaño real: los anchos se recortan, y los bloques a tamaño real no caben en una tarjeta.
- **Se cargan al acercarse a la pantalla** (IntersectionObserver con 400 px de margen). Con 18 bloques, al abrir el índice se cargan los ocho primeros; el resto, al bajar, en unos 300 ms en el sitio exportado. Las hojas de producción son las mismas en todas las tarjetas y el navegador las cachea. Sin interacción: el clic va al enlace de la tarjeta.
- **Sin «Nuevos» y «Todos».** «Nuevo» pasa a ser una marca en la tarjeta, con la regla del punto de la barra lateral (ver «Una sola navegación»): sin el lote del montaje, no hace falta otra regla en el índice. Componentes va en orden alfabético, sin grupos. Las secciones que agrupan llevan un título por grupo, en el orden de `categorias`, aunque la barra lateral las liste por nombre: categorías en Bloques y Gráficos, `grupo` en Fundamentos y Tokens, «En curso» y «Publicadas» en Iniciativas.
- **Todas las secciones con la barra lateral.** Bloques, Gráficos e Iniciativas pasan a `(docs)/[section]`, con la misma cabecera corta (título, una línea y el prompt de la sección) y la misma tarjeta. Las URLs no cambian. El visor ancho de un bloque se queda solo en su ficha. El Lab sigue ancho: es una herramienta, no un índice.
- **Sin la columna de la derecha en los índices.** «En esta página» no tiene sentido en una rejilla, y la tarjeta para agentes ya está en cada ficha. El índice usa ese ancho para una columna más de tarjetas.

## 2026-11-01 · Los tokens van en su fundamento

Color y tipografía tenían dos páginas, una en Fundamentos con las reglas y otra en Tokens con la tabla, en dos grupos de la barra lateral. Para entender un tema había que leer las dos. La página Colors de Geist pone la guía y la escala en la misma página, y así se juzga un color: por su regla y su valor a la vez. Se junta también el contenido, no solo la interfaz. La sección Tokens desaparece y su lista de tokens pasa a la ficha de fundamento. Sustituye a «Fundamentos y tokens sin solaparse» (2026-10-11): el reparto entre criterio y valores se mantiene, pero dentro de la misma ficha.

- **La misma clave, `tokens`.** En un fundamento, `tokens` es la lista que documenta, con `nombre` y `rol`. En componentes, bloques y gráficos sigue siendo la lista de los que usan. La sección decide el sentido, y la migración solo mueve la lista. Se descartó una clave nueva (`define`), más explícita, porque obligaba a renombrar en todas las fichas una clave que nadie confundía.
- **La tabla, en `## Tokens`.** El kit la pinta debajo del texto de ese apartado del cuerpo o, sin él, al final. Así un fundamento puede subirla arriba, como Geist, sin una opción nueva. El texto de la antigua ficha de tokens (dónde se declaran, qué superficies los usan) va a ese apartado.
- **Una ficha de tokens sin fundamento del mismo slug pasa a ser ese fundamento.** Con fundamento, manda el frontmatter del fundamento y se avisa si los estados no coinciden.
- **`ds migrar` y corte.** La 2.0 ya no lee `content/tokens/`. `npx ds migrar` enseña la migración y `--aplicar` la escribe: junta o mueve las fichas, cambia los ids `tokens/…` de `relacionados`, `usa` y el lock, y los enlaces a `/<id>/tokens/<slug>` en el texto. `ds doctor` y `ds check` fallan, y `ds dev`, `ds build` y `ds sync` avisan, mientras quede la carpeta. Se descartó seguir leyéndola durante la 2.x, juntándola en memoria: era más código para una migración que se hace con un comando.
- **Los ids antiguos se siguen leyendo.** `tokens/<slug>` cuenta como `fundamentos/<slug>`, igual que `patrones/` cuenta como `bloques/`. Las referencias de un fundamento a sí mismo se quitan.
- **Las URLs `/<sistema>/tokens/<slug>` dan 404.** El sitio es estático y no hay redirecciones de servidor. Se descartó generar páginas que redirigen: los enlaces compartidos son pocos y el CHANGELOG avisa.
- **Sin tipo `token` en el registry.** El JSON de un fundamento lleva `tokens` con `nombre`, `rol` y su valor en cada superficie, como lo llevaban las fichas de tokens. Los tokens de una pieza apuntan en `usa` al fundamento que los documenta. El `.md` de cada fundamento gana la tabla. Se descartó mantener `tipo: token` para los fundamentos con tokens: un mismo tipo habría significado dos cosas.

## 2026-11-01 · La ficha con el ritmo de Geist

La referencia es la página de un componente de Geist (`vercel.com/geist/button`): un título, una línea, y un apartado por ejemplo con un título corto, a veces una frase, la tarjeta compacta y una franja «Show code» plegada. Se escanea de un vistazo. En nuestra ficha cada ejemplo ocupaba al menos 288 px, el código corto salía desplegado y la columna de la derecha cargaba con una tarjeta para agentes en todas las páginas.

- **El código, siempre plegado.** Una franja «Ver código» al pie de la tarjeta, también con el código corto. Se descartó mantener el umbral de ocho líneas: hacía que unas tarjetas midieran el doble que otras y la página perdía el ritmo. En la franja van también la superficie, el conmutador de modo y el botón de copiar (se puede copiar sin desplegar). Antes el conmutador flotaba arriba a la derecha y, con un marco bajo, tapaba el ejemplo.
- **El marco, del alto del contenido.** El mínimo baja de 288 a 96 px y el margen de dentro, de 32 a 24. Los ejemplos con `vista` no cambian: su alto lo fija la vista.
- **Cabecera corta.** Título, una línea de descripción a lo ancho de la columna y una fila discreta (estado, código e iniciativa) en texto pequeño, sin píldoras. El conmutador de plataforma sigue saliendo solo con más de una.
- **El contexto para agentes, en «Copiar página».** La columna de la derecha queda solo para «En esta página». «Copiar contexto para agentes» pasa al menú de «Copiar página», y en las páginas sin Markdown (los índices) el botón copia el contexto directamente; ⌘K ya lo tenía. Se eligió ese menú porque es donde se copia algo para un agente (en shadcn están ahí «Open in v0» y «Open in Claude»). Descartado el pie de página: se repite en todas las páginas y queda lejos. Descartado «Nuevo»: sirve para crear (el Lab, el prompt de cada sección) y no para leer el sistema.
- **Lo que añade el sistema, compacto.** «Enlace con producción» deja la tabla de cinco columnas, que se salía del ancho, por una línea por fuente (punto de estado, ruta, superficie y estado) con una segunda línea pequeña con las clases, la huella y el commit revisado. Se descartó plegarla: es lo que dice si la ficha sigue siendo verdad y tiene que verse. «Usa» y «Relacionados» pasan a tarjetas de dos líneas. Entre el último apartado de la ficha y «Tokens que usa» hay ahora el mismo aire que entre dos apartados (antes se pegaban).
- **Un bloque, en el visor ancho y en su ficha.** Con la galería ancha de Bloques fuera (los índices pasan a tarjetas en vivo), el visor (`BlockViewer`: Vista y Código, anchos, modo y prompt) solo vive en la ficha del bloque. Sus ejemplos se pintan con él y no con la tarjeta compacta: un bloque es una pantalla o una sección, y a 640 px se vería en su versión estrecha. En esa ficha la columna llega a `max-w-6xl` y el texto sigue a 640 px para que se lea bien. Se descartó ensanchar todas las fichas: la de un componente se lee mejor estrecha.

## 2026-11-05 · Directorio con repos git

El Directorio solo leía carpetas locales: había que clonar a mano cada sistema al lado del directorio, y no se podía compilar en CI ni en Vercel. Para una organización con muchas aplicaciones, cada una con su sistema en su repo, eso no escala. Ahora una entrada de `sistemas` puede ser un repo git, `{ "git": "github:org/x-design-system", "ref": "v1.4.0" }`, además de una ruta.

- **Fuentes git, no federación.** Se descartó juntar por URL los registries ya publicados de cada sistema: cada uno tendría su versión del kit, el Directorio dependería de que todos los sitios estén en línea y la cobertura se pediría por red. Con fuentes git hay un solo build y una sola versión del kit, como hasta ahora (ver «Directorio», 2026-10-30). Se puede añadir la federación más adelante si un sistema necesita publicarse aparte.
- **Caché de solo lectura en `.ds/fuentes/<id>`.** `ds dev`, `ds build` y `ds doctor` clonan o actualizan cada repo ahí, en el `.gitignore` del directorio, y lo leen como una carpeta. Los archivos no tienen permiso de escritura, el remoto no tiene URL de push y un cambio local se descarta en la siguiente lectura. El kit sigue sin escribir en ningún repo.
- **La ref se fija.** Un commit completo o una etiqueta; con eso, el sitio solo cambia cuando un PR del directorio sube la ref, y una persona lo revisa. Una rama o la falta de `ref` funcionan, pero se avisa. Con la ref ya descargada no se usa la red. Se descartó aceptar commits cortos: `git fetch` no los resuelve en el remoto.
- **El acceso es el de la persona o el del CI.** Con `github:` se usa `gh` como asistente de credenciales solo para esa orden, y si no hay `gh`, https (el asistente de git o un repo público) y luego SSH. Con `git@…`, SSH. El kit no pide, no guarda ni escribe tokens, y desactiva la pregunta de usuario y contraseña de git: si falta acceso, el error dice cómo darlo.
- **Solo URLs `github:`, ssh, https y `file:`.** Se rechazan los transportes que ejecutan órdenes (`ext::`) y lo que empieza por `-`.
- **Sin repo de producción al lado.** Un sistema de un repo git se lee sin su producción: `ds doctor` no lo marca como error y el Directorio enseña el último sync que el sistema tenga en esa ref.
- **Sigue la regla de la lista.** Solo salen los sistemas de `directorio.json`. Un repo git es otra forma de nombrar un sistema propio, no un registry de terceros.
- **Versión menor.** Las rutas siguen valiendo igual y no cambia la forma de lo que se publica para agentes.
