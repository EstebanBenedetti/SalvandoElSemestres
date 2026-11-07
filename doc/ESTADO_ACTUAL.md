# Estado actual del repositorio · NotaFlux

Auditoría realizada el 2026-10-31 para P00. Los valores de las variables de entorno no se copian en este documento.

## 1. Versiones declaradas en `package.json`

| Paquete | Versión declarada |
|---|---|
| next | `16.4.5` (actualizado para corregir avisos críticos) |
| eslint-config-next | `16.4.5` |
| react | `19.2.8` |
| typescript | `^5` |
| tailwindcss | `^4` (instalada: `4.3.3`) |
| pg | `^8.23.1` (añadido en P01; no estaba instalado en P00) |
| zod | `^4.6.2` (instalada: `4.6.7`) |
| @supabase/supabase-js | `^2.117.2` |
| server-only | `^0.0.1` (añadido en P04) |
| tsx | `^4.23.15` (añadido en P04) |
| jose | No instalado |
| bcryptjs | `^3.0.3` |
| vitest | `^4.1.11` |
| vercel | `^65.12.1` (CLI de desarrollo) |

## 2. Scripts de `package.json`

| Script | Comando |
|---|---|
| `dev` | `node scripts/tokenVercel.mjs && next dev` |
| `build` | `next build` |
| `start` | `next start` |
| `lint` | `eslint` |
| `format` | `prettier --write "src/**/*.{ts,tsx,css}"` |
| `type-check` | `tsc --noEmit` |
| `test` | `vitest run` |
| `test:ver` | `vitest` (añadido en P02) |
| `test:watch` | `vitest` |
| `test:coverage` | `vitest run --coverage` |
| `db:migrar` | `node --env-file=.env.local scripts/migrar.mjs` (añadido en P01) |
| `db:verificar` | `node --env-file=.env.local scripts/verificar-bd.mjs` (añadido en P01) |
| `db:limpiar` | `node --env-file=.env.local scripts/limpiar-prueba.mjs` (añadido en P04; admite `--prueba` y `--demo`) |
| `probar:flujo` | `node --conditions=react-server --env-file=.env.local --import tsx scripts/probar-flujo.ts` (añadido en P04) |
| `db:demo` | `node --conditions=react-server --env-file=.env.local --import tsx scripts/cargar-demo.ts` (añadido en P04) |

Los dos scripts de base de datos se añadieron en P01.

## 3. Estructura existente hasta tres niveles

El proyecto usa `src/`. No existen directorios `app/`, `lib/` ni `components/` en la raíz: están dentro de `src/`.

```text
src/
├── app/
│   ├── (dashboard)/
│   │   ├── cuenta/contrasena/
│   │   ├── dashboard/
│   │   ├── login/
│   │   ├── status/
│   │   └── usuarios/
│   ├── api/
│   │   ├── admin/users/
│   │   ├── auth/{change-password,login,logout,me,recuperar,register,restablecer}/
│   │   ├── correo/prueba/
│   │   ├── data/[collection]/
│   │   ├── health/
│   │   └── notas/{estudiantes,grupo,sesion}/
│   ├── notas/
│   │   ├── estudiantes/[id]/
│   │   ├── estudiantes/nuevo/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── inicio/
│   ├── login/
│   ├── prueba-correo/
│   ├── recuperar-contrasena/
│   ├── restablecer-contrasena/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── auth/
│   ├── correo/
│   ├── home/
│   ├── layout/
│   ├── notas/
│   ├── theme/
│   ├── ui/{Aviso,Boton,Campo,EstadoVacio,Insignia,Modal,Tarjeta}.tsx
│   └── users/
├── hooks/
├── lib/
│   ├── auth/local-auth.ts
│   ├── auth/sesion.ts
│   ├── config/notas.ts
│   ├── datos/{cortes,errores,estudiantes,grupo,tipos}.ts
│   ├── db/conexion.ts
│   ├── formato.ts
│   ├── http/respuestas.ts
│   ├── reglas/{errores,estudiante,nota}.ts
│   ├── supabase/server.ts
│   ├── validacion/esquemas.ts
│   ├── __tests__/
│   ├── correo.ts
│   ├── dataService.ts
│   ├── json-db.ts
│   ├── plantillasCorreo.ts
│   ├── tokenRecuperacion.ts
│   ├── types.ts
│   ├── urlBase.ts
│   └── utils.ts
├── modules/
├── test/
└── proxy.ts

supabase/
├── restablecimientos_contrasena.sql
├── usuarios.sql
└── migrations/
    ├── 0001_notas_tablas.sql
    └── 0002_notas_vista_seguridad.sql

scripts/
├── cargar-demo.ts
├── limpiar-prueba.mjs
├── migrar.mjs
├── probar-flujo.ts
├── tokenVercel.mjs
└── verificar-bd.mjs

tests/
└── reglas/{ayudas,estudiante.test,nota.test}.ts
```

## 4. Alias de importación

En `tsconfig.json`:

- `@/*` → `./src/*` (por tanto, `@/lib/...` apunta a `src/lib/...`).
- `@data/*` → `./data/*`.

## 5. Autenticación

- Mecanismo: JWT propio firmado con HMAC-SHA256 (`HS256`), no Supabase Auth. La firma usa `SUPABASE_JWT_SECRET`; la gestión/verificación está en `src/lib/auth/local-auth.ts`.
- Usuarios: se consultan mediante el cliente administrativo de Supabase definido en `src/lib/supabase/server.ts`.
- Cookie: `auth_token`, `httpOnly`, `sameSite: "lax"`, ruta `/`, duración de 24 horas y `secure` en producción.
- Lector/verificador: `verifyToken(token)` en `src/lib/auth/local-auth.ts` devuelve `AuthTokenPayload` (`sub`, `email`, `rol`, `exp`) o `null`. El adaptador `src/lib/auth/sesion.ts` expone `obtenerSesion()` y `exigirSesion()`; comprueba el JWT, consulta al usuario y no considera sesión válida a una cuenta inactiva.
- Página de login: `/login`, en `src/app/(dashboard)/login/page.tsx`; el grupo `(dashboard)` no forma parte de la URL. La raíz `/` también presenta el formulario de login.
- Redirección posterior al login: `src/components/auth/LoginForm.tsx` lleva a todos los roles a `/notas`; `src/app/page.tsx` hace lo mismo cuando ya existe una sesión válida. P06 implementó la lista autenticada en `/notas`.
- Protección: `src/proxy.ts` protege `/notas/:path*` y `/api/notas/:path*`; sin JWT válido, las páginas redirigen a `/login` y la API devuelve 401. Cada handler debe verificar además la sesión con `exigirSesion()`.
- Cierre de sesión: `src/components/layout/AuthNav.tsx` hace `POST /api/auth/logout`; `src/app/api/auth/logout/route.ts` expira la cookie y el cliente navega a `/login`.

## 6. Acceso a datos

- Cliente existente: `src/lib/supabase/server.ts` crea y reutiliza un cliente administrativo de `@supabase/supabase-js` con `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY`.
- `pg` (`^8.23.1`) y `@types/pg` (`^8.23.1`) se añadieron en P01.
- `src/lib/db/conexion.ts` exporta un pool compartido, `consultar` y `conTransaccion`; configura parsers para fechas, timestamps, bigint y numeric, y usa `POSTGRES_URL_NON_POOLING`.
- `src/lib/dataService.ts` conserva las operaciones de recuperación de contraseña y ahora también es la fachada de datos de NotaFlux.
- `src/lib/datos/` concentra las consultas y casos de uso; solo esos módulos importan `src/lib/db/conexion.ts`.

## 7. Migraciones

- Antes de P01, `supabase/migrations/` no existía ni había tabla de control.
- Los únicos SQL existentes son `supabase/usuarios.sql` y `supabase/restablecimientos_contrasena.sql`. No hay un script que los aplique; los comentarios/instrucciones indican ejecutar el SQL en Supabase.
- En P01 se crearon `supabase/migrations/0001_notas_tablas.sql` y `0002_notas_vista_seguridad.sql`, aplicadas en Supabase; el runner crea y usa `_migrations`.
- Las SQL del login continúan siendo archivos históricos ejecutados manualmente desde Supabase SQL Editor; P01 verificó sus objetos y registró sus nombres en `_migrations` sin volver a ejecutarlas.

## 8. Variables de entorno

Solo nombres, sin valores.

`.env.local`:
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_SECRET_KEY`, `SUPABASE_JWT_SECRET`, `NEXT_PUBLIC_SALVANDOELSEMESTRESUPABASE_URL`, `NEXT_PUBLIC_SALVANDOELSEMESTRESUPABASE_ANON_KEY`, `NEXT_PUBLIC_SALVANDOELSEMESTRESUPABASE_PUBLISHABLE_KEY`, `POSTGRES_DATABASE`, `POSTGRES_HOST`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_PRISMA_URL`, `POSTGRES_URL`, `POSTGRES_URL_NON_POOLING`, `VERCEL_OIDC_TOKEN`.

`.env.example`:
`NODE_ENV`, `NEXT_PUBLIC_APP_NAME`, `NEXT_PUBLIC_APP_VERSION`, `DATA_DIR`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_JWT_SECRET`, `POSTGRES_URL_NON_POOLING` (añadida en P01 con valor de ejemplo, sin secretos).

Hay conexión de Postgres local configurada: `POSTGRES_URL_NON_POOLING` (puerto 5432, conexión directa/no pooling). También existe `POSTGRES_URL` (puerto 6543, pooler). P01 verificó que `POSTGRES_URL_NON_POOLING` está en Production y Preview del proyecto Vercel `salvandoelsemestres`; el otro proyecto visible, `salvando-el-semestres`, no tiene variables configuradas. El workspace no está vinculado localmente a un proyecto Vercel, por lo que se debe confirmar cuál URL de producción se considera canónica antes de futuros cambios remotos a Vercel.

## 9. Estilos

- Tailwind CSS `^4` (instalada `4.3.3`); `src/app/globals.css` importa `tailwindcss`.
- No se importa una fuente desde `next/font`; el CSS global declara `Georgia, "Times New Roman", serif`.
- Tokens globales: `--background` y `--foreground`, con valores distintos para el tema claro.
- No se encontró una dependencia de biblioteca de íconos en `package.json`.

## 10. Pruebas

Vitest (`vitest run`), con configuración en `vitest.config.ts`. Las 24 pruebas nuevas de reglas se ejecutan en Node desde `tests/reglas/`; las 20 pruebas preexistentes siguen ejecutándose desde `src/`, conservando jsdom para la prueba de componentes.

## 11. Conflictos y estado relacionado con el plan

- `src/app/notas/`: incluye el listado, registro de estudiante y su historial (P06); registro de corte se agrega en P07.
- `src/app/api/notas/`: dispone de sesión, estudiantes, detalle, cortes y grupo.
- `src/lib/dataService.ts`: conserva recuperación de contraseñas y reexporta los casos de uso y tipos de NotaFlux.
- `src/components/ui/`: existe, con componentes UI propios (Badge, Button, Card, Container, Input y Spinner).
- `src/app/page.tsx`: código propio de autenticación; no es la plantilla de Next.js.
- Antes de P01, los SQL versionados localmente no definían `estudiantes` ni `cortes`; solo definían `usuarios` y `restablecimientos_contrasena`.
- P01 consultó el catálogo remoto de Supabase antes de migrar: no encontró tablas NotaFlux previas; confirmó las tablas/índices/funciones del login. Luego creó las tablas y vista del plan, y la verificación confirmó sus columnas, restricciones e índices.

## 12. Decisiones derivadas para continuar el plan

- Ruta de login: `/login` (la ruta `/` también muestra el formulario).
- Protección: `src/proxy.ts` en Next.js 16 protege `/notas/:path*` y `/api/notas/:path*`; cada API además valida la sesión explícitamente.
- Migraciones: `supabase/migrations/` usa `0001_notas_tablas.sql` y `0002_notas_vista_seguridad.sql`; `scripts/migrar.mjs` aplica cada una en transacción y `_migrations` registra el estado.
- Variable para `lib/db/conexion.ts`: `POSTGRES_URL_NON_POOLING`, existente en `.env.local`, configurada para conexión directa y documentada en `.env.example`.
- Numeración inicial de las migraciones NotaFlux: `0001_notas_tablas.sql` y `0002_notas_vista_seguridad.sql`; no había numeración previa en `supabase/migrations/`.
- Prefijo de imports para `lib`: `@/lib` (`@/*` resuelve a `src/*`).
- Validación HTTP: `src/lib/validacion/esquemas.ts`; utilidades de respuesta: `src/lib/http/respuestas.ts`; formato colombiano de notas/fechas: `src/lib/formato.ts`.

## 13. Compilación de base

- Comando: `npm.cmd run build` (equivalente a `npm run build`, usando el shim `.cmd` de Windows porque PowerShell bloquea `npm.ps1`).
- Resultado: **correcto**. Next.js 16.3.5 compiló, completó TypeScript, generó las 23 páginas estáticas requeridas y finalizó la optimización de producción.
- Primer intento con `npm run build`: bloqueado por la política de ejecución de PowerShell al intentar cargar `npm.ps1`; no fue un error del proyecto. Se resolvió sin cambiar configuración usando `npm.cmd`.
- Después de P01, `npm.cmd run build` volvió a terminar correctamente con TypeScript y optimización de producción.

## 14. Verificación de P01

- `npm.cmd run db:migrar`: aplicó las dos migraciones; una segunda ejecución omitió ambas, confirmando idempotencia.
- `npm.cmd run db:verificar`: existencia de tablas/vista, restricciones, índice único, RLS y siete casos transaccionales verificados; total de fallas: 0. La prueba terminó en `ROLLBACK`.
- El cliente `pg` indicó que la URL incluye `sslmode`; los scripts quitan ese parámetro para respetar `ssl: { rejectUnauthorized: false }` especificado en el plan.
- P03 alineó la redirección de login con `/notas`, protegida por `src/proxy.ts`; la interfaz de esa ruta llegará en P06.

## 15. Reglas de negocio (P02)

- Configuración centralizada en `src/lib/config/notas.ts`.
- Reglas puras en `src/lib/reglas/`; no importan `pg` ni `next`, no acceden a `process.env` ni leen el reloj.
- `vitest.config.ts` separa las pruebas nuevas en Node de las pruebas preexistentes en jsdom.
- Pruebas: 24 nuevos casos T-01 a T-24; el conjunto completo ejecuta 44 pruebas contando las 20 preexistentes.

## 16. Infraestructura de servidor (P03)

- Implementados `src/lib/auth/sesion.ts`, `src/proxy.ts`, `src/lib/db/conexion.ts`, `src/lib/http/respuestas.ts`, `src/lib/validacion/esquemas.ts`, `src/lib/formato.ts` y `src/app/api/notas/sesion/route.ts`.
- `GET /api/notas/sesion` sin cookie devuelve 401 y la respuesta incluye `Cache-Control: no-store`; `/notas` redirige al login.
- Build, pruebas y type-check pasan.
- La comprobación manual autenticada de `GET /api/notas/sesion` respondió HTTP 200. `/notas` aún muestra 404 hasta que P06 implemente su interfaz.

## 17. Acceso a datos y API (P04–P05)

- Implementados listados, creación, consulta de historial y desactivación de estudiantes; registro y listado cronológico de cortes; y cálculo de todos los empates en los extremos del grupo.
- La fachada `src/lib/dataService.ts` reexporta casos de uso y tipos sin exponer SQL a las rutas.
- `scripts/probar-flujo.ts` valida 14 casos contra la base real y limpia datos de prueba/demo antes y después. `scripts/limpiar-prueba.mjs` elimina primero cortes y luego estudiantes según los prefijos seleccionados.
- `scripts/cargar-demo.ts` carga cinco estudiantes de demostración con siete cortes; Demo Beto y Demo Elena empatan en el máximo 5.00.
- `npm.cmd run probar:flujo`: 14 OK, 0 fallas. `npm.cmd run db:demo`: completado. La consulta de listado filtrada por “Demo” devolvió cinco estudiantes, todos con último corte; máximo dos cortes por estudiante.
- `npm.cmd run build`: correcto. `npm.cmd test`: 44 pruebas pasaron. `npm.cmd run type-check`: correcto.
- P05 añade `GET/POST /api/notas/estudiantes`, `GET/PATCH /api/notas/estudiantes/[id]`, `GET/POST /api/notas/estudiantes/[id]/cortes` y `GET /api/notas/grupo`. Todas requieren sesión, son dinámicas, validan los parámetros y usan respuestas `no-store`.
- Verificación HTTP sin cookie: `GET /api/notas/estudiantes` y `POST /api/notas/estudiantes/<uuid>/cortes` respondieron 401 `NO_AUTORIZADO`.
- Verificación autenticada en el navegador: lista demo 200 con cinco estudiantes y sus últimos promedios; detalle Demo Ana 200 con historial de dos cortes; POST de corte con nota 6.0 respondió 400 `DATOS_INVALIDOS`.
- P06 implementó la interfaz de lista e historial; P07 añadirá la pantalla para registrar cortes.

## 18. Interfaz de NotaFlux (P06)

- Implementados tokens Tailwind 4 y componentes accesibles compartidos en `src/components/ui/`.
- `src/components/notas/` contiene navegación responsive, insignias de resultado, listado/búsqueda, formulario de estudiante, tabla de historial y desactivación confirmada.
- `src/app/notas/` contiene layout con sesión obligatoria, lista, registro de estudiante e historial. La lista refleja el filtro `busqueda` en la URL con 300 ms de espera y adapta filas a tarjetas por debajo de 640 px.
- Las fechas se muestran en `es-CO` con zona `America/Bogota`; notas y promedios se muestran con dos decimales.
- Verificación en navegador autenticado: login redirige a la lista; aparecen los cinco estudiantes demo; búsqueda filtra y actualiza la URL; no-resultados muestra su estado vacío; registro de un estudiante y rechazo de duplicado funcionan; el historial vacío se presenta con enlace; se probó desactivar y confirmar.
- Verificación responsive a 390 px: menú móvil visible y operable, tarjetas de estudiantes visibles y tabla de escritorio oculta.
- El estudiante temporal `Prueba Interfaz P06` se eliminó por su ID exacto tras verificar que no tenía cortes.
- `npm.cmd run build`: correcto. `npm.cmd test`: 44 pruebas pasaron. Type-check y lint de archivos P06 correctos.

## 19. Profesionalización posterior (2026-11-07)

- CI (`.github/workflows/ci.yml`) ejecuta Playwright sobre Chromium después de lint, type-check, Vitest y build. `playwright.config.ts` inicia el build de producción en el puerto 3100.
- Las pruebas E2E cubren el error de acceso, redirección de rutas protegidas, acceso móvil sin overflow y navegación por teclado.
- `supabase/migrations/0003_cortes_autoria.sql` añade el autor de cada corte nuevo. `POST /api/notas/estudiantes/[id]/cortes` toma el correo exclusivamente de la sesión; el historial y los reportes muestran el autor. Los cortes existentes conservan autor nulo.
- La migración 0003 fue aplicada a la base configurada; `npm.cmd run db:verificar` confirmó la columna de autoría y terminó con cero fallas. El ensayo de restauración continúa pendiente de una base staging aislada.
- `/notas/reportes` ofrece el detalle de estudiantes/cortes, descarga CSV y una vista de impresión apta para guardar como PDF. `GET /api/notas/exportar` exige sesión y neutraliza celdas que podrían ejecutarse como fórmulas.
- El historial del estudiante incorpora una visualización accesible de la tendencia cronológica entre cortes.
- `doc/OPERACION_RECUPERACION.md` contiene instrucciones de backup y restauración en staging. No se ha ejecutado una restauración real porque no se dispone de una base staging identificada.
- Validación local: 56 pruebas Vitest, 4 escenarios Playwright, type-check, lint y build correctos.

## 20. Regla de aprobación actualizada (2026-11-07)

- Umbral vigente: promedio redondeado a dos decimales mayor o igual a 3.00 aprueba; por debajo reprueba. El rango de notas por evaluación continúa en 0.00–5.00.
- La regla central está en `src/lib/config/notas.ts`; `PanelGrupo`, la vista previa, las APIs y los reportes usan el mismo resultado calculado.
- `supabase/migrations/0004_umbral_aprobacion_3_0.sql` fue aplicada a la base configurada; reclasificó resultados guardados según el umbral nuevo sin cambiar las notas ni los promedios.
- Pruebas añadidas para 3.00, 2.99, 2.90 y 3.25.
