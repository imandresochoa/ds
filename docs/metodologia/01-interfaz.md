---
titulo: La interfaz
resumen: "La estructura de ui.shadcn.com: cabecera, Docs con barra lateral para todas las secciones e índices con los ejemplos en vivo."
---

La interfaz copia la estructura y el estilo de ui.shadcn.com: neutra, sin decoración, con el contenido como única fuente de color. También copia su forma de pensar un sistema: documentación que se lee de arriba abajo y piezas que se ven en vivo y se copian. La diferencia es que aquí cada pieza enlaza con su código en producción.

## Estructura

- **Portada** (`/`). Con un sistema, lleva a él. Con varios (un directorio), es el Directorio: una tarjeta por sistema con sus fichas, su sync y su cobertura, y los enlaces a su registry y su `design.md` (ver «Kit y sistemas»).
- **Cabecera** (fija). A la izquierda, la marca del sistema (un selector si hay varios), su nombre, que lleva a la home, y el selector de superficie (si `system.json` tiene dos o más; ver «Plataformas y superficies»). No lleva enlaces de navegación: como en Geist, la navegación es solo la barra lateral. A la derecha, buscar, el repo de código (si `produccion.codigo` existe), modo claro u oscuro y **Nuevo**, con el Lab de primitivos, el prompt de cada sección y «Pedir un cambio».
- **Home** (`/<sistema>`). Un aviso con la última ficha creada, el nombre y la descripción del sistema, «Empezar» y «Ver componentes». Debajo, un escaparate con los ejemplos en vivo de las fichas marcadas con `destacado: true`. Si no hay ninguna, usa las que tienen ejemplo, primero las de producción, hasta nueve. Sin ejemplos, muestra una tarjeta por sección.
- **Docs.** Tres columnas, como en shadcn:
  - **Barra lateral**, la única navegación, con grupos fijos como la de Geist: «Empezar» (la Introducción, las páginas propias de `content/docs/` y Producción y Para agentes, que pone el kit), un grupo por sección y, si el sistema la activa, Metodología. El título de un grupo no es un enlace; el primer elemento de cada sección, «Vista general», lleva a su índice. Las fichas van por orden alfabético y sin subgrupos, también en Bloques y Gráficos: las categorías se ven en el índice. Un grupo sin fichas no sale. Anterior y siguiente, ⌘K y el menú móvil siguen el mismo orden.
  - **Puntos.** Uno de color si la ficha no está en producción o el sync avisa. El azul de «Nuevo», si se creó en las dos últimas semanas y no en la primera semana del sistema: lo que entró al montarlo no es novedad.
  - **Contenido**: título, descripción, insignias (estado, código, iniciativa), «Copiar página» en Markdown y anterior y siguiente.
  - **Derecha**: «En esta página» y la tarjeta «¿Trabajas con un agente?», que copia el contexto del sistema.
- **Índice de sección** (`/<sistema>/componentes`, `/bloques`, `/graficos`, `/iniciativas`…). Todas las secciones usan el layout de Docs, con la barra lateral, y la misma forma, con la densidad de Geist y de los índices de shadcn:
  - Cabecera corta: título, una línea de descripción y una acción, el prompt de la sección.
  - Una tarjeta por ficha con su primer ejemplo en vivo, reducido, y debajo el nombre, el punto de estado (si no está en producción) y «Nuevo», con la misma regla que el punto de la barra lateral.
  - Un componente se ve a escala fija y centrado; un bloque, con el ancho de una pantalla de escritorio (1280 px) y desde arriba; un gráfico, con el de una tarjeta de panel. Lo que no cabe en el marco se recorta. Los ejemplos se cargan al acercarse a la pantalla.
  - Una ficha sin ejemplo, una iniciativa o una página de la metodología se ven como tarjeta de texto con su resumen.
  - Componentes va en orden alfabético, sin grupos. Bloques y Gráficos llevan un título por categoría; Fundamentos, por `grupo`; Iniciativas, «En curso» y «Publicadas».
  - Una sección vacía explica qué va en ella y da el prompt para pedírselo al agente.
- **Ficha.** Los ejemplos en vivo con su código debajo. Si el código pasa de ocho líneas, se pliega con «Ver código». Las pestañas Web, iOS y Android siguen el conmutador de base de shadcn y solo aparecen las plataformas que existen. Un fundamento lleva su tabla de tokens en el apartado «Tokens». Al final van «Tokens que usa», «Enlace con producción», «Usa» (las piezas que compone) y «Relacionados».
- **Visor de bloques.** Va en la ficha de un bloque, no en el índice: Vista y Código, anchos de escritorio, tablet y móvil, y un botón que copia el prompt para que un agente lo use. Es el equivalente a `npx shadcn add`.
- **Lab de primitivos** (`/<sistema>/lab`). Es el equivalente al Create de shadcn, pero solo con primitivos. Tiene dos pestañas:
  - **Generar** crea los tokens, con los nombres de shadcn, desde unos pocos primitivos: neutro, marca y error; familias, tamaño base, escala e interlineado; unidad de espaciado; radio base; opacidad y difuminado de las sombras; y duración base, escala y curvas del movimiento.
  - **Ajustar tokens** cambia los que el sistema ya tiene, de cada superficie de producción o de `experimental/`.
  - Enseña claro y oscuro uno al lado del otro, sin componentes: pares de color con su contraste, escala de neutros, escala tipográfica, espacios, radios, sombras y movimiento (cada duración y cada curva, animadas; se paran con «reducir movimiento»).
  - Cada par por debajo de AA sale arriba con «Ajustar», que lo lleva al valor más cercano que llega.
  - No escribe nada. El estado va en la URL (`?preset=`), y «Copiar para tu agente» la pasa con el prompt para aplicarla (`npx ds preset aplicar`, ver «Crear un sistema nuevo»).
  - No descarga fuentes ni hace peticiones: las muestras usan las fuentes instaladas en el equipo.
- **Pie**: enlaces a `design.md` y `llms.txt`. En Docs no aparece.

## Estado de una ficha

Una insignia junto a la descripción. El texto es el estado y el punto resume el sync: verde, en producción y sincronizada; ámbar, hay que revisarla; rojo, declara algo que ya no existe; azul, en desarrollo; violeta, en exploración; gris, obsoleta. Al pasar el ratón muestra el estado, el sync, las plataformas y las fuentes. En las listas solo aparece el punto, y solo si la ficha no está en producción.

## Estructura, no componentes

El kit no trae componentes, bloques ni gráficos. Trae su estructura: las secciones, sus categorías, el visor y los estados vacíos. Cada sistema la llena con lo que ya existe en su producto o con lo que diseñe desde cero.

| Sección | Categorías (`categoria`) |
| --- | --- |
| Bloques | `seccion`, `pantalla`, `flujo` |
| Gráficos | `area`, `barras`, `lineas`, `circular`, `radar`, `radial`, `tooltip` |

Una categoría desconocida también funciona: se muestra con su nombre, después de las conocidas.

## Tecnología

- **Tailwind 4 y primitivas de shadcn/ui** (estilo new-york-v4, licencia MIT), copiadas en `components/ui/`. Solo las usa la interfaz del kit. Los ejemplos de las fichas no las usan: se pintan en un iframe con el CSS de producción.
- **Tokens** en `app/globals.css`, con la convención de shadcn (pares `x` y `x-foreground` en oklch, escala de radios), más `--estado-*` y `--nuevo`.
- **Tipografía**: Geist y Geist Mono.
- **Código**: resaltado con Shiki, con un tema claro y otro oscuro.

## Atajos

- `⌘K` o `/`: buscar.
- `⌘D`: modo claro u oscuro.
