---
titulo: Capas y sistemas anidados
resumen: Las capas del sistema, de los fundamentos a los gráficos, y sistemas que heredan de otros.
---

## Las capas

Cada ficha pertenece a una capa. Las capas van del criterio a lo más compuesto; una capa solo usa piezas de las anteriores. Los fundamentos van primero porque son el porqué; los tokens son ese criterio convertido en valores.

| Capa | Qué contiene | Ejemplo |
| --- | --- | --- |
| **Fundamentos** | Reglas de criterio: tipografía, color, maquetación, movimiento, voz, ilustración. Explican cómo y cuándo, y enlazan a sus tokens. | «Los titulares van en serif ligera» |
| **Tokens** | Valores con nombre y su rol, uno por modo si el producto tiene varios (claro, oscuro). Se leen del código de producción. | `--ink`, `--radius-lg`, `--dur-micro` |
| **Componentes** | Piezas reutilizables. Se listan **por orden alfabético**, como en shadcn; su **función** y su **nivel atómico** son datos de la ficha. | Botón, Enlace de texto, Cabecera |
| **Bloques** | Composiciones que resuelven un problema. Se agrupan por `categoria`: **secciones**, **pantallas** y **flujos**. | Hero, Precios, Alta |
| **Gráficos** | Cómo presenta datos el producto. Se agrupan por `categoria`: área, barras, líneas, circular, radar, radial y tooltip. | Ingresos por mes |
| **Superficies** | Las páginas reales de producción. Hoy viven en producción; el sistema las enlaza. | Landing, área de cliente |

### Lista alfabética para navegar, nivel atómico para componer

shadcn/ui lista los componentes por orden alfabético y marca los nuevos; nosotros también. La `funcion` (acciones, navegación, formularios, feedback, contenido, superposiciones) ordena `llms.txt` y el registry, pero no la barra lateral. El nivel atómico (`nivel: atomo | molecula | organismo`) se mantiene en cada ficha como regla interna: un átomo no usa otros componentes, una molécula usa átomos y un organismo usa moléculas o átomos. Sirve para el método y para los agentes, no para buscar.

Bloques y Gráficos son estructura: el kit no trae ninguno. Cada sistema los llena con lo que existe en su producto.

Las **iniciativas** no son una capa: agrupan trabajo en curso que atraviesa capas (ver Estados).

Antes de la 1.0, los bloques se llamaban **patrones** y su categoría iba en `nivel`. Las dos formas se siguen leyendo: `content/patrones/` aparece como Bloques y `nivel: seccion` cuenta como `categoria: seccion`.

## Sistemas anidados

Un sistema puede **extender** otro (`"extiende"` en `system.json`). El sistema hijo hereda la estructura, las reglas y los tokens del padre y solo redefine lo suyo.

```
base (metodología, shell, tokens neutros)
├── producto-a (marca, landing, área de cliente)
└── producto-b (marca, app)
```

Reglas de la herencia:

- Los tokens se redefinen por nombre. Un hijo no inventa un nombre nuevo para un rol que ya existe en el padre.
- Las fichas del padre aparecen en el hijo salvo que el hijo las sustituya con el mismo `id`.
- La metodología es común e interna: vive en `docs/metodologia/`, no se duplica por sistema y solo se muestra en los sistemas que la activan (`"metodologia": true`).

El sistema `base` y la resolución de herencia están pendientes (ver `docs/TAREAS.md`).

## Tres niveles de token

Cuando un sistema crece, los tokens se separan en tres niveles:

1. **Primitivos**: la paleta y las escalas en bruto (`--gray-900`).
2. **Semánticos**: el rol (`--ink`, `--paper`). Es lo que usan los componentes.
3. **De componente**: ajustes locales (`--btn-bg`).

Empieza por los semánticos y añade los de componente cuando un componente los necesite. Los primitivos solo hacen falta cuando hay varias marcas o temas que comparten paleta.

## Modos

Un modo (claro, oscuro, alto contraste, una segunda marca) no es una capa ni un juego de tokens aparte: es otro valor para los mismos tokens. Por eso vive dentro de la capa de tokens.

- Un token tiene un valor por modo. Un modo redefine nombres que ya existen y no inventa otros: `--ink` en oscuro, no `--ink-dark`.
- Los modos cambian los semánticos. Los primitivos son la paleta y no cambian de modo; los de componente apuntan a semánticos y cambian con ellos.
- La ficha de tokens enseña los valores de cada modo uno al lado del otro. Si un rol se lee bien en claro y no en oscuro, el fallo es del token, no del componente.
- Un token nuevo en un producto con modos se propone con un valor para cada modo.

El sync lee los modos del CSS de producción (ver «Enlace con producción»).
