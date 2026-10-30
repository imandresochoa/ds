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

## Siguientes fases

- [x] Skill de montaje con preguntas nativas (`ds instalar`, `montar-sistema`), `ds init` con parámetros, `ds info` y `ds search`.
- [ ] Lab de primitivos: colores con pares AA, estilos de texto, espaciado, radios y sombras; sale un preset.
- [ ] Registry propio de solo lectura (`/r/<pieza>.json`) y Directorio con solo nuestros sistemas.
- [x] Paquete preparado: `@imandresochoa/ds`, `files` en lista blanca y workflow manual con trusted publishing.
- [x] Repo público nuevo sin historial (`imandresochoa/ds`); el antiguo, privado, como `design-system-agentic-first-kit-legacy`.
- [x] Licencia MIT.
- [x] Versión 0.9.0 sin `"private": true`.
- [x] Primera publicación en npm: `@imandresochoa/ds@0.9.0`, a mano y con 2FA (2026-10-30).
- [x] Trusted publisher configurado con `npm trust` (`imandresochoa/ds`, `publicar.yml`). Las versiones siguientes salen con el workflow.
- [ ] En npmjs.com, «Publishing access» → «Require two-factor authentication and disallow tokens».

## Método y herramientas

- [ ] Sistema `base` con los tokens neutros del shell y herencia (`extiende`).
- [ ] `ds check` en el CI del repo de producción (cuando haya staging; ver «Entornos»).
- [ ] Evaluaciones de `design.md` con escenarios fijos (`evals/`).
- [ ] Ejemplos en vivo en cada modo: conmutador claro/oscuro en el marco del ejemplo, con el selector del informe (`tokens.<superficie>.modos`).
- [ ] Publicación: `ds build` + despliegue estático con `ds check` antes de cada despliegue.
- [x] `CHANGELOG.md` y etiquetas de versión (`vX.Y.Z`) para que los sistemas fijen versión.
