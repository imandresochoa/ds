---
titulo: Capas y sistemas anidados
resumen: Diseño atómico en cinco capas y sistemas que heredan de otros.
---

## Las capas

Cada ficha pertenece a una capa. Las capas van del criterio a lo más compuesto; una capa solo usa piezas de las anteriores. Los fundamentos van primero porque son el porqué; los tokens son ese criterio convertido en valores.

| Capa | Qué contiene | Ejemplo |
| --- | --- | --- |
| **Fundamentos** | Reglas de criterio: tipografía, color, maquetación, movimiento, voz, ilustración. Explican cómo y cuándo, y enlazan a sus tokens. | «Los titulares van en serif ligera» |
| **Tokens** | Valores con nombre y su rol, uno por modo si el producto tiene varios (claro, oscuro). Se leen del código de producción. | `--ink`, `--radius-lg`, `--dur-micro` |
| **Componentes** | Piezas reutilizables. Se navegan **por función** (Acciones, Navegación, Formularios, Feedback, Contenido, Superposiciones) y llevan su **nivel atómico** como dato. | Botón, Enlace de texto, Cabecera |
| **Patrones** | Composiciones que resuelven un problema: **secciones**, **pantallas** y **flujos**. | Hero, Precios |
| **Superficies** | Las páginas reales de producción. Hoy viven en producción; el sistema las enlaza. | Landing, área de cliente |

### Función para navegar, nivel atómico para componer

Shopify, Vercel y la mayoría de sistemas de referencia listan los componentes por función, no por átomos, moléculas y organismos. Nosotros hacemos lo mismo en la interfaz. El nivel atómico (`nivel: atomo | molecula | organismo`) se mantiene en cada ficha como regla interna: un átomo no usa otros componentes, una molécula usa átomos y un organismo usa moléculas o átomos. Sirve para el método y para los agentes, no para buscar.

Las **iniciativas** no son una capa: agrupan trabajo en curso que atraviesa capas (ver Estados).

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
