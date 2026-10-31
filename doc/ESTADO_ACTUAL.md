# Estado actual del repositorio · NotaFlux

Auditoría realizada el 2026-10-31 para P00. Los valores de las variables de entorno no se copian en este documento.

## 1. Versiones declaradas en `package.json`

| Paquete | Versión declarada |
|---|---|
| next | `16.3.5` |
| react | `19.2.8` |
| typescript | `^5` |
| tailwindcss | `^4` (instalada: `4.3.3`) |
| pg | `^8.23.1` (añadido en P01; no estaba instalado en P00) |
| zod | `^4.6.2` |
| @supabase/supabase-js | `^2.117.2` |
| jose | No instalado |
| bcryptjs | `^3.0.3` |
| vitest | `^4.1.11` |

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
│   │   └── notas/sesion/
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
│   ├── theme/
│   ├── ui/
│   └── users/
├── hooks/
├── lib/
│   ├── auth/local-auth.ts
│   ├── auth/sesion.ts
│   ├── config/notas.ts
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
├── migrar.mjs
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
- Redirección posterior al login: `src/components/auth/LoginForm.tsx` lleva a todos los roles a `/notas`; `src/app/page.tsx` hace lo mismo cuando ya existe una sesión válida. La página `/notas` se creará en P06.
- Protección: `src/proxy.ts` protege `/notas/:path*` y `/api/notas/:path*`; sin JWT válido, las páginas redirigen a `/login` y la API devuelve 401. Cada handler debe verificar además la sesión con `exigirSesion()`.
- Cierre de sesión: `src/components/layout/AuthNav.tsx` hace `POST /api/auth/logout`; `src/app/api/auth/logout/route.ts` expira la cookie y el cliente navega a `/login`.

## 6. Acceso a datos

- Cliente existente: `src/lib/supabase/server.ts` crea y reutiliza un cliente administrativo de `@supabase/supabase-js` con `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY`.
- `pg` (`^8.23.1`) y `@types/pg` (`^8.23.1`) se añadieron en P01.
- `src/lib/db/conexion.ts` exporta un pool compartido, `consultar` y `conTransaccion`; configura parsers para fechas, timestamps, bigint y numeric, y usa `POSTGRES_URL_NON_POOLING`.
- `src/lib/dataService.ts` sí existe, pero implementa operaciones de recuperación de contraseña mediante Supabase; no es aún la fachada de datos de notas.

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

- `src/app/notas/`: no existe.
- `src/app/api/notas/`: no existe.
- `src/lib/dataService.ts`: existe, pero solo cubre la funcionalidad existente de recuperación de contraseñas; debe ampliarse con cautela.
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
- La redirección de login existente aún apunta a `/usuarios` o `/dashboard`. No se cambió en P01: la ruta `/notas` todavía no existe y cambiarla ahora dejaría el login enviando a los usuarios a una página 404. La integración debe realizarse cuando la ruta del módulo esté implementada y protegida.

## 15. Reglas de negocio (P02)

- Configuración centralizada en `src/lib/config/notas.ts`.
- Reglas puras en `src/lib/reglas/`; no importan `pg` ni `next`, no acceden a `process.env` ni leen el reloj.
- `vitest.config.ts` separa las pruebas nuevas en Node de las pruebas preexistentes en jsdom.
- Pruebas: 24 nuevos casos T-01 a T-24; el conjunto completo ejecuta 44 pruebas contando las 20 preexistentes.

## 16. Infraestructura de servidor (P03)

- Implementados `src/lib/auth/sesion.ts`, `src/proxy.ts`, `src/lib/db/conexion.ts`, `src/lib/http/respuestas.ts`, `src/lib/validacion/esquemas.ts`, `src/lib/formato.ts` y `src/app/api/notas/sesion/route.ts`.
- `GET /api/notas/sesion` sin cookie devuelve 401 y la respuesta incluye `Cache-Control: no-store`; `/notas` redirige al login.
- Build, pruebas y type-check pasan.
- Pendiente la comprobación manual autenticada de `GET /api/notas/sesion` (HTTP 200); esperar confirmación del usuario antes de cerrar P03.
