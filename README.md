# NotaFlux

Sistema de registro y cálculo de notas estudiantiles para un módulo mínimo de gestión académica.

## Descripción

NotaFlux permite registrar estudiantes, consultar su historial, crear cortes con notas parciales y examen final, y obtener inmediatamente el promedio y el resultado asociado. La lógica de cálculo está centralizada en `src/lib/reglas/nota.ts` para evitar errores de redondeo y asegurar consistencia entre backend, frontend y validación.

## Funcionalidades

- Registro y listado de estudiantes.
- Historial de cortes por estudiante.
- Validación de notas entre 0.0 y 5.0.
- Cálculo del promedio ponderado con el examen final como peso doble.
- Resultado de aprobación con el umbral de 3.0 y comparación `>=`.
- Protección por sesión para las rutas del módulo.
- Revocación de sesiones vigentes cuando se cambia la contraseña, el rol o el estado de una cuenta.
- API REST protegida para consultar y registrar estudiantes y cortes.

## Requisitos

- Node.js 20+
- PostgreSQL de Supabase
- Archivo `.env.local` con las variables necesarias del proyecto
- Acceso a Vercel para despliegue

## Cómo correr en local

```bash
npm install
npm run db:migrar
npm run db:demo
npm run dev
```

Asegúrate de configurar `.env.local` con los nombres reales de las variables del proyecto y no versionar valores sensibles.

## Scripts

- `npm run dev`: inicia la aplicación en modo desarrollo.
- `npm run build`: compila la aplicación de producción.
- `npm run test`: ejecuta la suite de pruebas.
- `npm run test:e2e`: ejecuta E2E smoke de acceso, protección, teclado, móvil y tema.
- `npm run test:e2e:flujo`: ejecuta el flujo autenticado contra una base PostgreSQL aislada.
- `npm run db:migrar`: aplica migraciones de la base de datos.
- `npm run db:demo`: carga datos de ejemplo para ver el módulo.
- `npm run db:verificar`: valida la integridad de la base de datos.
- `npm run probar:flujo`: comprueba el flujo principal de negocio del módulo.

## Fórmula del promedio

El promedio se calcula con el mismo núcleo de reglas del proyecto:

$$
\text{promedio} = \frac{(P_1 \times 25) + (P_2 \times 25) + (EF \times 50)}{100}
$$

con redondeo final a centésimas enteras, usando la función de cálculo en `src/lib/reglas/nota.ts`.

## Regla de aprobación

Se aprueba cuando:

$$
\mathrm{promedio} \ge 3.0
$$

## Por qué se calcula con céntimas

El proyecto calcula con céntimas enteras y redondea el promedio ponderado a dos decimales antes de compararlo con 3.00. Así, la frontera de aprobación no depende de errores de punto flotante.

## Estructura de carpetas

- `src/app`: rutas y páginas del app router.
- `src/components`: componentes visuales reutilizables y del módulo NotaFlux.
- `src/lib`: reglas, validación, sesión, acceso a datos y utilidades.
- `supabase/migrations`: migraciones SQL del módulo.
- `scripts`: utilidades de migración, verificación y demo.
- `doc`: documentación del plan, prompts y checkpoints.

## Documentación

- [doc/PLAN_NOTAS.md](doc/PLAN_NOTAS.md)
- [doc/PROMPTS_NOTAS.md](doc/PROMPTS_NOTAS.md)
- [doc/ACEPTACION.md](doc/ACEPTACION.md)

## E2E autenticado

El flujo completo usa un usuario Supabase simulado solo para pruebas y una base PostgreSQL separada. Nunca apuntes `E2E_DATABASE_URL` a `.env.local`, staging compartido o producción; el nombre de la base debe incluir `e2e` o `test`.

En PowerShell, con PostgreSQL local vacío y aislado:

```powershell
$env:E2E_DATABASE_URL = "postgresql://postgres:postgres@127.0.0.1:5432/notaflux_e2e"
$env:POSTGRES_URL_NON_POOLING = $env:E2E_DATABASE_URL
node scripts/migrar.mjs
npm.cmd run test:e2e:flujo
```

CI crea un PostgreSQL efímero, aplica las migraciones y ejecuta el mismo flujo. La prueba elimina el estudiante y sus cortes al finalizar.

## Despliegue de la versión de sesiones

Antes de desplegar una versión que use `session_version`, aplica primero `npm run db:migrar` contra la base de datos de destino. La migración `0005_version_sesion_usuarios.sql` agrega la versión de sesión y su trigger. Al desplegar el código nuevo, los tokens emitidos antes de esta migración requerirán que los usuarios inicien sesión nuevamente.
