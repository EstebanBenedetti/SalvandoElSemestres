# FASE_5_COMPLETADA

## Resumen

Se completó la interfaz del módulo mínimo de NotaFlux, incluyendo la pantalla de estudiantes, historial, creación de estudiantes y el registro de cortes con vista previa del promedio en vivo.

## Evidencia

- Ruta de registro de corte disponible en `/notas/estudiantes/[id]/corte`.
- Componente `VistaPreviaPromedio` calculando el promedio con las funciones de `lib/reglas/nota.ts`.
- Formulario de corte con validación de rango 0.0 a 5.0 y resultado del corte en vivo.
- README actualizado con la descripción del proyecto, scripts y la fórmula del promedio.

## Verificación

- `npm.cmd test` debe ejecutarse sin fallas.
- `npm.cmd run build` debe ejecutarse sin errores.
