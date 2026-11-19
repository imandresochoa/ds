---
titulo: Registrar las decisiones como ADR publicados
resumen: Las decisiones del kit y de cada sistema se escriben una por archivo, numeradas, con contexto, decisión, consecuencias y alternativas. En los sistemas se publican como una sección más.
estado: aceptada
fecha: 2026-11-19
decide: Andrés
---

## Contexto

- El kit lleva su porqué en `docs/DECISIONES.md`: 43 entradas fechadas en un solo archivo. No se publica en el sitio, así que un agente que lee un sistema no lo ve.
- Los sistemas no tenían sitio para decisiones. La plantilla trae `DESIGN.md` (el criterio), `INVENTARIO.md` y `RECOMENDACIONES.md`, pero no el porqué de sus tokens, sus nombres o sus superficies.
- `10-git-y-entornos.md` mencionaba los ADR en un párrafo, sin formato, sin estados y sin decir quién acepta.
- Los sistemas abiertos que lo resuelven usan el ADR de Nygard: Primer (`contributor-docs/adrs/`), Carbon (`docs/decisions/`), GOV.UK (decision records y propuestas en un repo aparte), Zendesk Garden y Twilio Paste. Spectrum y Fluent usan RFC para la fase previa. Ninguno las publica en la web del sistema. Polaris y Geist no tienen nada público.
- Vercel cuenta que trata las decisiones de producto aceptadas como código: en el repo, y los agentes revisan los cambios contra ellas.

## Decisión

1. **En cada sistema**, las decisiones son una sección del contenido: `content/decisiones/NNNN-slug.md`, con `estado` (propuesta, aceptada, sustituida o rechazada), `fecha`, `decide`, `afecta` y `sustituye`, y los apartados Contexto, Decisión, Consecuencias y Alternativas (el último, de Primer). Se publican como las demás fichas: página, `.md`, `llms.txt`, `design.md` y una pieza `decision` en el registry. Cada ficha enseña las decisiones que la afectan.
2. **En el kit**, en `docs/decisiones/` con el mismo formato. `docs/DECISIONES.md` queda como histórico hasta hoy: no se convierte.
3. **El agente propone; solo una persona acepta o rechaza**, con su nombre en `decide`. Un agente para y avisa si un cambio contradice una decisión aceptada.
4. **`ds check` comprueba** el número, el estado, la fecha, quién decide, que `afecta` y `sustituye` existan y que la cadena de sustituciones cuadre. Avisa de propuestas de más de 14 días y la rutina diaria las recoge.
5. **Las decisiones técnicas de un producto** (entornos, seguridad) siguen en su repo. Si una afecta al diseño, una decisión del sistema la enlaza en su contexto.

## Consecuencias

- El porqué se lee donde se lee el qué, por personas y agentes.
- Una sección nueva: un sistema sin decisiones la ve vacía, con el prompt para escribir la primera. La plantilla trae la `0001` en propuesta.
- Estados nuevos que no son del ciclo de producción: la interfaz y el registry los distinguen (`estadosDecision`).
- Versión menor: nada de lo que existe cambia de forma. `decisiones` es un campo nuevo en cada pieza.

## Alternativas

- **Convertir las 43 entradas del histórico**: coherente, pero la mayoría son ajustes pequeños que no son decisiones en este sentido.
- **`docs/adr/` sin publicar**, como hace la mayoría: un agente que lee el sitio no las vería, que es justo lo que se quiere evitar.
- **Seguir con un archivo por repo**: barato, pero no se enlaza desde las fichas ni se publica por piezas.
- **RFC como tipo aparte**: el estado «propuesta» y la discusión en el PR ya cumplen ese papel.
