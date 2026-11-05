# Diseñar como ds

## Contexto

ds es el sistema de diseño de la interfaz del kit: la web donde se consulta cualquier sistema hecho con él. La interfaz enseña los sistemas de otros, así que se aparta: blanco y negro, Geist, la estructura de ui.shadcn.com y el ritmo de las páginas de Geist. Lo que tiene que transmitir es que lo que se ve es verdad: cada ejemplo sale del código de producción.

## Orden de prioridad

1. Lo que se pida en la conversación.
2. Las fichas «En producción».
3. Esta guía.
4. Si nada lo cubre: pregunta.

## Integración

- Next.js con Tailwind 4. Los tokens están en `app/globals.css` (`:root`, `.dark` y `@theme inline`).
- Las primitivas son las de shadcn/ui en `components/ui/` (MIT). Las piezas propias del sitio, en `components/site/` y `components/docs/`.
- Las clases se combinan con `cn()` (`lib/utils.ts`); las variantes, con `cva`.
- Los textos están en español y en el propio componente.

## Lenguaje visual

- Neutros en pares de fondo y texto (`primary` / `primary-foreground`). El único color con tono es el de los estados.
- Geist para la interfaz y Geist Mono para el código. Titulares en `font-semibold` con `tracking-tight`.
- Un radio base (`--radius`, 0,625 rem) del que salen los demás. Las piezas pequeñas, más cuadradas.
- Bordes de 1 px con `border`; sombras solo en lo que flota (menús, diálogos).
- Modo claro y oscuro con la clase `.dark`. Todo lo que se pinta usa tokens, así que cambia solo.

## Rechaza estos reflejos

- **Un color de marca.** Competiría con los ejemplos de los sistemas que enseña la interfaz.
- **Recrear producción.** Los ejemplos cargan el CSS de producción; no se copian estilos a mano.
- **Píldoras de estado de colores.** El estado es un punto y una palabra.
- **Valores sueltos.** Nada de `oklch(…)`, hexadecimales ni `rounded-[10px]` fuera de `app/globals.css`.

## Accesibilidad

- Contraste de 4,5:1 en texto normal, en los dos modos.
- Foco visible con el anillo `ring` de 3 px en todo lo interactivo.
- Ningún estado solo por color: siempre con texto, visible o `sr-only`.
- Los botones de icono llevan nombre accesible.
