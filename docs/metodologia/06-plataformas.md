---
titulo: Plataformas y superficies
resumen: Web, iOS y Android en la misma ficha; landing y portal dentro de web.
---

## Plataformas

Cada componente y bloque tiene pestañas de plataforma: **Web**, **iOS** y **Android**. Cada pestaña tiene su propio estado y su archivo (`web.md`, `ios.md`, `android.md`). Lo común (cuándo usarlo, reglas, accesibilidad) vive en `index.md` y se muestra en todas.

Cuando una plataforma no tiene implementación, la pestaña muestra «Sin iniciar» y un prompt para que un agente prepare la primera versión en exploración.

Para añadir una plataforma a un sistema se añade a `plataformas` en `system.json`. Para iOS y Android, el enlace con producción funciona igual: la fuente es un archivo Swift o Kotlin y la huella es el archivo completo.

## Superficies

Una superficie es una parte del producto con su propio código: por ejemplo, una **landing** en HTML y CSS estático y un **área de cliente** en Next y Tailwind. Se definen en `system.json`:

```json
"superficies": {
  "landing": { "nombre": "Landing", "estilos": ["public/site/fonts.css", "public/site/styles.css"], "cobertura": true },
  "portal": { "nombre": "Portal de clientes", "estilos": ["src/app/globals.css"], "tailwind": "4.3.3", "cobertura": true }
}
```

- `nombre`: cómo se llama la superficie en la interfaz.
- `url`: dónde se ve en producción. Es informativa: la leen personas y agentes.
- `fondo`: color de fondo de los ejemplos en vivo de la superficie.
- `estilos`: hojas que se copian en la instantánea y que cargan los ejemplos.
- `cobertura`: si se cuenta lo que esta superficie tiene sin documentar. `true` cuenta clases o, si la superficie es Tailwind, componentes; `"clases"` o `"componentes"` lo fuerzan (ver «Enlace con producción»).
- `componentes`: carpeta o lista de carpetas de componentes para esa cobertura. Por defecto, `src/components`.
- `tailwind`: versión de Tailwind con la que se compilan los ejemplos de la superficie en el navegador.
- `estilosExtra` y `cssExtra`: hojas de otra superficie (fuentes) y variables que en producción pone el framework.

Fuera de `superficies`, `produccion` lleva `repo` (ruta al repo de producción, relativa al sistema), `rama` (`main` por defecto), `publico` (la carpeta de archivos públicos, de donde salen las fuentes e imágenes de la instantánea; `public` por defecto), `codigo` (URL base para ver un archivo) y `web`.

Si dos superficies implementan el mismo componente de forma distinta, la ficha lo anota en «Diferencias entre superficies». Unificarlas es una iniciativa, no un arreglo silencioso.
