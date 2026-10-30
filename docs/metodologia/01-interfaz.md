---
titulo: La interfaz
resumen: Doble barra lateral al estilo de Codex, con sus medidas exactas y por qué está así.
---

La interfaz replica la estructura y el estilo visual de la app de escritorio de Codex: neutra, densa y sin decoración. El contenido es lo que tiene color; la interfaz no compite con él. La excepción es la portada: es la puerta de entrada y lleva el color del sistema.

## Estructura

- **Portada** (`/<sistema>`): lo primero que se ve, sin barras. Ver «Portada» más abajo.
- **Barra de título** (44 px): a la izquierda, siempre el nombre del sistema (sin icono), que lleva a la portada, alineado con el título de la barra de sección, y a su lado atrás y adelante. A la derecha, las etiquetas de la ficha abierta y sus acciones: abrir el `.md`, ver en producción y el menú «…».
- **Pastilla de estado**: una sola, con fondo. El texto es el estado («En producción») y el color resume el sync: verde, sincronizada; ámbar, hay que revisarla; rojo, declara algo que ya no existe. Al pasar el ratón muestra el detalle: estado, sync, plataformas y fuentes. El id y la fecha van al pie de la ficha.
- **Pestañas de plataforma**: solo aparecen las plataformas que existen. Con una sola, no hay pestañas.
- **Rail de iconos** (52 px): arriba, una entrada por capa (Inicio, Fundamentos, Tokens, Componentes, Patrones, Iniciativas). Abajo, de arriba a abajo: mostrar u ocultar la barra lateral; «…», con los recursos para agentes, la metodología (si el sistema la activa) y el enlace con producción; y el sistema actual. Los menús de abajo se abren hacia arriba.
- **Barra de sección** (292 px): el nombre de la sección, contexto para agentes y buscar; una acción que copia un prompt para tu agente; y las fichas de la sección agrupadas.
- **Contenido**: título, resumen y, si hay más de una plataforma, las pestañas para cambiar entre ellas.

Inicio vive en `/<sistema>/inicio`. Su barra de sección muestra **Recientes** (lo que has abierto en este navegador) y **Añadidos recientemente** (por fecha de creación).

## Portada

`/<sistema>` es el mosaico de secciones a pantalla completa, sin barras, a partir de brand.dropbox.com. Las cajas giran en molinete alrededor de la casilla del sistema (sus iniciales sobre su `color`), que lleva a Inicio. Al cargar, el mosaico entra con un zoom corto hacia atrás y las cajas aparecen una tras otra.

- **Una caja por sección**: Fundamentos, Tokens, Componentes, Patrones, Iniciativas y, si el sistema la activa, Metodología. Cada una muestra su número de fichas y una ilustración de su icono del rail, animada en bucle: una mano traza una línea a lo largo de la regla, el muestrario se abre en abanico, las piezas se separan, giran y encajan, un cursor arrastra las cajas de la plantilla, una mano mece el matraz mientras burbujea y el libro pasa página.
- **Ilustraciones**: al estilo de las de Claude. Cada una es una lámina de color con grano, con figuras de papel recortado (blanco roto, bordes algo torcidos, sin contorno) y trazo de tinta a mano (casi negro, grueso, de puntas redondas) para manos, lápices y detalles. Lo que se sale de la lámina queda cortado por su borde. Rejilla de 200 en `components/LandingArt.tsx`.
- **Al pasar el ratón**, la caja toma el color del sistema, enseña la descripción de la sección y la lámina se inclina un poco.
- **Composición**: `lib/landing.ts` tiene varias plantillas en molinete por número de cajas (de 4 a 8): apaisadas, cuadradas y verticales, y también las prueba traspuestas y con distintos pesos por pista. Para cada proporción de pantalla elige la más armónica: la que deja la caja más alargada lo menos alargada posible, con la casilla del sistema cerca del centro y cajas de tamaño parecido. El resultado son media queries por proporción, calculadas en el servidor. Así no quedan barras estrechas a lo alto ni a lo ancho: en las pantallas habituales ninguna caja pasa de 1:1,8. Con más de 8 cajas, las que sobran van en filas bajo el molinete. Una sección nueva aparece sola; si no tiene ilustración en `components/LandingArt.tsx`, usa la genérica.
- **Color**: las cajas son neutras; la lámina de las ilustraciones es el `color` del sistema, aclarado si es tan oscuro que la tinta no se vería (más si es casi neutro, para que no quede gris de periódico) u oscurecido si el papel no destacaría. Papel y tinta son fijos, también en modo oscuro, como una lámina impresa. El texto encima del color es blanco o casi negro, el que más contraste. En modo oscuro, un color casi negro se sustituye por el del texto para que no desaparezca.
- **Movimiento**: solo CSS. Con «reducir movimiento», todo queda quieto.

## Medidas

Tomadas de capturas a 2x y convertidas a píxeles lógicos. Viven como tokens en `app/shell.css`.

| Elemento | Medida |
| --- | --- |
| Barra de título | 44 px de alto, fondo `#f2f2f2` |
| Rail | 52 px de ancho; botones de 36 px separados 8 px; activo en `#e6e7e7`; iconos de 18 px |
| Panel | Radio superior izquierdo de 12 px; borde `#e6e6e6` |
| Barra de sección | 292 px, fondo `#fbfbfb`, borde derecho de 0,5 px en `#e1e1e1`, 8 px de margen |
| Fila | 29 px de alto + 2 px de separación, radio de 8 px, texto de 14 px en `#3b3d3f`, activa en `#eeefef` |
| Etiqueta de grupo | 14 px en `#8c8d8e` |
| Cabecera de la barra | 18 px, seminegrita |
| Página | 50 px de margen lateral, 28 px arriba; título de 24/32 px |
| Pastillas | 36 px de alto, radio completo, 13 px; activa en `#f2f3f3`; inactiva en `#6a6b6d` |
| Texto | 14/22 px en `#1a1c1f`; secundario `#6a6b6d`; terciario `#8c8d8e` |
| Paleta ⌘K | 520 px de ancho, radio de 16 px, fondo atenuado al 14 % |
| Menú | ~220 px, filas de 28 px, radio de 14 px |

El modo oscuro es una aproximación pendiente de calibrar con capturas.

## Atajos

- `⌘K`: buscar fichas y acciones rápidas. `⌃1`–`⌃9` abre un resultado.
- `⌘\`: mostrar u ocultar la barra lateral (también desde el rail, encima del sistema).
