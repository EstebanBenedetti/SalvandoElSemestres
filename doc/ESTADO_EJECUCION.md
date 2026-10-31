# Estado de ejecución · NotaFlux

| Prompt | Estado | Build | Tests | Fecha de cierre |
|---|---|---|---|---|
| P00 Auditoría | completado | correcto | no ejecutados (no requeridos por P00) | 2026-10-31 |
| P01 Base de datos | completado | correcto | 20 unitarios + 7 casos de BD; 0 fallas de BD | 2026-10-31 |
| P02 Reglas de negocio | completado | correcto | 44 pasaron (24 reglas + 20 existentes) | 2026-10-31 |
| P03 Servidor | completado | correcto | 44 pasaron | 2026-10-31 |
| P04 Datos | completado | correcto | 44 pasaron; flujo BD 14 OK, 0 fallas | 2026-10-31 |
| P05 API | completado | correcto | 44 pasaron; validación API autenticada/no autenticada correcta | 2026-10-31 |
| P06 Interfaz: estudiantes e historial | completado | correcto | 44 pasaron; flujos principales verificados en navegador | 2026-10-31 |
| P07 Registro de corte y aceptación | pendiente | | | |
| P08 Opcional: máximo y mínimo del grupo | pendiente | | | |

## Bitácora

### P00 · Auditoría

- Archivos creados: `doc/ESTADO_ACTUAL.md`, `.github/copilot-instructions.md`, `doc/ESTADO_EJECUCION.md`, `doc/checkpoints/FASE_0_COMPLETADA.md`.
- Archivos modificados: ninguno. No se modificaron código, configuración ni dependencias.
- Comandos ejecutados:
  - `npm run build`: no inició porque la política de PowerShell bloqueó `npm.ps1`.
  - `npm.cmd run build`: correcto; Next.js compiló, completó TypeScript, generó páginas y finalizó la optimización de producción.
- Problemas y resolución: se usó `npm.cmd`, sin modificar la política de ejecución ni el proyecto.
- Pendientes/riesgos: confirmado en P01 que Supabase no tenía tablas NotaFlux en conflicto y que `POSTGRES_URL_NON_POOLING` está en Production/Preview de `salvandoelsemestres`. El workspace Vercel no está vinculado y existen dos proyectos candidatos. No cambiar aún la redirección por rol: `/notas` no existe hasta implementar la pantalla del módulo.

### P01 · Base de datos

- Archivos creados: `supabase/migrations/0001_notas_tablas.sql`, `supabase/migrations/0002_notas_vista_seguridad.sql`, `scripts/migrar.mjs`, `scripts/verificar-bd.mjs`.
- Archivos modificados: `package.json`, `package-lock.json`, `.env.example`, `doc/ESTADO_ACTUAL.md`, `doc/ESTADO_EJECUCION.md`.
- Dependencias instaladas: `pg` y `@types/pg`.
- Preflight remoto: no existían `estudiantes`, `cortes`, `v_ultimo_corte` ni `_migrations`; se verificó que el esquema del login (tablas, índices, funciones y trigger) ya estaba aplicado. No se leyeron registros de usuarios.
- Comandos y resultados:
  - `npm.cmd run db:migrar`: registró `usuarios.sql` y `restablecimientos_contrasena.sql` como históricas ya aplicadas, sin ejecutarlas; aplicó `0001_notas_tablas.sql` y `0002_notas_vista_seguridad.sql`.
  - `npm.cmd run db:migrar` (segunda ejecución): omitió ambas migraciones, confirmando idempotencia.
  - `npm.cmd run db:verificar`: **Total de fallas: 0**; las siete pruebas de integridad pasaron y la transacción terminó con `ROLLBACK`.
  - `npm.cmd run build`: correcto.
  - `npm.cmd test`: 6 archivos y 20 pruebas pasaron.
- Problemas y resolución: la URL de Postgres incluye `sslmode`; se elimina ese parámetro antes de crear el pool para que el SSL solicitado por el plan (`rejectUnauthorized: false`) aplique correctamente.
- Pendientes: alinear login con `/notas` solo cuando exista la ruta protegida; el workspace no está vinculado a Vercel y hay dos proyectos visibles, aunque `salvandoelsemestres` contiene las variables para Production y Preview.

### P02 · Reglas de negocio y pruebas unitarias

- Archivos creados: `src/lib/config/notas.ts`, `src/lib/reglas/errores.ts`, `src/lib/reglas/estudiante.ts`, `src/lib/reglas/nota.ts`, `tests/reglas/ayudas.ts`, `tests/reglas/nota.test.ts`, `tests/reglas/estudiante.test.ts`.
- Archivos modificados: `package.json`, `vitest.config.ts`, `doc/ESTADO_ACTUAL.md`, `doc/ESTADO_EJECUCION.md`.
- Dependencias: Vitest ya estaba instalado (`4.1.11`); no fue necesario instalar paquetes. Se agregó el script `test:ver`.
- Comandos y resultados:
  - `npm.cmd test`: 8 archivos y 44 pruebas pasaron (24 pruebas nuevas T-01 a T-24; 20 existentes).
  - `npm.cmd run build`: correcto; Next.js compiló, completó TypeScript, generó páginas y finalizó la optimización.
  - `git diff --check`: correcto.
- Problemas y resolución: el repositorio ya tenía pruebas React que necesitan jsdom, por lo que Vitest se configuró con un proyecto Node para `tests/**/*.test.ts` y otro jsdom para mantener intactas y ejecutables las pruebas existentes.
- Restricciones respetadas: no se modificaron `app/`, implementación del login ni archivos de base de datos.
- Pendientes: continuar con P03, que integra estas reglas en las capas de servidor.

### P03 · Infraestructura del servidor

- Archivos creados: `src/lib/db/conexion.ts`, `src/lib/auth/sesion.ts`, `src/proxy.ts`, `src/lib/http/respuestas.ts`, `src/lib/validacion/esquemas.ts`, `src/lib/formato.ts`, `src/app/api/notas/sesion/route.ts`.
- Archivos modificados: `src/app/page.tsx`, `src/components/auth/LoginForm.tsx`, `src/components/auth/LoginForm.test.tsx`, `doc/ESTADO_ACTUAL.md`, `doc/ESTADO_EJECUCION.md`.
- Comandos y resultados:
  - `npm.cmd run build`: correcto; Next.js reconoció `ƒ Proxy (Middleware)` y `/api/notas/sesion`.
  - `npm.cmd test`: 8 archivos y 44 pruebas pasaron.
  - `npm.cmd run type-check`: correcto.
  - GET `/api/notas/sesion` sin cookie: 401 con JSON `NO_AUTORIZADO` y `Cache-Control: no-store`.
  - GET `/notas` sin cookie: 307 a `/login?returnTo=%2Fnotas`.
  - Después de iniciar sesión, GET `/api/notas/sesion`: HTTP 200 con la sesión autenticada.
  - `git diff --check`: correcto.
- Cambios del login: el formulario y la raíz redirigen a `/notas`; la prueba existente verifica el nuevo destino. No se modificaron otros flujos de autenticación.
- La pantalla `/notas` devuelve 404 hasta que P06 implemente la interfaz; es el comportamiento temporal previsto por el prompt.

### P04 · Acceso a datos y casos de uso

- Archivos creados: `src/lib/datos/tipos.ts`, `src/lib/datos/errores.ts`, `src/lib/datos/estudiantes.ts`, `src/lib/datos/cortes.ts`, `src/lib/datos/grupo.ts`, `scripts/limpiar-prueba.mjs`, `scripts/probar-flujo.ts`, `scripts/cargar-demo.ts`.
- Archivos modificados: `src/lib/dataService.ts`, `package.json`, `package-lock.json`, `doc/ESTADO_ACTUAL.md`, `doc/ESTADO_EJECUCION.md`.
- Dependencias instaladas: `tsx` como dependencia de desarrollo y `server-only` como dependencia de ejecución. Los scripts TypeScript usan Node con la condición `react-server` para conservar el marcador de módulos exclusivos del servidor.
- `npm.cmd run probar:flujo`: **14 OK, 0 fallas**. Se validaron duplicados, entradas inválidas, promedios, historial, extremos y empate, exclusión de desactivados y `ON DELETE RESTRICT`. La limpieza final eliminó 5 cortes y 3 estudiantes de prueba.
- `npm.cmd run db:demo`: correcto. Cargó cinco estudiantes y siete cortes; promedios más recientes: Demo Ana 3.00 (Perdió), Demo Beto 5.00 (Aprobó), Demo Carla 3.25 (Perdió), Demo Diego 2.00 (Perdió) y Demo Elena 5.00 (Aprobó). Beto y Elena empatan en el máximo.
- Verificación adicional de `listarEstudiantes({ busqueda: "Demo" })`: cinco filas, cinco con último corte, máximo dos cortes por estudiante.
- `npm.cmd run type-check`: correcto.
- `npm.cmd test`: 8 archivos y 44 pruebas pasaron.
- `npm.cmd run build`: correcto; Next.js compiló, completó TypeScript y optimizó la aplicación.
- `lib/datos/` es la única capa que importa `lib/db/conexion.ts`; las rutas mantienen la fachada `dataService`.
- P05 completa y cierra la fase 4.

### P05 · API protegida

- Archivos creados: `src/app/api/notas/estudiantes/route.ts`, `src/app/api/notas/estudiantes/[id]/route.ts`, `src/app/api/notas/estudiantes/[id]/cortes/route.ts`, `src/app/api/notas/grupo/route.ts`.
- Archivos modificados: `src/lib/validacion/esquemas.ts`, `doc/ESTADO_ACTUAL.md`, `doc/ESTADO_EJECUCION.md`.
- Todos los handlers usan `conManejoDeErrores`, llaman `exigirSesion()` como primera operación, validan cuerpos/filtros y responden con `Cache-Control: no-store`; los POST válidos responden 201. Los IDs dinámicos se validan como UUID.
- Verificación sin sesión: GET de estudiantes y POST de cortes respondieron HTTP 401 `NO_AUTORIZADO`.
- Verificación autenticada en navegador:
  - GET `/api/notas/estudiantes`: HTTP 200; cinco estudiantes demo con total de cortes y promedio/resultado más reciente.
  - GET `/api/notas/estudiantes/737cd269-f375-45dc-bfcc-4fb0e8e72a98`: HTTP 200; detalle de Demo Ana y dos cortes en orden descendente.
  - POST al endpoint de cortes con `parcial1: 6`: HTTP 400, código `DATOS_INVALIDOS`; no se insertó ningún corte.
- `npm.cmd run type-check`: correcto.
- `npm.cmd run lint -- src/app/api/notas src/lib/validacion/esquemas.ts`: correcto.
- `npm.cmd test`: 8 archivos y 44 pruebas pasaron.
- `npm.cmd run build`: correcto; Next.js incluye las cinco rutas API NotaFlux.
- El 404 de `/notas` tras iniciar sesión es esperado hasta P06; no afecta las rutas API. Fase 4 cerrada.

### P06 · Interfaz base, estudiantes e historial

- Archivos creados:
  - UI compartida: `src/components/ui/{Aviso,Boton,Campo,EstadoVacio,Insignia,Modal,Tarjeta}.tsx`.
  - NotaFlux: `src/components/notas/{DesactivarEstudiante,FormularioEstudiante,InsigniaResultado,NavegacionNotas,TablaEstudiantes,TablaHistorial}.tsx`.
  - Rutas: `src/app/notas/layout.tsx`, `src/app/notas/page.tsx`, `src/app/notas/estudiantes/nuevo/page.tsx`, `src/app/notas/estudiantes/[id]/page.tsx`.
- Archivos modificados: `src/app/globals.css`, `doc/ESTADO_ACTUAL.md`, `doc/ESTADO_EJECUCION.md`.
- Tokens de color de NotaFlux añadidos a `@theme` de Tailwind 4 sin quitar estilos globales existentes.
- El layout valida sesión, muestra NotaFlux, correo del usuario y cierre de sesión; el menú móvil se abre y se cierra con su botón accesible.
- La lista muestra estudiantes, cortes, promedio/resultado y fecha; la búsqueda se aplica tras 300 ms y se refleja en la URL. El diseño muestra tarjetas bajo 640 px.
- El formulario cliente valida con `esquemaEstudiante`, crea el estudiante y navega al historial; un duplicado muestra `NOMBRE_DUPLICADO`.
- Historial con fechas y notas `es-CO`, estados vacío/activo/inactivo y desactivación mediante modal con Escape, foco y confirmación; tras actualizar se conserva el historial.
- Verificación en navegador autenticado: lista demo con cinco estudiantes; búsqueda `Demo Carla` filtró la lista y actualizó la URL; consulta sin resultados mostró el estado vacío; se creó `Prueba Interfaz P06`, el historial inició vacío, se confirmó el rechazo del duplicado y se probó la desactivación. El registro temporal se eliminó de forma específica, sin cortes asociados.
- Verificación responsive a 390 px: aparece el botón de menú móvil, se navega desde el menú y la tabla de escritorio se sustituye por tarjetas; a 1280 px se muestra la tabla.
- `npm.cmd run type-check`: correcto.
- `npm.cmd run lint -- src/app/notas src/components/notas src/components/ui/{componentes nuevos}`: correcto.
- `npm.cmd test`: 8 archivos y 44 pruebas pasaron.
- `npm.cmd run build`: correcto; Next.js incluye `/notas`, `/notas/estudiantes/nuevo` y `/notas/estudiantes/[id]`.
- P07 queda como el siguiente prompt para completar registro de cortes y aceptación.
