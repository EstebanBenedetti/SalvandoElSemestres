# NotaFlux · Prompts para GitHub Copilot

> Plan de referencia: `doc/PLAN_NOTAS.md`
> Herramienta: GitHub Copilot Chat en modo Agente (VS Code)
> Punto de partida: proyecto desplegado en Vercel, Supabase conectado y login funcionando

---

## Cómo ejecutar estos prompts

1. Crear la carpeta `doc/` en la raíz del repositorio (si no existe) y copiar allí `PLAN_NOTAS.md` y `PROMPTS_NOTAS.md`.
2. Abrir el proyecto en VS Code y abrir Copilot Chat. En el selector de modo elegir **Agent**. En el selector de modelo elegir el más capaz disponible.
3. Cada prompt se ejecuta en una **conversación nueva** (botón `+` del chat).
4. Copiar el bloque gris completo del prompt, pegarlo en el chat y enviarlo. No hay datos que reemplazar.
5. Cuando Copilot pida permiso para ejecutar un comando en la terminal, leerlo y aceptarlo.
6. Al terminar cada prompt: revisar los cambios y aceptarlos (**Keep**); hacer la verificación indicada; hacer commit con el mensaje sugerido y `git push`. Vercel desplegará; si falla, usar el prompt de despliegue fallido antes de continuar.
7. No saltar prompts. Si algo falla, usar el prompt de corrección del final.

| Fase | Prompts |
|---|---|
| 0 · Preparación | P00 |
| 1 · Base de datos | P01 |
| 2 · Reglas de negocio | P02 |
| 3 · Servidor | P03 |
| 4 · Datos y API | P04, P05 |
| 5 · Interfaz | P06, P07 |
| 7 · Opcional | P08 |

---

## P00 · Auditoría del repositorio y archivos de control

**Fase:** 0 · **Modifica código:** no · **Crea:** `doc/ESTADO_ACTUAL.md`, `.github/copilot-instructions.md`, `doc/ESTADO_EJECUCION.md`, `doc/checkpoints/FASE_0_COMPLETADA.md`

````text
Actúa como ingeniero de software senior trabajando en modo agente sobre este repositorio Next.js.

Contexto: el proyecto "NotaFlux" (sistema de registro y cálculo de notas estudiantiles) ya está desplegado en Vercel, conectado a Supabase y tiene login funcionando. El plan técnico está en doc/PLAN_NOTAS.md. Este prompt NO implementa funcionalidades: audita el repositorio y crea los archivos de control.

Lee completo doc/PLAN_NOTAS.md, en especial las secciones 0, 1, 3, 8 y 15.

TAREA 1. Crea doc/ESTADO_ACTUAL.md con estas secciones, llenas con lo que encuentres. No supongas: si algo no existe, escribe "No existe".
1. Versiones (package.json): next, react, typescript, tailwindcss, pg, zod, @supabase/supabase-js, jose, bcryptjs, vitest.
2. Scripts de package.json.
3. Estructura: árbol de app/, lib/, components/, supabase/ y scripts/ hasta 3 niveles. Indica si usa carpeta src/.
4. Alias de importación en tsconfig.json.
5. Autenticación: archivos; mecanismo (JWT propio en cookie, Supabase Auth u otro); nombre de la cookie; función que lee la sesión y qué devuelve; ruta de la página de login; ruta a la que redirige después del login (archivo y línea); archivo de middleware o proxy y su matcher; cómo se cierra sesión.
6. Acceso a datos: clientes de Supabase existentes (archivos), uso del paquete pg, archivo de pool si existe.
7. Migraciones: carpeta, archivos existentes y su numeración, tabla de control, script o página que las aplica.
8. Variables de entorno: solo los NOMBRES presentes en .env.local y .env.example (NUNCA copies valores). Indica si existe una cadena de conexión directa a Postgres (DATABASE_URL, POSTGRES_URL o similar) y con qué nombre; es la que usará lib/db/conexion.ts.
9. Estilos: versión de Tailwind, ubicación de globals.css, fuentes, tokens de color existentes, librería de íconos.
10. Pruebas: framework existente.
11. Conflictos con el plan: existencia previa de app/notas, app/api/notas, lib/dataService.ts y components/ui; contenido de app/page.tsx (plantilla de Next.js o propio); tablas existentes llamadas estudiantes o cortes y, si existen, sus columnas.
12. Decisiones derivadas:
    - Ruta de la página de login.
    - Archivo de protección de rutas (proxy.ts en Next.js 16, middleware.ts antes) y si ya existe.
    - Mecanismo de migraciones a usar.
    - Nombre de la variable de conexión a Postgres que usará conexion.ts.
    - Nombres exactos que tendrán M1 y M2 continuando la numeración existente.
    - Prefijo de imports para lib (por ejemplo @/lib o @/src/lib).
13. Compilación de base: resultado de npm run build (TAREA 4).

TAREA 2. Crea .github/copilot-instructions.md reemplazando [AJUSTAR] con lo hallado:

```markdown
# NotaFlux · Instrucciones para Copilot

## Documentos rectores
- Plan técnico: doc/PLAN_NOTAS.md. Si una instrucción contradice el plan, prevalece el plan.
- Estado real del repositorio: doc/ESTADO_ACTUAL.md.
- Avance: doc/ESTADO_EJECUCION.md. Se actualiza al final de cada tarea.

## Stack
- Next.js App Router + TypeScript + Tailwind CSS. Despliegue en Vercel.
- Postgres de Supabase con el paquete pg y la variable [AJUSTAR: nombre de la variable de conexión].
- Validación con Zod. Pruebas con Vitest.
- Login existente: [AJUSTAR: mecanismo y archivos]. No se reescribe. Se usa como puerta única, sin roles.

## Convenciones
- Identificadores, comentarios, mensajes y textos de interfaz en español.
- El promedio y el resultado se calculan solo en lib/reglas/nota.ts, con céntimas enteras (nunca decimales de punto flotante). Ver sección 7 del plan.
- Los pesos (25/25/50) y el umbral (3.3) se leen de lib/config/notas.ts.
- Reglas de negocio solo en lib/reglas/: funciones puras, sin pg, sin variables de entorno y sin leer el reloj.
- Solo lib/datos/ importa lib/db/conexion.ts. Rutas y páginas importan datos únicamente desde lib/dataService.ts.
- Toda ruta en app/api/notas/ llama await exigirSesion() como primera instrucción.
- Entradas validadas con los esquemas de lib/validacion/esquemas.ts.
- Errores de negocio con ErrorDeNegocio(codigo); respuestas con lib/http/respuestas.ts.
- Las notas y el promedio se presentan siempre con dos decimales.
- El nombre del estudiante se normaliza (recorte de espacios) antes de buscar o comparar.
- En rutas dinámicas params es una Promise: const { id } = await params.
- SQL siempre con parámetros ($1, $2). Nunca concatenar valores.
- Los cortes no se editan ni se eliminan. Un estudiante se desactiva en lugar de eliminarse si tiene cortes.
- No instalar librerías de componentes (shadcn, MUI u otras). Usar components/ui/.
- Prefijo de imports para lib: [AJUSTAR].
- Archivo de protección de rutas: [AJUSTAR]. Ruta de login: [AJUSTAR].

## Al terminar cada tarea
1. npm run build sin errores.
2. npm test sin fallas (desde que exista Vitest).
3. Actualizar doc/ESTADO_EJECUCION.md.
4. No hacer commit: el estudiante revisa y hace el commit.
```

TAREA 3. Crea doc/ESTADO_EJECUCION.md:

```markdown
# Estado de ejecución · NotaFlux

| Prompt | Estado | Build | Tests | Fecha de cierre |
|---|---|---|---|---|
| P00 Auditoría | pendiente | | | |
| P01 Base de datos | pendiente | | | |
| P02 Reglas de negocio | pendiente | | | |
| P03 Servidor | pendiente | | | |
| P04 Datos | pendiente | | | |
| P05 API | pendiente | | | |
| P06 Interfaz: estudiantes e historial | pendiente | | | |
| P07 Registro de corte y aceptación | pendiente | | | |
| P08 Opcional: máximo y mínimo del grupo | pendiente | | | |

## Bitácora

Cada prompt agrega una sección con: archivos creados, archivos modificados, comandos ejecutados y su resultado, problemas y cómo se resolvieron, pendientes.
```

TAREA 4. Si no existe node_modules, ejecuta npm install. Luego npm run build y registra el resultado en la sección 13 de ESTADO_ACTUAL.md. Si falla, NO corrijas: describe el error.

TAREA 5. Si la variable de conexión directa a Postgres no existe en .env.local, explícame cómo obtenerla en Supabase (Connect, Transaction pooler, puerto 6543, reemplazar la contraseña) y agregarla a .env.local y a Vercel. No continuar con P01 sin ella.

RESTRICCIONES: no modifiques código, configuración ni dependencias. Solo crea los archivos de este prompt.

AL TERMINAR:
- Crea doc/checkpoints/FASE_0_COMPLETADA.md con: resultado de la compilación, existencia de la variable de conexión, mecanismo de login, decisiones derivadas.
- Marca P00 en ESTADO_EJECUCION.md y agrega su sección en la bitácora.
- Muéstrame un resumen y los riesgos para los siguientes prompts.
````

**Verificación del estudiante:** abrir `doc/ESTADO_ACTUAL.md` y confirmar que la sección 5 describe el login real y que la 8 identifica la variable de conexión a Postgres.

**Commit sugerido:** `docs: auditoría del repositorio y archivos de control para Copilot`

---

## P01 · Base de datos del módulo

**Fase:** 1 · **Crea:** dos migraciones, `scripts/verificar-bd.mjs` y, si hace falta, `scripts/migrar.mjs`

````text
Antes de escribir código lee completos: doc/PLAN_NOTAS.md (secciones 6 y 13), doc/ESTADO_ACTUAL.md y doc/ESTADO_EJECUCION.md.

OBJETIVO: crear y aplicar las dos migraciones y dejar un script que demuestre que la base de datos protege las reglas.

TAREA 1. Si ESTADO_ACTUAL.md reporta tablas previas llamadas estudiantes o cortes que NO correspondan a este plan, detente y avísame. Si no hay conflicto, crea en supabase/migrations/ dos archivos con los nombres de la sección 12 de ESTADO_ACTUAL.md:
- Migración M1 (tablas) con el SQL exacto de la sección 6.2 del plan.
- Migración M2 (vista y seguridad) con el SQL exacto de la sección 6.3.
No cambies nombres de tablas, columnas ni restricciones: el código posterior depende de ellos (sección 6.4).

TAREA 2. Aplica las migraciones:
- Si ESTADO_ACTUAL.md indica un mecanismo existente, úsalo y explícalo.
- Si no:
  a) Instala pg y @types/pg si faltan.
  b) Crea scripts/migrar.mjs que lea la variable de conexión indicada; se conecte con ssl { rejectUnauthorized: false }; cree _migrations (id serial primary key, archivo text unique not null, aplicada_en timestamptz default now()) si no existe; recorra supabase/migrations/*.sql en orden alfabético; aplique en una transacción cada archivo no registrado y lo registre; imprima "aplicada" u "omitida"; termine con código 1 si algo falla.
  c) Si hay migraciones anteriores del login ya aplicadas, regístralas en _migrations sin ejecutarlas y explícalo.
  d) Agrega "db:migrar": "node --env-file=.env.local scripts/migrar.mjs" y ejecútalo. Usa el nombre real de la variable de conexión.

TAREA 3. Crea scripts/verificar-bd.mjs y "db:verificar". Debe imprimir:
1. Existencia (sí/no) de estudiantes, cortes y de la vista v_ultimo_corte.
2. Número de filas de cada tabla.
3. Restricciones de cortes y estudiantes (pg_constraint) y el índice único ux_estudiantes_nombre (pg_indexes).
4. Si RLS está activo en las dos tablas (pg_class.relrowsecurity).
5. Pruebas de integridad en UNA transacción que SIEMPRE termina en ROLLBACK, con SAVEPOINT antes de cada caso que debe fallar:
   a) Insertar estudiante "Verif Ana": funciona.
   b) Insertar "verif ana" (minúscula): debe fallar con 23505 (ux_estudiantes_nombre, RN-02).
   c) Insertar estudiante con nombre " " (un espacio): debe fallar con 23514 (RN-01).
   d) Insertar un corte de "Verif Ana" con parcial1 = 6: debe fallar con 23514 (RN-03).
   e) Insertar un corte con examen_final = -1: debe fallar con 23514.
   f) Insertar un corte con resultado 'Pendiente': debe fallar con 23514.
   g) Insertar un corte válido (3.30, 3.30, 3.30, promedio 3.30, 'Aprobó'); luego insertar un segundo corte válido del mismo estudiante (2.00, 3.00, 4.00, 3.25, 'Perdió'); consultar v_ultimo_corte y comprobar que devuelve el segundo (el más reciente), no el primero.
   Imprime "OK" o "FALLA" por caso.
6. Total de fallas; termina con código 1 si hubo alguna.

Ejecuta npm run db:verificar y copia la salida en la bitácora.

RESTRICCIONES: no modifiques archivos del login ni de app/. No crees tablas distintas a las del plan.

AL TERMINAR:
- npm run build sin errores.
- Crea doc/checkpoints/FASE_1_COMPLETADA.md con la salida de npm run db:verificar.
- Marca P01 en ESTADO_EJECUCION.md y agrega su sección en la bitácora.
- Muéstrame un resumen.
````

**Verificación del estudiante:** en Supabase, Table Editor, deben aparecer `estudiantes` y `cortes`. La salida de `npm run db:verificar` no debe tener líneas con FALLA, y el caso g debe confirmar que la vista devuelve el corte más reciente.

**Commit sugerido:** `feat(bd): tablas, vista del último corte y restricciones de notas`

---

## P02 · Reglas de negocio y pruebas unitarias

**Fase:** 2 · **Crea:** `lib/config/notas.ts`, `lib/reglas/*`, `tests/reglas/*`, `vitest.config.ts`

````text
Antes de escribir código lee completos: doc/PLAN_NOTAS.md (secciones 4, 7, 8.3, 8.4, 8.5, 9.2, 12 y 14.1), doc/ESTADO_ACTUAL.md y doc/ESTADO_EJECUCION.md.

OBJETIVO: implementar las reglas como funciones puras y probarlas con Vitest. El núcleo es el cálculo del promedio con céntimas enteras (sección 7), que evita el error de redondeo en la frontera de 3.3.

TAREA 1. Instala vitest (desarrollo). Agrega "test": "vitest run" y "test:ver": "vitest". Crea vitest.config.ts con environment 'node', include ['tests/**/*.test.ts'] y el alias '@' de tsconfig.json.

TAREA 2. Crea lib/config/notas.ts con el contenido exacto de la sección 8.4.

TAREA 3. Crea lib/reglas/ con las firmas exactas de la sección 8.5:
- errores.ts: CodigoError; MENSAJES y ESTADO_HTTP con la tabla 9.2; clase ErrorDeNegocio (name 'ErrorDeNegocio'; si no recibe mensaje usa MENSAJES[codigo]).
- estudiante.ts: normalizarNombre (recorta espacios extremos y colapsa espacios internos a uno solo); validarNombre (tras normalizar, mínimo 2 caracteres; si no, DATOS_INVALIDOS).
- nota.ts: esNotaValida(n) (0 ≤ n ≤ 5, usando NOTA_MINIMA y NOTA_MAXIMA); validarNotas({ parcial1, parcial2, examenFinal }) (cada una numérica y válida; si no, DATOS_INVALIDOS); calcularPromedio(p1, p2, examenFinal) EXACTAMENTE como la sección 7 (función interna aCentimas con Math.round(n*100); promedio = Math.round((aCentimas(p1)+aCentimas(p2)+2*aCentimas(examenFinal))/4)/100); determinarResultado(promedio) (aCentimas(promedio) >= 330 ? 'Aprobó' : 'Perdió', usando UMBRAL_APROBACION). calcularPromedio debe derivar los pesos de las constantes de config, no de números fijos dispersos.

Ningún archivo de lib/reglas/ importa pg, next ni process.env, ni llama new Date().

TAREA 4. Crea tests/reglas/ayudas.ts con esperarCodigo(fn, codigo).

TAREA 5. Crea las pruebas en tests/reglas/ (nota, estudiante) cubriendo T-01 a T-24 de la sección 14.1. Cada caso con su ID en el nombre. Presta especial atención a T-01 (3.30/3.30/3.30 → 3.30 Aprobó), T-07 y T-24 (3.40/3.40/3.25 → 3.33 Aprobó) y T-09 (determinarResultado(3.30) → Aprobó, la frontera).

TAREA 6. Ejecuta npm test hasta que pasen las 24. Si una falla, corrige la regla, no la prueba, salvo que contradiga el plan; explícalo.

RESTRICCIONES: no toques app/, el login ni la base de datos.

AL TERMINAR:
- npm run build y npm test sin errores.
- Crea doc/checkpoints/FASE_2_COMPLETADA.md con la salida resumida de npm test.
- Marca P02 en ESTADO_EJECUCION.md y agrega su sección en la bitácora.
- Muéstrame un resumen.
````

**Verificación del estudiante:** ejecutar `npm test` (24 pruebas). Abrir `lib/reglas/nota.ts` y comprobar que el cálculo usa céntimas enteras, no `p1*0.25 + ...` con decimales.

**Commit sugerido:** `feat(reglas): cálculo de promedio con céntimas y 24 pruebas`

---

## P03 · Infraestructura del servidor

**Fase:** 3 · **Crea:** conexión, sesión, respuestas, esquemas, formato y `/api/notas/sesion` · **Modifica:** protección de rutas y redirección del login

````text
Antes de escribir código lee completos: doc/PLAN_NOTAS.md (secciones 1.3, 6.4, 8.1, 8.3, 8.7, 9.1, 9.2, 9.4, 11 y 13), doc/ESTADO_ACTUAL.md (sección 5) y doc/ESTADO_EJECUCION.md.

OBJETIVO: dejar lista la infraestructura del servidor.

TAREA 1. lib/db/conexion.ts como la sección 8.7, incluyendo el parser de NUMERIC (las notas son decimales). Si la variable de conexión no se llama DATABASE_URL, usa el nombre real que indica ESTADO_ACTUAL.md. Si ya hay un pool de pg, reutilízalo agregando los parsers.

TAREA 2. lib/auth/sesion.ts:
- obtenerSesion(): Promise<{ email: string } | null> usando el mecanismo del login descrito en ESTADO_ACTUAL.md.
- exigirSesion(): igual, pero lanza ErrorDeNegocio('NO_AUTORIZADO') si no hay sesión.
- Solo importa funciones del login; no modifica sus archivos.

TAREA 3. Protección de rutas en el archivo indicado (proxy.ts o middleware.ts): agrega /notas/:path* y /api/notas/:path* al matcher, conservando lo existente. Sin sesión: las páginas redirigen al login; las rutas /api/notas responden 401 con el formato de la sección 9.1. Si no es posible en ese archivo, deja la protección en el layout de /notas (P06) y en exigirSesion(), y anótalo.

TAREA 4. Cambia SOLO el destino de la redirección posterior al login a /notas.

TAREA 5. lib/http/respuestas.ts: responderOk(datos, estado=200); responderError (ErrorDeNegocio → ESTADO_HTTP[codigo]; ZodError → 400 DATOS_INVALIDOS con detalles flatten; pg 23505/23503/23514 → traducir con la tabla 6.4 por error.constraint; otro → console.error y 500 ERROR_INTERNO); conManejoDeErrores(handler); leerCuerpo(request, esquema). Todas con Cache-Control: no-store.

TAREA 6. lib/validacion/esquemas.ts con los esquemas de la sección 9.4, con tipos z.infer. esquemaNota usa z.coerce.number().min(0).max(5) con mensajes en español. No importa nada del servidor.

TAREA 7. lib/formato.ts: formatearNota(3.3) → "3,30" (siempre dos decimales, coma decimal es-CO); formatearFecha (Intl es-CO, dateStyle medium, timeZone America/Bogota); normalizarEntradaNota(texto) que acepta coma o punto y devuelve número (para los formularios).

TAREA 8. app/api/notas/sesion/route.ts: GET con conManejoDeErrores; primera instrucción await exigirSesion(); responde { email }. export const dynamic = 'force-dynamic'.

VERIFICACIÓN: npm run build y npm test. Inicia npm run dev; sin sesión, GET /api/notas/sesion debe dar 401. Pídeme que inicie sesión y abra http://localhost:3000/api/notas/sesion; espera mi confirmación de que responde 200. Comprueba que el login sigue funcionando y redirige a /notas (puede mostrar 404 hasta P06).

AL TERMINAR:
- Crea doc/checkpoints/FASE_3_COMPLETADA.md con los resultados y el diff resumido de los archivos del login o de protección que tocaste.
- Marca P03 en ESTADO_EJECUCION.md y agrega su sección en la bitácora.
- Muéstrame un resumen.
````

**Verificación del estudiante:** iniciar sesión: debe llevar a `/notas` (por ahora 404). Abrir `/api/notas/sesion` con sesión: 200. En ventana privada: 401.

**Commit sugerido:** `feat(servidor): conexión, sesión y utilidades de API`

---

## P04 · Datos: estudiantes, cortes y grupo

**Fase:** 4 (primera parte) · **Crea:** `lib/datos/*`, `lib/dataService.ts`, `scripts/limpiar-prueba.mjs`, `scripts/probar-flujo.ts`, `scripts/cargar-demo.ts`

````text
Antes de escribir código lee completos: doc/PLAN_NOTAS.md (secciones 4, 5, 6, 7, 8.5, 8.6, 14.2 y 16), doc/ESTADO_ACTUAL.md y doc/ESTADO_EJECUCION.md. Revisa lib/reglas/, lib/db/conexion.ts y lib/validacion/esquemas.ts.

OBJETIVO: implementar el acceso a datos y los casos de uso, y comprobar el flujo contra la base real.

TAREA 1. lib/datos/tipos.ts con los tipos de la sección 8.6 (DatosCorte, FilaEstudiante, Corte, DetalleEstudiante, ExtremosGrupo). Reutiliza el tipo Resultado de lib/reglas/nota.ts.

TAREA 2. lib/datos/estudiantes.ts:
- listarEstudiantes({ incluirInactivos, busqueda }): desde estudiantes (y v_ultimo_corte para el último promedio y resultado de cada uno); por defecto solo activos; busqueda por lower(nombre) LIKE; orden por nombre; cada fila con totalCortes (COUNT) y ultimoCorte (de v_ultimo_corte) o null.
- crearEstudiante(nombre): validarNombre y normalizarNombre; inserta; nombre duplicado → NOMBRE_DUPLICADO.
- obtenerEstudiante(id): el estudiante con su historial completo de cortes (listarCortes); si no existe, ESTUDIANTE_NO_ENCONTRADO.
- desactivarEstudiante(id): activo = false; si no existe, ESTUDIANTE_NO_ENCONTRADO.
- obtenerEstudianteActivo(tx, id) (interna): SELECT ... WHERE id y activo; ESTUDIANTE_NO_ENCONTRADO si no.

TAREA 3. lib/datos/cortes.ts:
- registrarCorte(d): secuencia EXACTA de la sección 5.1 (validarNotas; obtenerEstudianteActivo; calcularPromedio; determinarResultado; insertar con promedio y resultado y created_at por defecto). Devuelve el Corte creado.
- listarCortes(estudianteId): cortes del estudiante ordenados por created_at descendente (desempatando por id descendente); convierte las notas a número.

TAREA 4. lib/datos/grupo.ts: obtenerExtremosGrupo(): lee v_ultimo_corte (corte más reciente de cada estudiante activo con cortes); si está vacía, devuelve listas vacías y totalEnGrupo 0; si no, encuentra el promedio máximo y el mínimo y devuelve TODOS los estudiantes que empatan en cada extremo (RN-08, RN-09), cada uno con nombre y promedio, más totalEnGrupo.

TAREA 5. lib/dataService.ts como fachada: reexporta las funciones públicas y los tipos. Verifica que ningún archivo fuera de lib/datos importe lib/db/conexion.ts.

TAREA 6. scripts/limpiar-prueba.mjs con "db:limpiar": borra (en orden cortes, estudiantes) los estudiantes cuyo nombre empiece por 'Prueba' o 'Demo' y sus cortes. Imprime el conteo. Opciones --prueba y --demo.

TAREA 7. Instala tsx (desarrollo). Crea scripts/probar-flujo.ts con los 14 pasos de la sección 14.2 usando solo dataService. Imprime OK/FALLA por paso; para los pasos que esperan error, verifica el código de ErrorDeNegocio; limpia antes y en finally; cierra el pool; código 1 si hay fallas. "probar:flujo": "tsx --env-file=.env.local scripts/probar-flujo.ts" (o la variante con --import tsx). Ejecuta y corrige hasta 0 fallas. Nota para el paso 14: eliminar un estudiante con cortes no tiene función en dataService (solo desactivar); comprueba el ON DELETE RESTRICT con una consulta directa dentro del script que intente el DELETE y espere el error 23503, y documenta que la vía soportada es desactivar.

TAREA 8. scripts/cargar-demo.ts con "db:demo": crea ~5 estudiantes con uno o dos cortes cada uno, con promedios variados (algunos que aprueban, algunos que pierden, y dos que empaten en el promedio más alto de su último corte), para poder ver la lista y el panel de grupo. Limpia los Demo antes. Imprime una tabla con nombre, último promedio y resultado. Ejecútalo.

AL TERMINAR:
- npm run build y npm test sin errores.
- Marca P04 en ESTADO_EJECUCION.md y agrega la salida de probar:flujo y db:demo en la bitácora. La fase 4 sigue abierta hasta P05.
- Muéstrame un resumen.
````

**Verificación del estudiante:** `npm run probar:flujo` (14 OK, 0 fallas) y `npm run db:demo`. Revisar que el paso 11 del flujo identifica al más alto y al más bajo, y el paso 12 detecta el empate.

**Commit sugerido:** `feat(datos): estudiantes, cortes y extremos del grupo con prueba de flujo`

---

## P05 · API

**Fase:** 4 (cierre) · **Crea:** rutas de `app/api/notas/`

````text
Antes de escribir código lee completos: doc/PLAN_NOTAS.md (secciones 9.1 a 9.4), doc/ESTADO_EJECUCION.md, lib/dataService.ts, lib/http/respuestas.ts, lib/validacion/esquemas.ts y lib/auth/sesion.ts.

OBJETIVO: exponer las operaciones con rutas protegidas.

TAREA 1. Crea las rutas de la tabla 9.3 (deja /api/notas/grupo para P08 o créala ya; es inofensiva). Reglas de cada handler:
- Primera instrucción: await exigirSesion().
- conManejoDeErrores; cuerpos con leerCuerpo y los esquemas de 9.4; filtros validados.
- [id] con await params (uuid).
- export const dynamic = 'force-dynamic'.
- POST de estudiantes y de cortes responden 201. El corte se registra con registrarCorte usando el id de la URL como estudianteId.
- PATCH /api/notas/estudiantes/[id] con esquemaDesactivar llama desactivarEstudiante.

TAREA 2. Verificación sin sesión: con npm run dev, GET /api/notas/estudiantes y POST /api/notas/estudiantes/<un-uuid>/cortes deben dar 401.

TAREA 3. Verificación con sesión: pídeme que inicie sesión y abra /api/notas/estudiantes (muestra los estudiantes DEMO con su último promedio) y, para uno de ellos, /api/notas/estudiantes/<id>. Prueba POST de un corte con una nota de 6.0 y confirma 400. Documenta.

AL TERMINAR:
- npm run build y npm test sin errores.
- Crea doc/checkpoints/FASE_4_COMPLETADA.md con probar:flujo (P04) y las verificaciones.
- Marca P05 en ESTADO_EJECUCION.md y agrega su sección en la bitácora.
- Muéstrame un resumen.
````

**Verificación del estudiante:** con sesión, abrir `/api/notas/estudiantes` y ver la lista con el último promedio; intentar por API un corte con nota fuera de rango y recibir 400.

**Commit sugerido:** `feat(api): rutas protegidas de estudiantes y cortes`

---

## P06 · Interfaz base, estudiantes e historial

**Fase:** 5 · **Crea:** `components/ui/*`, layout de `/notas`, lista de estudiantes e historial · **Modifica:** `app/globals.css` y, según el caso, `app/page.tsx`

````text
Antes de escribir código lee completos: doc/PLAN_NOTAS.md (secciones 3, 5, 10, 11 y 12), doc/ESTADO_ACTUAL.md (secciones 5, 9 y 11), doc/ESTADO_EJECUCION.md, lib/dataService.ts y lib/formato.ts.

OBJETIVO: construir los componentes reutilizables, la navegación, la lista de estudiantes y el historial de cada estudiante (resuelve CU-03 / F4).

TAREA 1. Agrega los tokens de color de la sección 11 sin borrar nada existente: con Tailwind 4 en @theme de app/globals.css; con Tailwind 3 en tailwind.config.

TAREA 2. components/ui/: Boton (primario, secundario, peligro, fantasma; prop cargando), Campo, Tarjeta, Insignia (tono neutro, aprobo, perdio, inactivo), Aviso (info, exito, advertencia, error), Modal (fondo oscuro, cierre con Escape y botón, foco al abrir, role dialog), EstadoVacio. Foco visible y contraste suficiente.

TAREA 3. components/notas/:
- NavegacionNotas: barra con "NotaFlux", enlaces Estudiantes (/notas) y, cuando exista, Grupo; correo del usuario y botón de cerrar sesión del login. Menú desplegable en móvil.
- InsigniaResultado (Aprobó/Perdió con los tonos de la sección 11).

TAREA 4. app/notas/layout.tsx (servidor): obtenerSesion(); sin sesión, redirect al login. Renderiza NavegacionNotas y el contenido (ancho máximo 1000 px, fondo --color-fondo).

TAREA 5. app/page.tsx: si es la plantilla de Next.js, redirección a /notas; si tiene contenido propio, agrega un enlace a /notas sin borrarlo.

TAREA 6. Lista de estudiantes: components/notas/TablaEstudiantes.tsx y app/notas/page.tsx (servidor):
- Buscador por nombre (reflejado en la URL con espera de 300 ms).
- Tabla: nombre (enlace a /notas/estudiantes/[id]), número de cortes, último promedio (formatearNota o "Sin cortes") con InsigniaResultado si tiene, fecha del último corte.
- Botón "Registrar estudiante".
- EstadoVacio "Aún no hay estudiantes" o "No se encontraron estudiantes".
- Tablas en tarjetas apiladas bajo 640 px.
(El panel de grupo se agrega en P08.)

TAREA 7. components/notas/FormularioEstudiante.tsx (cliente) y app/notas/estudiantes/nuevo/page.tsx: campo nombre; validación con esquemaEstudiante; POST /api/notas/estudiantes; al guardar navega a /notas/estudiantes/[id]; nombre duplicado muestra el mensaje de NOMBRE_DUPLICADO.

TAREA 8. Historial: components/notas/TablaHistorial.tsx y app/notas/estudiantes/[id]/page.tsx (servidor):
- obtenerEstudiante(id) (notFound si no existe).
- Encabezado con el nombre y la fecha de registro; si está inactivo, Insignia "Inactivo".
- Botón "Registrar corte" (enlace a /notas/estudiantes/[id]/corte).
- TablaHistorial: por cada corte, fecha, parcial 1, parcial 2, examen final, promedio (todos con formatearNota, tabular-nums) e InsigniaResultado; del más reciente al más antiguo.
- EstadoVacio "Este estudiante aún no tiene cortes" con enlace a registrar.
- Acción "Desactivar estudiante" (componente cliente, con Modal de confirmación; PATCH con { activo: false }; al terminar, router.refresh()).

VERIFICACIÓN: pídeme que inicie sesión si lo necesitas. Comprueba: el login lleva a la lista; crear un estudiante; intentar un nombre repetido (error); abrir su historial (vacío al inicio); buscar por nombre. Revisa la navegación en móvil.

AL TERMINAR:
- npm run build y npm test sin errores.
- Marca P06 en ESTADO_EJECUCION.md y agrega su sección en la bitácora.
- Muéstrame un resumen.
````

**Verificación del estudiante:** crear un estudiante y abrir su historial; comprobar que un nombre repetido se rechaza y que la búsqueda filtra la lista.

**Commit sugerido:** `feat(interfaz): componentes base, lista de estudiantes e historial`

---

## P07 · Registro de corte y aceptación del módulo mínimo

**Fase:** 5 y 6 · **Crea:** registro de corte con vista previa, `doc/ACEPTACION.md` · **Modifica:** `README.md`

````text
Antes de escribir código lee completos: doc/PLAN_NOTAS.md (secciones 4, 5.1, 7, 9.3, 10, 12, 13, 14 y 15), doc/ESTADO_EJECUCION.md, lib/reglas/nota.ts y los componentes existentes.

OBJETIVO: registrar un corte con el promedio y el resultado previstos en vivo, y cerrar el módulo mínimo con la aceptación.

TAREA 1. components/notas/VistaPreviaPromedio.tsx (cliente): recibe las tres notas que se están escribiendo (texto). Normaliza con normalizarEntradaNota; si las tres son válidas (0 a 5), calcula el promedio con calcularPromedio y el resultado con determinarResultado (las MISMAS funciones de lib/reglas/nota.ts, no una copia) y muestra el texto de la sección 10.1 (promedio con formatearNota y el resultado con InsigniaResultado). Si alguna nota falta o está fuera de rango, muestra "Ingrese las tres notas (0.0 a 5.0) para ver el promedio" y marca el campo inválido.

TAREA 2. components/notas/FormularioCorte.tsx (cliente) y app/notas/estudiantes/[id]/corte/page.tsx (servidor que obtiene el estudiante con obtenerEstudiante; notFound si no existe; si está inactivo, Aviso de que no se pueden registrar cortes y enlace al historial):
- Tres campos: parcial 1, parcial 2, examen final, con inputMode decimal y ayuda "Entre 0.0 y 5.0" (y la nota de la sección 10.1 sobre el peso del examen final).
- VistaPreviaPromedio en vivo.
- Validación con esquemaCorte antes de enviar. POST /api/notas/estudiantes/[id]/cortes.
- Tras guardar, reemplaza el formulario por un resultado: promedio e InsigniaResultado grandes, y enlaces "Ver historial" y "Registrar otro corte". Si el servidor responde error, muestra error.mensaje.

TAREA 3. Revisa el código contra las secciones 7, 8.3 y 13. Reporta y corrige en la bitácora: cálculo del promedio fuera de lib/reglas/nota.ts o con decimales de punto flotante; pesos o umbral escritos a mano en vez de leerlos de config; rutas sin exigirSesion; cortes editables o eliminables; SQL concatenado; textos en inglés; resultado comunicado solo con color; promedios mostrados sin dos decimales.

TAREA 4. Ejecuta npm test y npm run probar:flujo; corrige fallas en el código. Prepara la aceptación: db:limpiar --prueba; conserva los Demo.

TAREA 5. Crea doc/ACEPTACION.md con la tabla A-01 a A-14 de la sección 14.3 (columnas: ID, acción, resultado esperado, resultado obtenido, evidencia, observación; las tres últimas vacías) y una nota de que A-11 y A-12 corresponden a la funcionalidad opcional (P08).

TAREA 6. Actualiza README.md: descripción; funcionalidades; requisitos; cómo correr en local (npm install, .env.local con los NOMBRES de las variables, db:migrar, db:demo, dev); scripts y su propósito; estructura de carpetas; la fórmula del promedio y la regla de aprobación (3.3 con >=); una nota breve "Por qué se calcula con céntimas" (sección 7); enlace a doc/PLAN_NOTAS.md.

TAREA 7. Verifica que .env.local esté en .gitignore y que ningún archivo versionado tenga valores de variables de entorno.

AL TERMINAR:
- npm run build y npm test sin errores.
- Crea doc/checkpoints/FASE_5_COMPLETADA.md (interfaz) y doc/checkpoints/FASE_6_COMPLETADA.md (revisión y pruebas).
- Marca P07 en ESTADO_EJECUCION.md y agrega su sección en la bitácora.
- Muéstrame un resumen y recuérdame que A-01 a A-10, A-13 y A-14 se ejecutan en el despliegue de Vercel.
````

**Verificación del estudiante:** registrar un corte y ver cómo el promedio y el resultado cambian en vivo al escribir las notas; probar 3.30/3.30/3.30 (Aprobó) y 2.00/3.00/4.00 (Perdió, 3,25). Hacer push y ejecutar A-01 a A-10, A-13 y A-14 en Vercel.

**Commit sugerido:** `feat(interfaz): registro de corte con promedio en vivo y aceptación`

---

## P08 · Opcional: máximo y mínimo del grupo

**Fase:** 7 · **Requisito:** `doc/checkpoints/FASE_6_COMPLETADA.md` existe y `doc/ACEPTACION.md` está diligenciado

````text
Antes de escribir código lee completos: doc/PLAN_NOTAS.md (secciones 4 (RN-08, RN-09), 8.6, 14.3 (A-11, A-12) y 16), doc/ESTADO_EJECUCION.md y doc/checkpoints/FASE_6_COMPLETADA.md. Si FASE_6_COMPLETADA.md no existe, detente y avísame.

OBJETIVO: mostrar el estudiante (o estudiantes, en empate) con el promedio más alto y el más bajo del grupo, sobre el corte más reciente de cada uno (F5).

TAREA 1. Verifica que lib/datos/grupo.ts tiene obtenerExtremosGrupo (creado en P04) y que respeta RN-08 (solo el último corte de cada estudiante activo con cortes) y RN-09 (devuelve todos los que empatan). Si no está completo, complétalo.

TAREA 2. app/api/notas/grupo/route.ts: si no se creó en P05, créala ahora. GET con exigirSesion(); obtenerExtremosGrupo().

TAREA 3. components/notas/PanelGrupo.tsx: dos tarjetas, "Promedio más alto" y "Promedio más bajo". Cada una lista uno o varios nombres con su promedio (formatearNota); si hay empate, los muestra todos con una nota "Empate". Si no hay estudiantes con cortes, un EstadoVacio "Aún no hay cortes para comparar". Usa los colores aprobo/perdio solo como acento, con el texto siempre visible.

TAREA 4. En app/notas/page.tsx, muestra PanelGrupo arriba de la tabla de estudiantes (obtiene los datos con obtenerExtremosGrupo). Agrega el enlace "Grupo" en NavegacionNotas si decides una página propia /notas/grupo; si lo dejas solo en el panel principal, no hace falta.

VERIFICACIÓN: pídeme que inicie sesión si lo necesitas. Con los datos DEMO (que incluyen un empate en el promedio más alto): comprueba que el panel muestra el más alto y el más bajo, y que el empate lista a los dos estudiantes. Registra un corte nuevo muy alto para un tercer estudiante y comprueba que el panel se actualiza (el máximo usa el corte más reciente). Desactiva un estudiante que fuera extremo y comprueba que sale del grupo. Documenta y, si creaste cortes de prueba, limpia con db:limpiar.

AL TERMINAR:
- npm run build y npm test sin errores.
- Agrega a doc/ACEPTACION.md los resultados de A-11 y A-12.
- Crea doc/checkpoints/FASE_7_COMPLETADA.md.
- Marca P08 en ESTADO_EJECUCION.md y agrega su sección en la bitácora.
- Muéstrame un resumen.
````

**Verificación del estudiante:** revisar el panel de grupo con los datos demo, comprobar el empate en el más alto y que al desactivar un estudiante sale de la comparación.

**Commit sugerido:** `feat(opcional): máximo y mínimo del grupo con empates`

---

## Prompts auxiliares

### Corrección de un error

Reemplazar `[NN]` por el número del prompt y pegar el error completo donde se indica.

````text
Durante la ejecución del prompt P[NN] apareció este error:

[PEGAR AQUÍ EL ERROR COMPLETO]

Lee doc/PLAN_NOTAS.md, doc/ESTADO_ACTUAL.md y doc/ESTADO_EJECUCION.md. Encuentra la causa y corrígela sin salir del alcance de P[NN]. No modifiques pruebas ni scripts de prueba para que pasen; corrige el código que prueban. Ejecuta npm run build y npm test. Registra en la bitácora la causa, la corrección y los archivos modificados. Muéstrame un resumen.
````

### Reanudación de un prompt interrumpido

````text
La ejecución anterior del prompt P[NN] se interrumpió. Lee doc/ESTADO_EJECUCION.md, doc/PLAN_NOTAS.md y doc/PROMPTS_NOTAS.md (sección P[NN]). Revisa qué archivos de P[NN] ya existen y cuáles faltan, y continúa desde la primera tarea incompleta sin rehacer lo terminado. Al final ejecuta npm run build y npm test, y actualiza la bitácora.
````

### Despliegue fallido en Vercel

````text
El despliegue en Vercel falló con este registro:

[PEGAR AQUÍ EL REGISTRO DEL BUILD DE VERCEL]

Lee doc/ESTADO_ACTUAL.md y doc/ESTADO_EJECUCION.md. Identifica la causa (error de compilación, variable de entorno faltante en Vercel, diferencia entre local y producción). Si es de código, corrígelo y verifica con npm run build. Si es una variable de entorno, dime exactamente qué NOMBRE de variable falta y en qué entornos de Vercel agregarla, sin pedir ni mostrar valores. Registra la causa y la solución en la bitácora.
````
