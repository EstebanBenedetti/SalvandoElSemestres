# NotaFlux · Plan técnico de implementación

> Sistema de Registro y Cálculo de Notas Estudiantiles · versión técnica 1.0, derivada del plan funcional de Esteban David Benedetty Arrieta
> Asignatura: Lógica y Programación (SIST0200) · Universidad Sergio Arboleda, Santa Marta · Docente: Jhonatan Castro Polo
> Stack: Next.js (App Router) + TypeScript + Tailwind CSS + Supabase Postgres + Zod · Despliegue en Vercel
> Ejecución: GitHub Copilot en modo Agente, con los prompts de `doc/PROMPTS_NOTAS.md`

---

## Índice

0. [Cómo se usa este documento](#0-cómo-se-usa-este-documento)
1. [Punto de partida](#1-punto-de-partida)
2. [Alcance](#2-alcance)
3. [Acceso](#3-acceso)
4. [Reglas de negocio](#4-reglas-de-negocio)
5. [Casos de uso](#5-casos-de-uso)
6. [Modelo de datos](#6-modelo-de-datos)
7. [Cálculo del promedio](#7-cálculo-del-promedio)
8. [Arquitectura del código](#8-arquitectura-del-código)
9. [Contratos de API](#9-contratos-de-api)
10. [Pantallas](#10-pantallas)
11. [Identidad visual](#11-identidad-visual)
12. [Números, fechas y zona horaria](#12-números-fechas-y-zona-horaria)
13. [Seguridad e integridad](#13-seguridad-e-integridad)
14. [Pruebas](#14-pruebas)
15. [Plan de ejecución](#15-plan-de-ejecución)
16. [Funcionalidades opcionales](#16-funcionalidades-opcionales)
17. [Glosario](#17-glosario)

---

## 0. Cómo se usa este documento

Este plan es el documento rector del proyecto. Copilot lo lee antes de cada tarea y los prompts remiten a sus secciones por número. Si un prompt y este plan no coinciden, prevalece el plan.

| Archivo en el repositorio | Función |
|---|---|
| `doc/PLAN_NOTAS.md` | Este documento |
| `doc/PROMPTS_NOTAS.md` | Prompts en orden de ejecución |
| `doc/ESTADO_ACTUAL.md` | Radiografía del repositorio antes de empezar (lo crea P00) |
| `doc/ESTADO_EJECUCION.md` | Avance prompt por prompt |
| `doc/checkpoints/FASE_N_COMPLETADA.md` | Evidencia del cierre de cada fase |
| `.github/copilot-instructions.md` | Reglas permanentes que Copilot aplica en todas las conversaciones |

---

## 1. Punto de partida

### 1.1 Lo que ya existe y no se reconstruye

- Proyecto Next.js con TypeScript desplegado en Vercel.
- Proyecto Supabase conectado al despliegue.
- Login funcionando.
- Variables de entorno en `.env.local` (local) y en el proyecto de Vercel (producción).

### 1.2 Lo que se verifica en P00 antes de escribir código

| Aspecto | Por qué importa |
|---|---|
| Mecanismo del login (JWT propio en cookie, Supabase Auth u otro) | El adaptador `lib/auth/sesion.ts` debe envolverlo sin reescribirlo |
| Ruta a la que redirige el login | Se cambia a `/notas` |
| Archivo de middleware existente | En Next.js 16 se llama `proxy.ts`; en versiones anteriores, `middleware.ts` |
| Variable de conexión directa a Postgres | El registro de cortes usa transacciones con `pg`; si no existe, se obtiene en P00 |
| Mecanismo de migraciones existente | Las tablas nuevas se aplican con ese mecanismo; si no existe, se crea `npm run db:migrar` |
| Versión de Tailwind | Define dónde se declaran los colores (sección 11) |
| Rutas `/notas` o `/api/notas` | No deben existir antes; si existen, se reporta el conflicto |
| Tablas previas llamadas `estudiantes` o `cortes` | Si existen, se reporta su estructura antes de crear las nuevas |

### 1.3 Regla sobre el login

El plan funcional dice que no hay usuarios ni contraseñas y que cualquiera puede ver y registrar notas (sección 7). En este proyecto, sin embargo, la aplicación está publicada en una URL de Vercel: dejarla sin protección expondría los datos a cualquiera en internet. Por eso se usa el login existente como una puerta única de acceso. No se agregan roles ni cuentas por estudiante: toda persona con sesión válida puede ver y registrar todo, tal como pide el plan. El login existente no se reescribe; solo se agrega:

1. Un adaptador `lib/auth/sesion.ts` que expone `obtenerSesion()` y `exigirSesion()`.
2. Protección de las rutas `/notas/*` y `/api/notas/*`.
3. La redirección posterior al login hacia `/notas`.

---

## 2. Alcance

### 2.1 Módulo mínimo

| ID | Funcionalidad (plan funcional) | Casos de uso | Prompts |
|---|---|---|---|
| F1 | Registrar un estudiante nuevo | CU-01 | P04, P05, P06 |
| F2 | Registrar las notas de un corte y calcular promedio y resultado | CU-02 | P02, P04, P05, P07 |
| F3 | Guardar cada corte en el historial, sin borrar los anteriores | CU-02 | P01, P04 |

### 2.2 Funcionalidades opcionales

| ID | Funcionalidad | Casos de uso | Prompts |
|---|---|---|---|
| F4 | Consultar el historial completo de un estudiante | CU-03 | P06, P07 |
| F5 | Mostrar la nota más alta y más baja del grupo (corte más reciente, con empates) | CU-04 | P08 |

F4 se integra en las pantallas del módulo mínimo (el historial es la vista natural del estudiante), así que queda listo junto con el mínimo. F5 se construye solo con la fase 5 cerrada.

### 2.3 Fuera de alcance

Se mantiene la lista del plan funcional: edición o borrado de un corte ya registrado (si se registró mal, se corrige registrando un corte nuevo), el concepto de materias o cursos distintos (todas las notas son de la misma asignatura), cuentas por estudiante con contraseña, reportes en PDF, y notificaciones o correos.

### 2.4 Ajustes respecto al plan funcional

| Plan funcional | Plan técnico | Motivo |
|---|---|---|
| Interfaz por consola | Aplicación web en Next.js | Es el proyecto del semestre y ya está desplegado en Vercel. Las reglas no cambian; cambia la forma de capturar los datos |
| Sin usuarios ni login | Se usa el login existente como puerta única, sin roles | La aplicación está en una URL pública (sección 1.3) |
| Estudiante identificado por el nombre | Identificador interno UUID; el nombre es único (case-insensitive) | El nombre sigue siendo la referencia del usuario, pero las relaciones internas usan el id; evita problemas si dos nombres difieren solo en mayúsculas o espacios |
| Notas como decimal 0.0 a 5.0 | Se guardan como `NUMERIC(3,2)`; los cálculos se hacen con céntimas enteras para el promedio (sección 7) | Evita que el redondeo binario altere la comparación con 3.3 en la frontera de aprobación |
| "fecha del corte" | `TIMESTAMPTZ` del momento del registro | Varios cortes el mismo día deben poder ordenarse por momento exacto; el plan ordena el historial por fecha |

### 2.5 Decisiones de alcance de esta versión técnica

| Decisión | Motivo |
|---|---|
| Los cortes no se editan ni se eliminan | El plan funcional lo indica: un corte mal registrado se corrige con uno nuevo |
| Un estudiante no se elimina; se puede desactivar si ya tiene cortes | Un estudiante con historial no debe borrarse; desactivarlo lo saca del grupo sin perder sus cortes |
| El promedio y el resultado se calculan en el servidor y se guardan en el corte | El plan los lista como campos del corte; guardarlos deja el historial consultable sin recalcular y fija el resultado con la regla vigente al registrar |
| "Corte más reciente" se resuelve por el momento de registro (`created_at`) más alto de cada estudiante | Determinista aunque haya varios cortes el mismo día |
| El grupo para el máximo y el mínimo son los estudiantes activos con al menos un corte | Un estudiante sin cortes no entra en la comparación |

---

## 3. Acceso

| Actor | Acceso | Puede hacer |
|---|---|---|
| Usuario | Login existente | Registrar estudiantes, registrar cortes, consultar historiales, ver el máximo y el mínimo del grupo |
| Sistema | Interno | Valida las notas, calcula el promedio y el resultado, ordena el historial, determina el corte más reciente |

| Ruta | Sin sesión | Con sesión |
|---|:-:|:-:|
| `/` | Redirige al login | Redirige a `/notas` |
| `/notas/*` | Redirige al login | Sí |
| `/api/notas/*` | 401 | Sí |

---

## 4. Reglas de negocio

| ID | Regla | Origen | Dónde se aplica |
|---|---|---|---|
| RN-01 | El nombre del estudiante no puede estar vacío (mínimo 2 caracteres tras recortar espacios) | Sección 4, 6 | `lib/reglas/estudiante.ts`; Zod; BD CHECK |
| RN-02 | El nombre del estudiante es único sin distinguir mayúsculas ni espacios extremos | Sección 4 | BD índice único sobre el nombre normalizado |
| RN-03 | Cada nota (parcial 1, parcial 2, examen final) está entre 0.0 y 5.0 inclusive | Sección 6, regla de rango | `lib/reglas/nota.ts`; Zod; BD CHECK |
| RN-04 | El promedio ponderado es: parcial 1 × 25 % + parcial 2 × 25 % + examen final × 50 % | Sección 6 | `lib/reglas/nota.ts` `calcularPromedio` |
| RN-05 | Se aprueba con promedio mayor o igual a 3.3 (se usa `>=`); por debajo, se pierde | Sección 6 | `lib/reglas/nota.ts` `determinarResultado` |
| RN-06 | No se puede registrar un corte para un estudiante que no existe o está inactivo | Sección 6 | Servicio; BD foreign key |
| RN-07 | Un corte nuevo se agrega al historial como una entrada más; nunca sobrescribe los anteriores | Sección 6 | Solo INSERT; sin UPDATE ni DELETE de cortes |
| RN-08 | El máximo y el mínimo del grupo se calculan solo sobre el corte más reciente de cada estudiante activo con cortes, no sobre todos los cortes mezclados | Sección 6, RF del plan | `lib/datos/grupo.ts` con el corte de `created_at` más alto por estudiante |
| RN-09 | Si hay empate en el promedio más alto o más bajo, se muestran todos los estudiantes que empatan | Sección 6 | `lib/datos/grupo.ts` devuelve listas, no un solo nombre |
| RN-10 | El promedio se presenta con dos decimales | Sección 4 | `lib/formato.ts`; el valor guardado tiene dos decimales |
| RN-11 | Los cortes son inmutables; un estudiante se desactiva en lugar de eliminarse si tiene cortes | Sección 7, 2.5 | Servicio; BD `ON DELETE RESTRICT` |

### 4.1 Validaciones frente a reglas de negocio

| Validación (rechaza datos mal formados) | Regla de negocio (decisión del dominio) |
|---|---|
| Cada nota debe estar entre 0.0 y 5.0 | El estudiante aprueba si el promedio ponderado es ≥ 3.3 |
| El nombre del estudiante no puede estar vacío | El examen final pesa el doble que cada parcial |
| No se registra un corte para un estudiante inexistente | El máximo y el mínimo salen solo del corte más reciente de cada estudiante |

---

## 5. Casos de uso

| ID | Entrada | Precondición | Efecto | Errores posibles |
|---|---|---|---|---|
| CU-01 Registrar estudiante | nombre | nombre no repetido | Estudiante creado con su fecha de registro | `DATOS_INVALIDOS`, `NOMBRE_DUPLICADO` |
| CU-02 Registrar corte | estudiante, parcial 1, parcial 2, examen final | estudiante existe y está activo; notas en rango | Corte creado con promedio y resultado; se agrega al historial | `ESTUDIANTE_NO_ENCONTRADO`, `DATOS_INVALIDOS` |
| CU-03 Consultar historial | estudiante | estudiante existe | Lista de cortes ordenada del más reciente al más antiguo, con sus notas, promedio y resultado | `ESTUDIANTE_NO_ENCONTRADO` |
| CU-04 Ver máximo y mínimo del grupo | ninguna | — | Estudiante(s) con el promedio más alto y con el más bajo, sobre el corte más reciente de cada uno (opcional, F5) | — |
| CU-05 Desactivar estudiante | estudiante | existe | Estudiante inactivo (sale del grupo; conserva su historial) | `ESTUDIANTE_NO_ENCONTRADO` |

### 5.1 Secuencia de CU-02 (registrar corte)

Todo ocurre dentro de `conTransaccion`:

1. `validarNotas` sobre las tres notas (cada una numérica, entre 0.0 y 5.0).
2. `SELECT ... FROM estudiantes WHERE id = $1 AND activo = true` (si no existe o está inactivo: `ESTUDIANTE_NO_ENCONTRADO`).
3. `calcularPromedio` y `determinarResultado` (sección 7).
4. Insertar el corte con las tres notas, el promedio, el resultado y `created_at` del momento.
5. Confirmar y devolver el corte con su promedio y resultado.

No hay bloqueo competitivo relevante: cada corte es un INSERT independiente (RN-07).

```ts
export async function registrarCorte(d: DatosCorte): Promise<Corte> {
  validarNotas(d);
  return conTransaccion(async (tx) => {
    const estudiante = await obtenerEstudianteActivo(tx, d.estudianteId); // ESTUDIANTE_NO_ENCONTRADO
    const promedio = calcularPromedio(d.parcial1, d.parcial2, d.examenFinal); // RN-04
    const resultado = determinarResultado(promedio);                          // RN-05
    const corte = await insertarCorte(tx, { ...d, promedio, resultado });     // RN-07
    return corte;
  });
}
```

---

## 6. Modelo de datos

### 6.1 Relaciones

```text
estudiantes 1 ──── N cortes

v_ultimo_corte = el corte más reciente (created_at máximo) de cada estudiante activo con cortes
```

Las migraciones se guardan en `supabase/migrations/` y continúan la numeración existente (P00 la identifica). En este documento se nombran M1 y M2.

### 6.2 M1 · Tablas

```sql
-- M1: tablas del Sistema de Registro y Cálculo de Notas

CREATE TABLE IF NOT EXISTS estudiantes (
  id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre        VARCHAR(120)  NOT NULL,
  activo        BOOLEAN       NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),   -- fecha de registro
  updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  CONSTRAINT estudiantes_nombre_minimo CHECK (char_length(btrim(nombre)) >= 2)   -- RN-01
);
CREATE UNIQUE INDEX IF NOT EXISTS ux_estudiantes_nombre ON estudiantes (lower(btrim(nombre)));  -- RN-02

CREATE TABLE IF NOT EXISTS cortes (
  id             BIGSERIAL     PRIMARY KEY,
  estudiante_id  UUID          NOT NULL REFERENCES estudiantes(id) ON DELETE RESTRICT,  -- RN-11
  parcial1       NUMERIC(3,2)  NOT NULL,
  parcial2       NUMERIC(3,2)  NOT NULL,
  examen_final   NUMERIC(3,2)  NOT NULL,
  promedio       NUMERIC(3,2)  NOT NULL,
  resultado      VARCHAR(7)    NOT NULL,
  created_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW(),   -- fecha del corte
  CONSTRAINT cortes_parcial1_rango  CHECK (parcial1 >= 0 AND parcial1 <= 5),     -- RN-03
  CONSTRAINT cortes_parcial2_rango  CHECK (parcial2 >= 0 AND parcial2 <= 5),
  CONSTRAINT cortes_final_rango     CHECK (examen_final >= 0 AND examen_final <= 5),
  CONSTRAINT cortes_promedio_rango  CHECK (promedio >= 0 AND promedio <= 5),
  CONSTRAINT cortes_resultado_valido CHECK (resultado IN ('Aprobó', 'Perdió'))   -- RN-05
);
CREATE INDEX IF NOT EXISTS idx_cortes_estudiante ON cortes (estudiante_id, created_at DESC);

CREATE OR REPLACE FUNCTION notas_actualizar_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = '' AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_estudiantes_updated_at ON estudiantes;
CREATE TRIGGER trg_estudiantes_updated_at BEFORE UPDATE ON estudiantes
  FOR EACH ROW EXECUTE FUNCTION notas_actualizar_updated_at();
```

### 6.3 M2 · Vista del último corte y seguridad

```sql
-- M2: vista del corte más reciente por estudiante y cierre de acceso público

CREATE OR REPLACE VIEW v_ultimo_corte
WITH (security_invoker = true) AS
SELECT DISTINCT ON (c.estudiante_id)
  c.estudiante_id,
  e.nombre            AS estudiante_nombre,
  c.id                AS corte_id,
  c.parcial1, c.parcial2, c.examen_final,
  c.promedio, c.resultado,
  c.created_at
FROM cortes c
JOIN estudiantes e ON e.id = c.estudiante_id
WHERE e.activo = true
ORDER BY c.estudiante_id, c.created_at DESC, c.id DESC;   -- RN-08: desempata por id si coinciden los timestamps

ALTER TABLE estudiantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE cortes      ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON estudiantes, cortes FROM anon, authenticated;
REVOKE ALL ON v_ultimo_corte FROM anon, authenticated;
```

`DISTINCT ON (estudiante_id)` con el `ORDER BY` indicado deja una sola fila por estudiante: su corte más reciente. Las tablas quedan sin políticas: la clave pública de Supabase no puede leerlas ni escribirlas. Todo el acceso ocurre en el servidor mediante la conexión directa a Postgres.

### 6.4 Traducción de errores de la base de datos

| Código Postgres | Restricción | Código de negocio |
|---|---|---|
| `23505` | `ux_estudiantes_nombre` | `NOMBRE_DUPLICADO` |
| `23503` | `cortes_estudiante_id_fkey` (`ON DELETE RESTRICT`) | `ESTUDIANTE_CON_CORTES` |
| `23514` | cualquier CHECK | `DATOS_INVALIDOS` |
| Otro | | `ERROR_INTERNO` (se registra en consola, no se muestra al usuario) |

---

## 7. Cálculo del promedio

El punto delicado es la frontera de aprobación: un promedio de exactamente 3.3 aprueba (RN-05, con `>=`). Si el promedio se calcula con decimales de punto flotante, `0.25 + 0.25 + 0.5` sobre ciertas notas puede dar `3.2999999999999998` y clasificar mal un corte en el límite.

Por eso el cálculo se hace con **céntimas enteras**:

```ts
// Las notas entran como número con hasta 2 decimales (p. ej. 3.30).
// Se trabajan en céntimas: 3.30 → 330.
function aCentimas(n: number): number { return Math.round(n * 100); }

export function calcularPromedio(p1: number, p2: number, examenFinal: number): number {
  // Pesos 25 %, 25 %, 50 % → sobre céntimas: (p1 + p2 + 2*final) / 4
  const centimas = (aCentimas(p1) + aCentimas(p2) + 2 * aCentimas(examenFinal)) / 4;
  // centimas es un número de céntimas; se redondea a céntima entera y se vuelve a nota con 2 decimales
  return Math.round(centimas) / 100;
}

export function determinarResultado(promedio: number): 'Aprobó' | 'Perdió' {
  return aCentimas(promedio) >= 330 ? 'Aprobó' : 'Perdió';   // RN-05
}
```

Ejemplos verificables:

| p1 | p2 | final | Cálculo en céntimas | Promedio | Resultado |
|---|---|---|---|---|---|
| 3.30 | 3.30 | 3.30 | (330+330+660)/4 = 330 | 3.30 | Aprobó |
| 2.00 | 3.00 | 4.00 | (200+300+800)/4 = 325 | 3.25 | Perdió |
| 3.00 | 3.00 | 3.50 | (300+300+700)/4 = 325 | 3.25 | Perdió |
| 5.00 | 5.00 | 5.00 | (500+500+1000)/4 = 500 | 5.00 | Aprobó |
| 0.00 | 0.00 | 0.00 | 0 | 0.00 | Perdió |
| 4.00 | 4.00 | 3.00 | (400+400+600)/4 = 350 | 3.50 | Aprobó |
| 3.40 | 3.40 | 3.25 | (340+340+650)/4 = 332,5 → 333 (redondeo) | 3.33 | Aprobó |

El redondeo a céntima entera usa el redondeo estándar (`Math.round`, mitad hacia arriba). La división entre 4 de una suma de céntimas puede dar media céntima (como en el último ejemplo); se redondea antes de comparar y de guardar, de modo que el valor guardado, el mostrado y el comparado coinciden siempre.

---

## 8. Arquitectura del código

### 8.1 Capas

```text
Pantallas (app/notas/*) ────┐
                            ├──► Rutas API (app/api/notas/*) ──► lib/dataService.ts ──► lib/datos/* ──► Postgres
Componentes (components/*) ─┘          │                                 │
                                       └──── lib/validacion (Zod)        └──── lib/reglas/* (funciones puras)
```

- `lib/reglas/`: reglas como funciones puras. No importan `pg`, no leen variables de entorno y no leen el reloj. Se prueban con Vitest. El cálculo del promedio y el resultado viven aquí.
- `lib/datos/`: consultas SQL y casos de uso con transacciones. Solo este directorio importa `lib/db/conexion.ts`.
- `lib/dataService.ts`: fachada única. Las rutas y páginas importan datos solo desde aquí.
- Rutas API: validan con Zod, verifican sesión, llaman a `dataService` y responden con `lib/http/respuestas.ts`.
- Las páginas (componentes de servidor) pueden leer con `dataService`. Las acciones que modifican datos se hacen desde componentes cliente que llaman a `/api/notas/*` y luego ejecutan `router.refresh()` o navegan.

### 8.2 Árbol de archivos nuevos

```text
.github/copilot-instructions.md
doc/ESTADO_ACTUAL.md
doc/ESTADO_EJECUCION.md
doc/checkpoints/FASE_N_COMPLETADA.md

supabase/migrations/NNNN_notas_tablas.sql
supabase/migrations/NNNN_notas_vista_seguridad.sql

scripts/migrar.mjs                 (solo si no existe mecanismo de migraciones)
scripts/verificar-bd.mjs
scripts/probar-flujo.ts
scripts/limpiar-prueba.mjs
scripts/cargar-demo.ts

lib/config/notas.ts
lib/reglas/errores.ts
lib/reglas/estudiante.ts
lib/reglas/nota.ts
lib/validacion/esquemas.ts
lib/db/conexion.ts
lib/auth/sesion.ts
lib/http/respuestas.ts
lib/formato.ts
lib/datos/tipos.ts
lib/datos/estudiantes.ts
lib/datos/cortes.ts
lib/datos/grupo.ts
lib/dataService.ts

tests/reglas/ayudas.ts
tests/reglas/nota.test.ts
tests/reglas/estudiante.test.ts
vitest.config.ts

app/page.tsx                                  (solo si hoy es la plantilla de Next.js)
app/notas/layout.tsx
app/notas/page.tsx                            (lista de estudiantes + grupo)
app/notas/estudiantes/nuevo/page.tsx
app/notas/estudiantes/[id]/page.tsx           (historial del estudiante)
app/notas/estudiantes/[id]/corte/page.tsx     (registrar corte)

app/api/notas/sesion/route.ts
app/api/notas/estudiantes/route.ts
app/api/notas/estudiantes/[id]/route.ts
app/api/notas/estudiantes/[id]/cortes/route.ts
app/api/notas/grupo/route.ts

components/ui/Boton.tsx
components/ui/Campo.tsx
components/ui/Tarjeta.tsx
components/ui/Insignia.tsx
components/ui/Aviso.tsx
components/ui/Modal.tsx
components/ui/EstadoVacio.tsx
components/notas/NavegacionNotas.tsx
components/notas/InsigniaResultado.tsx
components/notas/TablaEstudiantes.tsx
components/notas/FormularioEstudiante.tsx
components/notas/FormularioCorte.tsx
components/notas/VistaPreviaPromedio.tsx
components/notas/TablaHistorial.tsx
components/notas/PanelGrupo.tsx               (opcional, F5)
```

### 8.3 Responsabilidades y prohibiciones

| Regla de código | Motivo |
|---|---|
| Identificadores, comentarios y mensajes en español | Coherencia con el dominio y con el plan funcional |
| El promedio y el resultado solo se calculan en `lib/reglas/nota.ts` | Una sola fuente de verdad, probada con Vitest |
| El cálculo usa céntimas enteras, no decimales de punto flotante | Sección 7 |
| Los pesos (25/25/50) y el umbral (3.3) se leen de `lib/config/notas.ts` | Un solo lugar para ajustarlos |
| Solo `lib/datos/` importa `lib/db/conexion.ts` | Las rutas no escriben SQL |
| Las rutas solo importan datos desde `lib/dataService.ts` | Fachada única |
| Toda ruta `/api/notas/*` llama `exigirSesion()` como primera instrucción | Sección 1.3 |
| El nombre del estudiante se normaliza (recorte de espacios) antes de buscar o comparar | RN-02 |
| `params` de rutas dinámicas se obtiene con `await params` | Next.js 15 y 16 entregan `params` como Promise |
| No modificar archivos del login salvo la redirección indicada en P03 | Sección 1.3 |

### 8.4 Configuración

```ts
// lib/config/notas.ts
export const PESO_PARCIAL1 = 25;        // %
export const PESO_PARCIAL2 = 25;        // %
export const PESO_EXAMEN_FINAL = 50;    // %
export const NOTA_MINIMA = 0;           // nota más baja válida
export const NOTA_MAXIMA = 5;           // nota más alta válida
export const UMBRAL_APROBACION = 3.3;   // se aprueba con promedio >= 3.3 (RN-05)
export const LIMITE_LISTADO = 500;      // filas máximas por consulta
```

Los pesos se usan como en la sección 7 (sobre céntimas: `(p1 + p2 + 2*final) / 4` equivale a 25/25/50). Si se cambiaran a otros valores, `calcularPromedio` debe derivarse de estas constantes, no de números fijos.

### 8.5 Firmas de las reglas puras

```ts
// lib/reglas/errores.ts
export type CodigoError =
  | 'DATOS_INVALIDOS' | 'NO_AUTORIZADO'
  | 'NOMBRE_DUPLICADO' | 'ESTUDIANTE_NO_ENCONTRADO' | 'ESTUDIANTE_CON_CORTES'
  | 'ERROR_INTERNO';
export const MENSAJES: Record<CodigoError, string>;     // sección 9.2
export const ESTADO_HTTP: Record<CodigoError, number>;  // sección 9.2
export class ErrorDeNegocio extends Error {
  constructor(public codigo: CodigoError, mensaje?: string, public detalles?: unknown);
}

// lib/reglas/estudiante.ts
export function normalizarNombre(nombre: string): string;   // recorta espacios extremos y colapsa internos
export function validarNombre(nombre: string): void;        // RN-01; DATOS_INVALIDOS

// lib/reglas/nota.ts
export type Resultado = 'Aprobó' | 'Perdió';
export function esNotaValida(n: number): boolean;           // 0 ≤ n ≤ 5
export function validarNotas(d: { parcial1: number; parcial2: number; examenFinal: number }): void; // RN-03; DATOS_INVALIDOS
export function calcularPromedio(p1: number, p2: number, examenFinal: number): number;  // céntimas enteras (sección 7)
export function determinarResultado(promedio: number): Resultado;                        // RN-05
```

### 8.6 Firmas de `dataService`

```ts
// Sesión
obtenerSesion(): Promise<{ email: string } | null>

// Estudiantes
listarEstudiantes(f?: { incluirInactivos?: boolean; busqueda?: string }): Promise<FilaEstudiante[]>
crearEstudiante(nombre: string): Promise<{ id: string }>
obtenerEstudiante(id: string): Promise<DetalleEstudiante>     // incluye su historial de cortes
desactivarEstudiante(id: string): Promise<void>

// Cortes
registrarCorte(d: DatosCorte): Promise<Corte>
listarCortes(estudianteId: string): Promise<Corte[]>          // del más reciente al más antiguo

// Grupo (opcional, F5)
obtenerExtremosGrupo(): Promise<ExtremosGrupo>               // máximo(s) y mínimo(s) sobre el último corte
```

Tipos de salida principales (`lib/datos/tipos.ts`):

```ts
interface FilaEstudiante {
  id: string; nombre: string; activo: boolean; totalCortes: number;
  ultimoCorte: { promedio: number; resultado: Resultado; fecha: string } | null;
}
interface Corte {
  id: number; estudianteId: string; parcial1: number; parcial2: number; examenFinal: number;
  promedio: number; resultado: Resultado; fecha: string;
}
interface DetalleEstudiante {
  estudiante: { id: string; nombre: string; activo: boolean; fechaRegistro: string; totalCortes: number };
  cortes: Corte[];   // del más reciente al más antiguo
}
interface ExtremosGrupo {
  masAltos: Array<{ nombre: string; promedio: number }>;   // uno o varios en empate (RN-09)
  masBajos: Array<{ nombre: string; promedio: number }>;
  totalEnGrupo: number;
}
```

### 8.7 Conexión y transacciones

```ts
// lib/db/conexion.ts
import { Pool, types, type PoolClient } from 'pg';

types.setTypeParser(1082, (v) => v);                 // DATE → texto
types.setTypeParser(1114, (v) => v);                 // TIMESTAMP → texto
types.setTypeParser(1184, (v) => v);                 // TIMESTAMPTZ → texto
types.setTypeParser(20, (v) => parseInt(v, 10));     // BIGINT (ids, COUNT) → number
types.setTypeParser(1700, (v) => parseFloat(v));     // NUMERIC (notas, promedio) → number

const globalParaPool = globalThis as unknown as { poolNotas?: Pool };

export const pool = globalParaPool.poolNotas ?? new Pool({
  connectionString: process.env.DATABASE_URL,        // el nombre real lo confirma P00
  ssl: { rejectUnauthorized: false },
  max: 3,
  idleTimeoutMillis: 10_000,
});
if (process.env.NODE_ENV !== 'production') globalParaPool.poolNotas = pool;

export async function consultar<T>(sql: string, valores: unknown[] = []): Promise<T[]> { /* pool.query */ }

export async function conTransaccion<T>(trabajo: (tx: PoolClient) => Promise<T>): Promise<T> {
  // BEGIN → trabajo(tx) → COMMIT; en error: ROLLBACK y relanzar; siempre release()
}
```

A diferencia de los demás proyectos, aquí sí hay un parser para `NUMERIC` porque las notas son decimales con dos cifras; `pg` las entregaría como texto y se convierten a número para los cálculos y la presentación.

---

## 9. Contratos de API

### 9.1 Formato de respuesta

```json
{ "ok": true, "datos": { } }
```

```json
{ "ok": false, "error": { "codigo": "NOMBRE_DUPLICADO", "mensaje": "Ya existe un estudiante con ese nombre.", "detalles": null } }
```

Todas las respuestas llevan `Cache-Control: no-store`.

### 9.2 Códigos de error

| Código | HTTP | Mensaje para el usuario |
|---|---|---|
| `DATOS_INVALIDOS` | 400 | Revise los datos ingresados. |
| `NO_AUTORIZADO` | 401 | Debe iniciar sesión. |
| `NOMBRE_DUPLICADO` | 409 | Ya existe un estudiante con ese nombre. |
| `ESTUDIANTE_NO_ENCONTRADO` | 404 | El estudiante no existe o está inactivo. |
| `ESTUDIANTE_CON_CORTES` | 409 | El estudiante tiene cortes registrados y no se puede eliminar; desactívelo. |
| `ERROR_INTERNO` | 500 | Ocurrió un error inesperado. Intente de nuevo. |

### 9.3 Endpoints (todos requieren sesión)

| Método y ruta | Cuerpo o parámetros | Respuesta `datos` |
|---|---|---|
| `GET /api/notas/sesion` | | `{ email }` |
| `GET /api/notas/estudiantes?incluirInactivos=&busqueda=` | | `FilaEstudiante[]` |
| `POST /api/notas/estudiantes` | `{ nombre }` | `{ id }` (201) |
| `GET /api/notas/estudiantes/[id]` | | `DetalleEstudiante` |
| `PATCH /api/notas/estudiantes/[id]` | `{ activo: false }` | `{ actualizado: true }` |
| `GET /api/notas/estudiantes/[id]/cortes` | | `Corte[]` |
| `POST /api/notas/estudiantes/[id]/cortes` | `{ parcial1, parcial2, examenFinal }` | `Corte` (201) |
| `GET /api/notas/grupo` | | `ExtremosGrupo` (opcional, F5) |

### 9.4 Esquemas Zod (`lib/validacion/esquemas.ts`)

| Esquema | Reglas |
|---|---|
| `esquemaNota` | `z.coerce.number()` con `min(0)` y `max(5)`, mensajes en español ("La nota debe estar entre 0.0 y 5.0") |
| `esquemaEstudiante` | nombre recortado, 2 a 120 caracteres |
| `esquemaCorte` | parcial1, parcial2, examenFinal, cada uno con `esquemaNota` |
| `esquemaDesactivar` | `{ activo: z.literal(false) }` |
| `esquemaFiltrosEstudiantes` | incluirInactivos booleano opcional; busqueda opcional (máximo 120) |

El formato numérico se valida con Zod; el rango 0 a 5 se valida en Zod y de nuevo en `lib/reglas/nota.ts`, y la base de datos lo refuerza con CHECK.

---

## 10. Pantallas

| Ruta | Contenido |
|---|---|
| Layout `/notas` | Verifica la sesión con `obtenerSesion()`; sin sesión redirige al login. Barra con "NotaFlux" (o el nombre que prefiera el estudiante), navegación (Estudiantes; Grupo cuando F5 esté activo), correo del usuario y botón de cerrar sesión del login. Menú desplegable en móvil. |
| `/notas` · Estudiantes | Buscador por nombre. `TablaEstudiantes`: nombre (enlace al historial), número de cortes, último promedio con `InsigniaResultado`, fecha del último corte. Botón "Registrar estudiante". Si F5 está activo, `PanelGrupo` arriba con el máximo y el mínimo del grupo. `EstadoVacio` si no hay estudiantes o si la búsqueda no encuentra. |
| `/notas/estudiantes/nuevo` · Registrar estudiante | `FormularioEstudiante`: nombre. Al guardar, navega al historial del estudiante. Nombre duplicado muestra el mensaje de `NOMBRE_DUPLICADO`. |
| `/notas/estudiantes/[id]` · Historial | Encabezado con el nombre y la fecha de registro. Botón "Registrar corte". `TablaHistorial`: para cada corte, fecha, parcial 1, parcial 2, examen final, promedio y `InsigniaResultado`, del más reciente al más antiguo (CU-03, F4). `EstadoVacio` "Este estudiante aún no tiene cortes" con enlace a registrar. Acción "Desactivar estudiante" (con confirmación) cuando corresponda. |
| `/notas/estudiantes/[id]/corte` · Registrar corte | `FormularioCorte`: tres campos de nota (parcial 1, parcial 2, examen final), con ayuda "Entre 0.0 y 5.0". `VistaPreviaPromedio` en vivo: a medida que se escriben las tres notas válidas, muestra el promedio calculado (dos decimales) y el resultado previsto con su color, usando las mismas funciones de `lib/reglas/nota.ts`. Al confirmar, guarda y muestra el resultado; ofrece "Ver historial" y "Registrar otro corte". |

Si `app/page.tsx` es la plantilla de Next.js, se reemplaza por una redirección a `/notas`. Si tiene contenido propio, se agrega un enlace a `/notas`.

### 10.1 Textos fijos

Vista previa del corte:

> Promedio previsto: {promedio}. Resultado: {resultado}. Se confirma al registrar el corte.

Ayuda de nota:

> Cada nota va de 0.0 a 5.0. El examen final pesa el doble que cada parcial.

---

## 11. Identidad visual

| Token | Valor | Uso |
|---|---|---|
| `--color-primario` | `#2D5BA8` | Botones principales, barra superior |
| `--color-primario-suave` | `#E6EDF7` | Fondos de selección, hover |
| `--color-aprobo` | `#2F7D4F` | Resultado Aprobó, promedio más alto |
| `--color-perdio` | `#B83232` | Resultado Perdió, promedio más bajo, errores |
| `--color-inactivo` | `#5B6770` | Estudiante inactivo |
| `--color-fondo` | `#F5F6F8` | Fondo de página |
| `--color-superficie` | `#FFFFFF` | Tarjetas, tablas, modales |
| `--color-texto` | `#1F2933` | Texto principal |
| `--color-texto-suave` | `#52606D` | Texto secundario |
| `--color-borde` | `#D9DEE4` | Bordes y divisores |

Los tokens se agregan a `app/globals.css` sin borrar estilos existentes del login. Con Tailwind 4 se declaran en `@theme`; con Tailwind 3, en `tailwind.config`.

| Insignia | Fondo / texto |
|---|---|
| Aprobó | verde claro / `--color-aprobo` |
| Perdió | rojo claro / `--color-perdio` |
| Inactivo | gris claro / `--color-inactivo` |

Criterios: tipografía del proyecto (si no hay, Inter con `next/font`); notas y promedios con fuente de ancho fijo (`tabular-nums`) y siempre con dos decimales; fechas con `Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeZone: 'America/Bogota' })`; bordes redondeados de 8 px; sin emojis; tablas convertidas en tarjetas apiladas en pantallas menores a 640 px. El resultado nunca se comunica solo con color: la insignia siempre lleva el texto "Aprobó" o "Perdió".

---

## 12. Números, fechas y zona horaria

| Regla | Implementación |
|---|---|
| Notas y promedio | Decimales con dos cifras; cálculo con céntimas enteras (sección 7) |
| Presentación de notas | Siempre dos decimales: `n.toFixed(2)` o `Intl.NumberFormat('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })` |
| Separador decimal | En la interfaz se muestra con coma (es-CO): 3,30. Los campos de entrada aceptan coma o punto y se normalizan a punto antes de enviar |
| Fecha del corte | `TIMESTAMPTZ`; se muestra en zona `America/Bogota` |
| Lectura desde BD | Parsers de `pg`: `NUMERIC` a número, marcas de tiempo a texto (sección 8.7) |
| Orden del historial y corte más reciente | Por `created_at` descendente, desempatando por `id` descendente |

No hay cálculo de "hoy" que dependa de la zona horaria para una regla de negocio (no hay vencimientos ni comparaciones de fecha), así que la zona solo afecta la presentación de la fecha del corte. Aun así se muestra en `America/Bogota` para que coincida con el momento real del registro para el usuario.

---

## 13. Seguridad e integridad

| Medida | Detalle |
|---|---|
| Acceso solo con sesión | Middleware o proxy existente y `exigirSesion()` en cada ruta de `/api/notas` (sección 1.3) |
| Base de datos cerrada al público | RLS activo sin políticas y permisos revocados a `anon` y `authenticated` |
| Validación en tres puntos | Formulario (Zod y reglas puras), API (Zod y reglas puras) y base de datos (CHECK, UNIQUE, llave foránea) |
| Cortes inmutables | No existe ruta para editarlos ni eliminarlos (RN-07) |
| Promedio y resultado fijados al registrar | Se calculan y guardan en el corte; el historial no cambia si luego se ajustara una constante |
| SQL parametrizado | Ningún valor se concatena en una consulta |
| Umbral y pesos en configuración | Un solo lugar para ajustarlos |
| Errores internos | Se registran con `console.error` en el servidor; el usuario recibe `ERROR_INTERNO` sin detalles técnicos |

---

## 14. Pruebas

### 14.1 Pruebas unitarias de reglas (Vitest)

| ID | Función | Entrada | Resultado esperado |
|---|---|---|---|
| T-01 | `calcularPromedio` | 3.30, 3.30, 3.30 | 3.30 |
| T-02 | `calcularPromedio` | 2.00, 3.00, 4.00 | 3.25 |
| T-03 | `calcularPromedio` | 3.00, 3.00, 3.50 | 3.25 |
| T-04 | `calcularPromedio` | 5.00, 5.00, 5.00 | 5.00 |
| T-05 | `calcularPromedio` | 0.00, 0.00, 0.00 | 0.00 |
| T-06 | `calcularPromedio` | 4.00, 4.00, 3.00 | 3.50 |
| T-07 | `calcularPromedio` | 3.40, 3.40, 3.25 | 3.33 |
| T-08 | `calcularPromedio` | 1.50, 2.50, 5.00 | 3.50 |
| T-09 | `determinarResultado` | 3.30 | `Aprobó` (frontera, `>=`) |
| T-10 | `determinarResultado` | 3.29 | `Perdió` |
| T-11 | `determinarResultado` | 3.25 | `Perdió` |
| T-12 | `determinarResultado` | 5.00 | `Aprobó` |
| T-13 | `determinarResultado` | 0.00 | `Perdió` |
| T-14 | `esNotaValida` | -0.1 | `false` |
| T-15 | `esNotaValida` | 5.1 | `false` |
| T-16 | `esNotaValida` | 0 / 5 / 3.3 | `true` |
| T-17 | `validarNotas` | parcial1 = 6 | `DATOS_INVALIDOS` |
| T-18 | `validarNotas` | examenFinal = -1 | `DATOS_INVALIDOS` |
| T-19 | `validarNotas` | 3.3, 3.3, 3.3 | sin error |
| T-20 | `validarNombre` | "  " (vacío tras recortar) | `DATOS_INVALIDOS` |
| T-21 | `validarNombre` | "A" (1 carácter) | `DATOS_INVALIDOS` |
| T-22 | `validarNombre` | "Ana" | sin error |
| T-23 | `normalizarNombre` | "  Ana   María " | "Ana María" |
| T-24 | `calcularPromedio` + `determinarResultado` | 3.40, 3.40, 3.25 → 3.33 | `Aprobó` (el redondeo no baja de 3.30) |

Comando: `npm test`. Las 24 pruebas deben pasar antes de continuar con la fase 3.

### 14.2 Prueba de flujo contra la base de datos

`scripts/probar-flujo.ts` (`npm run probar:flujo`) usa `dataService` con nombres `Prueba *`. Imprime `OK` o `FALLA` por paso y limpia al final.

| Paso | Operación | Esperado |
|---|---|---|
| 1 | Crear estudiante "Prueba Ana" | Creado |
| 2 | Crear "prueba ana" (minúscula) | `NOMBRE_DUPLICADO` |
| 3 | Crear estudiante con nombre "  " | `DATOS_INVALIDOS` |
| 4 | Registrar corte de "Prueba Ana": 3.30, 3.30, 3.30 | Promedio 3.30, Aprobó |
| 5 | Registrar corte: 2.00, 3.00, 4.00 | Promedio 3.25, Perdió |
| 6 | Registrar corte con nota 6.0 | `DATOS_INVALIDOS` |
| 7 | Registrar corte para un id inexistente | `ESTUDIANTE_NO_ENCONTRADO` |
| 8 | Consultar el historial de "Prueba Ana" | Dos cortes, el más reciente primero (3.25) |
| 9 | Crear "Prueba Beto"; corte 5.00, 5.00, 5.00 | Promedio 5.00, Aprobó |
| 10 | Crear "Prueba Caro"; corte 1.00, 1.00, 1.00 | Promedio 1.00, Perdió |
| 11 | Extremos del grupo | Más alto: Prueba Beto (5.00); más bajo: Prueba Caro (1.00) |
| 12 | Registrar para "Prueba Caro" un segundo corte 5.00, 5.00, 5.00; recalcular extremos | Más alto: empate entre Prueba Beto y Prueba Caro (ambos 5.00) |
| 13 | Desactivar "Prueba Beto"; recalcular extremos | Prueba Beto ya no aparece en el grupo |
| 14 | Intentar eliminar "Prueba Ana" (tiene cortes) por una vía que use ON DELETE RESTRICT | Falla controlada; se usa desactivar en su lugar |

### 14.3 Aceptación (criterio de terminado)

Se ejecuta en el despliegue de Vercel y se documenta en `doc/ACEPTACION.md`.

| ID | Acción | Resultado esperado |
|---|---|---|
| A-01 | Abrir `/notas` sin sesión | Redirección al login |
| A-02 | Registrar al estudiante "Ana Pérez" | Aparece en la lista |
| A-03 | Registrar otra vez "ana pérez" | Rechazo por nombre duplicado |
| A-04 | Intentar registrar un estudiante sin nombre | Rechazo con mensaje |
| A-05 | Registrar un corte de Ana: 3.30, 3.30, 3.30 | Promedio 3,30, Aprobó |
| A-06 | Registrar un corte de Ana: 2.00, 3.00, 4.00 | Promedio 3,25, Perdió |
| A-07 | Intentar un corte con una nota de 6.0 | Rechazo con mensaje |
| A-08 | Ver la vista previa del promedio mientras se escriben las notas | El promedio y el resultado cambian en vivo |
| A-09 | Consultar el historial de Ana | Dos cortes, el más reciente primero |
| A-10 | Registrar a "Beto" con un corte 5.00, 5.00, 5.00 y a "Caro" con 1.00, 1.00, 1.00 | Ambos con su promedio |
| A-11 | Ver el máximo y el mínimo del grupo (F5) | Beto el más alto, Caro el más bajo |
| A-12 | Registrar un corte de Caro 5.00, 5.00, 5.00 y volver a ver el grupo (F5) | Empate en el más alto: Beto y Caro |
| A-13 | Desactivar a Beto | Sale de la lista activa y del grupo; su historial se conserva si se incluyen inactivos |
| A-14 | Cerrar el navegador y volver a entrar | Los datos persisten |

A-11 y A-12 corresponden a F5; se verifican tras P08.

---

## 15. Plan de ejecución

| Fase | Prompt | Resultado | Cierre |
|---|---|---|---|
| 0 · Preparación | P00 | `ESTADO_ACTUAL.md`, `copilot-instructions.md`, `ESTADO_EJECUCION.md`; compilación de base verificada | `FASE_0_COMPLETADA.md` |
| 1 · Base de datos | P01 | M1 y M2 aplicadas; `npm run db:verificar` sin fallas | `FASE_1_COMPLETADA.md` |
| 2 · Reglas | P02 | `lib/config`, `lib/reglas`, 24 pruebas en verde | `FASE_2_COMPLETADA.md` |
| 3 · Servidor | P03 | Conexión, sesión, respuestas, esquemas, formato; `/api/notas/sesion` protegido | `FASE_3_COMPLETADA.md` |
| 4 · Datos y API | P04, P05 | `lib/datos/*`, `dataService`, rutas; `npm run probar:flujo` sin fallas | `FASE_4_COMPLETADA.md` |
| 5 · Interfaz | P06, P07 | Componentes base, navegación, estudiantes, historial, registro de corte con vista previa | `FASE_5_COMPLETADA.md` |
| 6 · Aceptación | (en P07) | `ACEPTACION.md` con A-01 a A-10, A-13, A-14; README | `FASE_6_COMPLETADA.md` |
| 7 · Opcional | P08 | Máximo y mínimo del grupo, con empates | `FASE_7_COMPLETADA.md` |

Condiciones entre fases:

- No se inicia una fase si la anterior no tiene su archivo de cierre.
- `npm run build` debe terminar sin errores al final de cada prompt.
- `npm test` debe pasar al final de cada prompt desde P02.
- Cada prompt termina con un commit del estudiante y un `git push`; Vercel despliega en cada push y un fallo de despliegue se corrige antes del siguiente prompt.

---

## 16. Funcionalidades opcionales

Se construyen solo con la fase 6 cerrada.

| Prompt | Funcionalidad | Implementación |
|---|---|---|
| P08 | F5 · Máximo y mínimo del grupo | `lib/datos/grupo.ts` `obtenerExtremosGrupo` consulta `v_ultimo_corte` (el corte más reciente de cada estudiante activo con cortes), encuentra el promedio máximo y el mínimo y devuelve **todos** los estudiantes que empatan en cada extremo (RN-08, RN-09). `GET /api/notas/grupo`; `components/notas/PanelGrupo.tsx` en `/notas`: dos tarjetas (más alto, más bajo) que listan uno o varios nombres con su promedio; si no hay estudiantes con cortes, un estado vacío. |

Prueba adicional de F5: T-25 a T-27 sobre `obtenerExtremosGrupo` usando datos sembrados (máximo único, mínimo único, empate en el máximo), verificadas en la prueba de flujo (pasos 11 y 12) por depender de la base de datos.

---

## 17. Glosario

| Término | Definición |
|---|---|
| Corte | Registro de las tres notas de un momento, con su promedio y resultado; forma el historial del estudiante |
| Promedio ponderado | Parcial 1 × 25 % + parcial 2 × 25 % + examen final × 50 % |
| Resultado | "Aprobó" si el promedio es ≥ 3.3; "Perdió" si es menor |
| Historial | Todos los cortes de un estudiante, del más reciente al más antiguo |
| Corte más reciente | El corte con el `created_at` más alto de un estudiante |
| Grupo | Los estudiantes activos con al menos un corte, para el máximo y el mínimo |
| Céntima | Centésima de nota; 3.30 son 330 céntimas (se usa para calcular sin error de redondeo) |
| Regla pura | Función de `lib/reglas/` que solo depende de sus parámetros |
| Transacción | Conjunto de escrituras que se confirma completo o se revierte completo |
| Copilot en modo Agente | Modo de GitHub Copilot Chat que lee el repositorio, edita varios archivos y ejecuta comandos de terminal con aprobación |
