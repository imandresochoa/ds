# Tareas del kit

Las tareas de cada sistema viven en su propio repo. Aquí solo lo que afecta al motor y al método.

## Hecho

- [x] Interfaz con la estructura de ui.shadcn.com: cabecera, Docs a tres columnas, índice con «Nuevos», galerías de Bloques y Gráficos, ⌘K.
- [x] Secciones: Fundamentos, Tokens, Componentes, Bloques, Gráficos, Iniciativas y Metodología (interna); páginas de Docs por sistema en `content/docs/`.
- [x] Estados por ficha y por plataforma; pestañas Web, iOS y Android cuando hay más de una.
- [x] Sync con producción: instantánea de CSS, tokens, huellas, clases inventadas, cobertura y cambios sin commit.
- [x] Capa para agentes: `llms.txt`, `design.md`, `registry.json`, `llms-full.txt` y `.md` por página.
- [x] Kit separado: CLI `ds`, contenido en repos externos, plantilla, `ds doctor`.
- [x] Modos (claro, oscuro…) y variables de `@theme` como tokens; cobertura por componentes en superficies Tailwind.
- [x] Ruta de publicación (`publicacion.ruta`, `DS_RUTA`): el sitio exportado se sirve bajo una carpeta de otro sitio.

## Interfaz

- [ ] Revisar contra ui.shadcn.com al lado y ajustar detalles finos.
- [ ] Visor de bloques redimensionable arrastrando, como en shadcn.
- [x] Inicio con un solo sistema: redirige al sistema.

## Instalación y publicación

- [x] Skill de montaje con preguntas nativas (`ds instalar`, `montar-sistema`), `ds init` con parámetros, `ds info` y `ds search`.
- [x] Paquete preparado: `@imandresochoa/ds`, `files` en lista blanca y workflow manual con trusted publishing.
- [x] Repo público nuevo sin historial (`imandresochoa/ds`); el antiguo, privado, como `design-system-agentic-first-kit-legacy`.
- [x] Licencia MIT.
- [x] Versión 0.9.0 sin `"private": true`.
- [x] Primera publicación en npm: `@imandresochoa/ds@0.9.0`, a mano y con 2FA (2026-10-30).
- [x] Trusted publisher configurado con `npm trust` (`imandresochoa/ds`, `publicar.yml`). Las versiones siguientes salen con el workflow.
- [x] En npmjs.com, «Publishing access» → «Require two-factor authentication and disallow tokens»: solo se publica desde el workflow.

## Fases pendientes

El rediseño al modelo de shadcn/ui se acordó en cinco fases. La 1 (interfaz) y la 2 (instalación y `montar-sistema`) están hechas y salieron en la 0.9.0. La 3 (Lab de primitivos) sale en la 0.10.1. La 0.10.0 no llegó a npm. Lo decidido está en `DECISIONES.md`, entradas del 2026-10-30. Cada fase empieza con una propuesta y preguntas, no con código (ver «Cómo trabajamos» en `AGENTS.md`). Lo que pone «Por decidir» no está decidido: se pregunta.

### Fase 3 · Lab de primitivos

Ajustar los primitivos de un sistema que parte de una web, de Figma o de nada, sin escribir los tokens a mano. Es el equivalente del Create de shadcn, pero solo con primitivos, porque el kit no lleva componentes.

Acordado:
- **Qué ajusta:** color (neutro y marca, que dan pares semánticos `x` / `x-foreground` con comprobación de contraste AA), estilos de texto (familias, tamaño base y escala), espaciado, radios (una base y su escala, como shadcn) y sombras. El movimiento, más adelante.
- **Qué enseña:** muestras de esos primitivos en claro y oscuro: escala tipográfica, paleta, regla de espacios y radios. Ningún componente.
- **Qué produce:** un preset en la URL. Una skill lo aplica: escribe los tokens en `experimental/` y sus fichas en estado exploración.
- **Con un producto que ya existe**, el Lab se abre con los primitivos de producción cargados y lo que se cambie pasa a ser una iniciativa. Nunca toca producción.
- «Nuevo», en la cabecera, llevará al Lab.

Decidido (ver «Lab de primitivos» en `DECISIONES.md`):
- Vive en cada sistema: `/<sistema>/lab`, en `ds dev` y en el sitio publicado.
- Un sistema nuevo usa los nombres de shadcn. Un producto que ya existe conserva los suyos.
- El preset lleva valores libres en la URL (`?preset=`).
- La skill `montar-sistema` lo aplica con `npx ds preset aplicar`.
- Un par por debajo de AA se avisa con el valor más cercano que llega, y solo se escribe si la persona lo acepta.

Tareas:
- [x] Propuesta y preguntas.
- [x] Lab, preset (`ds preset`) y skill que lo aplica.
- [ ] Movimiento (duraciones y curvas) en el Lab.
- [x] Publicar la 0.10.1 en npm: etiqueta `v0.10.1` en `main` y workflow «Publicar en npm».

### Fase 4 · Registry propio y Directorio

Que un agente lea el sistema pieza a pieza y que haya un índice de nuestros sistemas.

Acordado:
- **Registry de solo lectura:** un JSON por pieza (`/r/<pieza>.json`) y un índice. De shadcn se toma solo la forma: un campo `tipo` (fundamento, token, componente, bloque, gráfico o iniciativa), las dependencias internas como grafo (`usa`) y las categorías como dato. Dentro va lo nuestro: estado, sync, fuentes, reglas y antipatrones.
- **No es compatible con `npx shadcn add`**, a propósito: nada escribe en el repo de producción. Si algún día hace falta, que se abra un PR en producción en vez de escribir en él.
- **Directorio con solo nuestros sistemas:** una tarjeta por sistema con su descripción, su cobertura y el enlace a su registry. Sin registries de terceros, porque un agente podría meter en producción código que nadie ha revisado.

Decidido (ver «Registry por piezas» en `DECISIONES.md`):
- `registry.json` pasa a ser el índice y cada pieza va en `/<sistema>/r/<sección>/<slug>.json`.
- `usa` es una clave nueva y explícita de la ficha. Los `tokens` entran solos en el grafo. `relacionados` sigue siendo «ver también».
- `ds info` y `ds search` siguen leyendo las fichas, sin build. `ds search --json` devuelve piezas con la forma del índice y `ds ver <pieza>`, el JSON de una pieza.
- La lista del Directorio sale de un repo de directorio aparte: un `directorio.json` con las carpetas de los sistemas, que se sirven juntos. Así el kit no nombra ningún producto y no hace falta pedir nada por red.

- El directorio se crea con `ds init --directorio` y sirve todos sus sistemas en un sitio, con el Directorio en `/` y `/directorio.json` para agentes (ver «Directorio» en `DECISIONES.md`).

Tareas:
- [x] Propuesta y preguntas.
- [x] `/r/<pieza>.json` e índice en `ds build`, `ds search` con la misma forma y `ds ver`.
- [x] Directorio.

### Fase 5 · Metodología, plantilla y 1.0.0

Cerrar el rediseño con la documentación al día y una versión estable.

Por decidir: qué tiene que cumplirse para llamarla 1.0.0.

Tareas:
- [ ] Revisar `docs/metodologia/` entera con lo de las fases 1 a 4.
- [ ] Revisar la plantilla y las skills contra la metodología (regla 5 de `AGENTS.md`).
- [ ] Entradas en `DECISIONES.md` y `CHANGELOG.md`, con la migración.
- [ ] Publicar la 1.0.0 (ver «Publicar una versión» en `AGENTS.md`).

## Método y herramientas

- [ ] Sistema `base` con los tokens neutros del shell y herencia (`extiende`).
- [ ] `ds check` en el CI del repo de producción (cuando haya staging; ver «Entornos»).
- [ ] Evaluaciones de `design.md` con escenarios fijos (`evals/`).
- [ ] Ejemplos en vivo en cada modo: conmutador claro/oscuro en el marco del ejemplo, con el selector del informe (`tokens.<superficie>.modos`).
- [ ] Publicación: `ds build` + despliegue estático con `ds check` antes de cada despliegue.
- [x] Workflow en cada PR (`comprobar.yml`) con `npm ci`, typecheck, build y un `ds init` de prueba, con la misma versión de Node que «Publicar en npm». Así un `package-lock.json` desajustado se ve en el PR y no al publicar (pasó con la 0.10.0: npm 11.19.1 pedía dos dependencias de `@emnapi` que el lockfile no tenía).
- [x] `CHANGELOG.md` y etiquetas de versión (`vX.Y.Z`) para que los sistemas fijen versión.
