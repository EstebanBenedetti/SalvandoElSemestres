# NotaFlux · Instrucciones para Copilot

## Documentos rectores
- Plan técnico: `doc/PLAN_NOTAS.md`. Si una instrucción contradice el plan, prevalece el plan.
- Estado real del repositorio: `doc/ESTADO_ACTUAL.md`.
- Avance: `doc/ESTADO_EJECUCION.md`. Se actualiza al final de cada tarea.

## Stack
- Next.js App Router + TypeScript + Tailwind CSS. Despliegue en Vercel.
- Postgres de Supabase con el paquete `pg` y la variable `POSTGRES_URL_NON_POOLING`.
- Validación con Zod. Pruebas con Vitest.
- Login existente: JWT propio HS256 en la cookie `auth_token`, implementado en `src/lib/auth/local-auth.ts`, `src/app/api/auth/login/route.ts` y `src/lib/supabase/server.ts`. No se reescribe. Se usa como puerta única, sin roles.

## Convenciones
- Identificadores, comentarios, mensajes y textos de interfaz en español.
- El promedio y el resultado se calculan solo en `lib/reglas/nota.ts`, con céntimas enteras (nunca decimales de punto flotante). Ver sección 7 del plan.
- Los pesos (25/25/50) y el umbral (3.3) se leen de `lib/config/notas.ts`.
- Reglas de negocio solo en `lib/reglas/`: funciones puras, sin pg, sin variables de entorno y sin leer el reloj.
- Solo `lib/datos/` importa `lib/db/conexion.ts`. Rutas y páginas importan datos únicamente desde `lib/dataService.ts`.
- Toda ruta en `app/api/notas/` llama await `exigirSesion()` como primera instrucción.
- Entradas validadas con los esquemas de `lib/validacion/esquemas.ts`.
- Errores de negocio con `ErrorDeNegocio(codigo)`; respuestas con `lib/http/respuestas.ts`.
- Las notas y el promedio se presentan siempre con dos decimales.
- El nombre del estudiante se normaliza (recorte de espacios) antes de buscar o comparar.
- En rutas dinámicas params es una Promise: `const { id } = await params`.
- SQL siempre con parámetros (`$1`, `$2`). Nunca concatenar valores.
- Los cortes no se editan ni se eliminan. Un estudiante se desactiva en lugar de eliminarse si tiene cortes.
- No instalar librerías de componentes (shadcn, MUI u otras). Usar `components/ui/`.
- Prefijo de imports para lib: `@/lib`.
- Archivo de protección de rutas: `src/proxy.ts` (pendiente de crear). Ruta de login: `/login`.

## Al terminar cada tarea
1. `npm run build` sin errores.
2. `npm test` sin fallas (desde que exista Vitest).
3. Actualizar `doc/ESTADO_EJECUCION.md`.
4. No hacer commit: el estudiante revisa y hace el commit.
