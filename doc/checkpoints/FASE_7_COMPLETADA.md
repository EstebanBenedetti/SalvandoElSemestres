# FASE_7_COMPLETADA

## Resumen

Se completó la funcionalidad opcional del grupo: el panel de máximo y mínimo del curso muestra el último promedio de cada estudiante activo y resalta el mayor y el menor según la regla del proyecto.

## Evidencia

- Ruta creada: `/notas/grupo`.
- Navegación actualizada con acceso directo desde la cabecera del módulo.
- Componente `PanelGrupo` mostrando máximo, mínimo y total del grupo.

## Verificación

- `npm.cmd test -- --run src/components/notas/PanelGrupo.test.tsx` pasó.
- `npm.cmd run build` pasó con éxito.
