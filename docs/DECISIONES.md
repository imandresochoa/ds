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
