# Fase 0 completada · P00

## Resultado de compilación

`npm.cmd run build`: **correcto** con Next.js 16.3.5. Compilación, TypeScript, generación de páginas y optimización de producción finalizaron sin errores. El primer intento con `npm run build` fue bloqueado por la política de ejecución de PowerShell (`npm.ps1`); el comando equivalente `npm.cmd` resolvió el problema sin cambios de configuración.

## Conexión a Postgres

Existe en `.env.local` la variable `POSTGRES_URL_NON_POOLING`, configurada para conexión directa (puerto 5432). También existe `POSTGRES_URL` para pooler (puerto 6543). Se decidió usar `POSTGRES_URL_NON_POOLING` para `lib/db/conexion.ts`. No se copiaron valores. La presencia de la variable en Vercel no se verificó, y `.env.example` todavía no la documenta.

## Mecanismo de login

JWT propio HS256 en cookie `auth_token`, con firma basada en `SUPABASE_JWT_SECRET`; código en `src/lib/auth/local-auth.ts`. Los usuarios se consultan mediante `src/lib/supabase/server.ts`. La página `/login` está en `src/app/(dashboard)/login/page.tsx`, y la raíz `/` también muestra el formulario. Actualmente el login redirige por rol a `/usuarios` o `/dashboard`; el plan NotaFlux requiere alinear la entrada del módulo en P03. No existe middleware ni proxy.

## Decisiones derivadas

- Protección global a implementar en `src/proxy.ts` (Next.js 16), sin sustituir las verificaciones de sesión exigidas en API.
- Ruta de login: `/login`.
- Prefijo para `lib`: `@/lib` (`@/*` → `src/*`).
- Conexión para `lib/db/conexion.ts`: `POSTGRES_URL_NON_POOLING`.
- No hay runner ni carpeta de migraciones. M1 y M2 iniciarán en `0001_notas_tablas.sql` y `0002_notas_vista_seguridad.sql`.
- P01 confirmó antes de migrar que en Supabase no existían previamente `estudiantes`, `cortes` ni `v_ultimo_corte`; las dos migraciones se aplicaron y verificaron.
- P01 verificó `POSTGRES_URL_NON_POOLING` en Production y Preview del proyecto Vercel `salvandoelsemestres`. Hay otro proyecto candidato sin variables y el workspace no está vinculado; confirmar el proyecto canónico antes de cambios adicionales en Vercel.
