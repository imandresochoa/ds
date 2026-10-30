# Tareas del kit

Las tareas de cada sistema viven en su propio repo. Aquí solo lo que afecta al motor y al método.

## Hecho

- [x] Interfaz al estilo de Codex: barra de título, rail, barra de sección, pastillas, paleta ⌘K, menús y avisos.
- [x] Secciones: Inicio, Fundamentos, Tokens, Componentes (por función), Patrones, Iniciativas y Metodología (interna).
- [x] Estados por ficha y por plataforma; pestañas Web, iOS y Android cuando hay más de una.
- [x] Sync con producción: instantánea de CSS, tokens, huellas, clases inventadas, cobertura y cambios sin commit.
- [x] Capa para agentes: `llms.txt`, `design.md`, `registry.json`, `llms-full.txt` y `.md` por página.
- [x] Kit separado: CLI `ds`, contenido en repos externos, plantilla, `ds doctor`.
- [x] Modos (claro, oscuro…) y variables de `@theme` como tokens; cobertura por componentes en superficies Tailwind.
- [x] Ruta de publicación (`publicacion.ruta`, `DS_RUTA`): el sitio exportado se sirve bajo una carpeta de otro sitio.

## Interfaz

- [ ] Revisar contra Codex al lado y ajustar medidas finas (pesos, interlineados, iconos propios).
- [ ] Modo oscuro calibrado con capturas de Codex en oscuro.
- [ ] Barra lateral en móvil: superposición con cierre al tocar fuera.
- [ ] Índice de la página (los h2) en la barra de título.
- [x] Inicio con un solo sistema: redirige al sistema.
- [x] Portada animada con el mosaico de secciones; Inicio en `/<sistema>/inicio`.

## Método y herramientas

- [ ] Sistema `base` con los tokens neutros del shell y herencia (`extiende`).
- [ ] `ds check` en el CI del repo de producción (cuando haya staging; ver «Entornos»).
- [ ] Evaluaciones de `design.md` con escenarios fijos (`evals/`).
- [ ] Ejemplos en vivo en cada modo: conmutador claro/oscuro en el marco del ejemplo, con el selector del informe (`tokens.<superficie>.modos`).
- [ ] Publicación: `ds build` + despliegue estático con `ds check` antes de cada despliegue.
- [x] `CHANGELOG.md` y etiquetas de versión (`vX.Y.Z`) para que los sistemas fijen versión.
