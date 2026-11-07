# FASE_6_COMPLETADA

## Revisión y pruebas

Se revisaron los puntos críticos del módulo mínimo:

- cálculo del promedio centralizado en `src/lib/reglas/nota.ts`;
- peso del examen final y umbral de aprobación leídos desde `src/lib/config/notas.ts`;
- rutas protegidas con sesión antes de registrar cortes;
- ausencia de SQL concatenado en las consultas a la base de datos;
- textos en español y promedios mostrados con dos decimales.

## Evidencia

- Componente `VistaPreviaPromedio` usa las funciones del núcleo de reglas.
- El formulario de corte valida en cliente y en la API con `esquemaCorte`.
- Se ejecutan `npm.cmd test` y `npm.cmd run build` para la comprobación final.

## Resultado

La revisión quedó cerrada y lista para continuar con la funcionalidad opcional de máximo y mínimo del grupo en P08.
