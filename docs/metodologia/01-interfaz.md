---
titulo: La interfaz
resumen: "La estructura de ui.shadcn.com: cabecera, Docs a tres columnas y páginas anchas para Bloques, Gráficos e Iniciativas."
---

La interfaz copia la estructura y el estilo de ui.shadcn.com: neutra, sin decoración, con el contenido como única fuente de color. También copia su forma de pensar un sistema: documentación que se lee de arriba abajo y piezas que se ven en vivo y se copian. La diferencia es que aquí cada pieza enlaza con su código en producción.

## Estructura

- **Cabecera** (fija). A la izquierda, la marca del sistema (un selector si hay varios) y la navegación: Inicio, Docs, Componentes, Bloques, Gráficos e Iniciativas. A la derecha, buscar, el repo de código (si `produccion.codigo` existe), modo claro u oscuro y **Nuevo**, con el prompt de cada sección y «Pedir un cambio».
- **Home** (`/<sistema>`). Un aviso con la última ficha creada, el nombre y la descripción del sistema, «Empezar» y «Ver componentes». Debajo, un escaparate con los ejemplos en vivo de las fichas marcadas con `destacado: true`. Si no hay ninguna, usa las que tienen ejemplo, primero las de producción, hasta nueve. Sin ejemplos, muestra una tarjeta por sección.
- **Docs.** Tres columnas, como en shadcn:
  - **Barra lateral**: «Secciones» (Introducción y una entrada por sección), «Empezar» (las páginas propias de `content/docs/`, más Producción y Para agentes, que pone el kit), un grupo por sección con sus fichas y, si el sistema la activa, Metodología.
  - **Contenido**: título, descripción, insignias (estado, código, iniciativa), «Copiar página» en Markdown y anterior y siguiente.
  - **Derecha**: «En esta página» y la tarjeta «¿Trabajas con un agente?», que copia el contexto del sistema.
- **Índice de sección** (`/<sistema>/componentes`, `/fundamentos`, `/tokens`). Como el índice de componentes de shadcn: «Nuevos» (creadas en los últimos 30 días, con punto azul) y «Todos», en rejilla alfabética. Fundamentos y Tokens se agrupan por `grupo`.
- **Ficha.** Los ejemplos en vivo con su código debajo. Si el código pasa de ocho líneas, se pliega con «Ver código». Las pestañas Web, iOS y Android siguen el conmutador de base de shadcn y solo aparecen las plataformas que existen. Al final van «Tokens que usa», «Enlace con producción» y «Relacionados».
- **Páginas anchas.** Bloques y Gráficos tienen la forma de Blocks y Charts: cabecera, navegación por categoría y galería.
  - Cada bloque va en un visor con Vista y Código, anchos de escritorio, tablet y móvil, y un botón que copia el prompt para que un agente lo use. Es el equivalente a `npx shadcn add`.
  - Los gráficos van en tarjetas, en rejilla.
  - Iniciativas muestra tarjetas «En curso» y «Publicadas».
  - Una sección vacía explica qué va en ella y da el prompt para pedírselo al agente.
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
