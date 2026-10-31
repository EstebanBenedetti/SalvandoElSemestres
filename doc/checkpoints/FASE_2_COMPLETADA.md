# Fase 2 completada · P02

## Reglas y configuración

- Pesos, límites y umbral centralizados en `src/lib/config/notas.ts`.
- Errores de negocio con códigos, mensajes y estados HTTP de la sección 9.2.
- Validación y normalización de estudiantes en `src/lib/reglas/estudiante.ts`.
- Validación de notas, cálculo ponderado con céntimas enteras y decisión de aprobación en `src/lib/reglas/nota.ts`.
- Las reglas son puras: no importan paquetes del servidor, no consultan variables de entorno ni leen el reloj.

## Salida resumida de `npm.cmd test`

```text
Test Files  8 passed (8)
Tests       44 passed (44)
Duration    3.43s
```

Las 24 pruebas nuevas cubren T-01 a T-24; las otras 20 corresponden a suites preexistentes conservadas en Vitest. No fue necesario instalar Vitest porque ya estaba disponible en el proyecto.

## Build

`npm.cmd run build`: correcto; compilación, TypeScript, generación de páginas y optimización de producción completaron sin errores.

## Compatibilidad del runner

`vitest.config.ts` ejecuta las reglas en Node y mantiene las pruebas existentes en jsdom para no alterar el entorno de la prueba de componentes React.
