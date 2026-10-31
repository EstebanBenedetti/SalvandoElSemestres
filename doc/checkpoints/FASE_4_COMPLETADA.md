# Fase 4 completada · Datos y API NotaFlux

Fecha de cierre: 2026-10-31

## Alcance

Se completaron P04 (acceso a datos y casos de uso) y P05 (API protegida).

## P04 · Datos

- Implementados tipos, consultas y casos de uso para estudiantes, cortes e integración del grupo en `src/lib/datos/`.
- `src/lib/dataService.ts` es la fachada pública de las operaciones.
- `scripts/probar-flujo.ts` comprobó 14 casos contra la base real: **14 OK, 0 fallas**. Se validaron nombres duplicados, notas y promedios, historial, extremos, empate, desactivación y `ON DELETE RESTRICT`.
- Se limpiaron todos los registros `Prueba` al terminar la prueba.
- `scripts/cargar-demo.ts` creó cinco estudiantes y siete cortes. Los últimos promedios son: Ana 3.00, Beto 5.00, Carla 3.25, Diego 2.00 y Elena 5.00; Beto y Elena empatan en el máximo. Estos datos demo permanecen en la base.

## P05 · API

Rutas creadas:

- `GET/POST /api/notas/estudiantes`
- `GET/PATCH /api/notas/estudiantes/[id]`
- `GET/POST /api/notas/estudiantes/[id]/cortes`
- `GET /api/notas/grupo`

Todos los handlers exigen sesión, validan filtros, UUID y cuerpos, usan el sobre de respuesta común y deshabilitan caché. Los POST devuelven 201 cuando tienen éxito.

Verificaciones:

- Sin sesión, GET de estudiantes y POST de cortes devolvieron HTTP 401 `NO_AUTORIZADO`.
- Con sesión, GET de estudiantes devolvió HTTP 200 y los cinco registros demo con sus últimos promedios.
- Con sesión, GET del detalle de Demo Ana devolvió HTTP 200 con dos cortes ordenados del más reciente al más antiguo.
- Con sesión, POST de corte con `parcial1: 6` devolvió HTTP 400 `DATOS_INVALIDOS`; no se creó un corte inválido.
- `npm.cmd run type-check`: correcto.
- `npm.cmd run lint -- src/app/api/notas src/lib/validacion/esquemas.ts`: correcto.
- `npm.cmd test`: 44 pruebas pasaron.
- `npm.cmd run build`: correcto; compiló las rutas API.

## Nota de navegación

Después del login, la redirección va a `/notas`, pero la interfaz todavía no existe y mostrará 404 hasta P06. Las rutas `/api/notas/*` sí están implementadas y verificadas.

## Archivos principales

- `src/lib/datos/`
- `src/lib/dataService.ts`
- `src/app/api/notas/estudiantes/`
- `src/app/api/notas/grupo/`
- `src/lib/validacion/esquemas.ts`
- `scripts/probar-flujo.ts`
- `scripts/cargar-demo.ts`
- `scripts/limpiar-prueba.mjs`
