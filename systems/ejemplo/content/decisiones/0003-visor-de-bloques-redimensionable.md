---
titulo: Visor de bloques redimensionable
resumen: El visor de un bloque se redimensiona arrastrando su borde, además de con los anchos fijos de escritorio, tablet y móvil.
estado: propuesta
fecha: 2026-11-19
afecta: [iniciativas/visor-redimensionable]
---

## Contexto

Con tres anchos fijos no se ve cómo se comporta un bloque entre ellos, que es donde suelen romperse las rejillas.

## Decisión

Propuesta: el visor tiene un asa en el borde derecho que cambia el ancho arrastrando, y los tres anchos fijos siguen como atajos.

## Consecuencias

- Hay que mantener el ancho elegido al cambiar de ejemplo.
- En móvil el asa no tiene sentido: el visor ocupa todo el ancho.

## Alternativas

- **Solo anchos fijos**, como ahora.
- **Un campo numérico de ancho**: preciso, pero lento de usar.
