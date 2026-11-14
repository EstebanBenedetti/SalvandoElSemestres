# Aceptación del módulo mínimo · NotaFlux

| ID | Acción | Resultado esperado | Resultado obtenido | Evidencia | Observación |
|---|---|---|---|---|---|
| A-01 | Inicio de sesión con credenciales válidas | Redirección a /notas y acceso al módulo | Verificado en flujo E2E autenticado | `e2e/flujo/flujo-academico.spec.ts`; job `authenticated-flow` de CI | PostgreSQL aislado; no equivale a producción |
| A-02 | Acceso sin sesión a /notas | Redirección al login | Verificado en E2E smoke | `e2e/acceso.spec.ts`; job `quality` de CI | Evidencia automatizada |
| A-03 | Lista de estudiantes con cortes | Se muestran estudiantes y último promedio | Verificado en navegador durante P06 | `doc/ESTADO_EJECUCION.md`, sección P06 | Se observaron cinco estudiantes demo |
| A-04 | Crear estudiante con nombre válido | Registrado y redirige al historial | Verificado en flujo E2E autenticado | `e2e/flujo/flujo-academico.spec.ts` | El flujo crea y elimina sus datos de prueba |
| A-05 | Intentar estudiante duplicado | Error de nombre duplicado | Verificado en navegador durante P06 | `doc/ESTADO_EJECUCION.md`, sección P06 | Prueba manual registrada |
| A-06 | Buscar estudiante por nombre | La lista se filtra correctamente | Verificado en navegador durante P06 | `doc/ESTADO_EJECUCION.md`, sección P06 | También se comprobó el estado sin resultados |
| A-07 | Registrar corte con notas válidas | Se guarda y se calcula el promedio | Verificado en flujo E2E autenticado | `e2e/flujo/flujo-academico.spec.ts` | Se comprobó promedio 3,00 y resultado Aprobó |
| A-08 | Registrar corte con nota fuera de rango | Se rechaza con 400 | Verificado mediante API autenticada | `doc/ESTADO_EJECUCION.md`, sección P05 | Nota 6 rechazada como `DATOS_INVALIDOS` |
| A-09 | Historial de cortes | Se listan por fecha descendente | Parcial: historial consultado en E2E; el orden no se afirma como validado en ese flujo | `e2e/flujo/flujo-academico.spec.ts` | Agregar una aserción explícita del orden descendente |
| A-10 | Desactivar estudiante con cortes | Se desactiva y mantiene el historial | Verificado en navegador durante P06 | `doc/ESTADO_EJECUCION.md`, sección P06 | Prueba manual registrada |
| A-11 | Máximo del grupo | Muestra el o los estudiantes con mayor promedio | Verificado durante P08 | `doc/ESTADO_EJECUCION.md`, sección P08; `src/components/notas/PanelGrupo.test.tsx` | Opcional, P08 |
| A-12 | Mínimo del grupo | Muestra el o los estudiantes con menor promedio | Verificado durante P08 | `doc/ESTADO_EJECUCION.md`, sección P08; `src/components/notas/PanelGrupo.test.tsx` | Opcional, P08 |
| A-13 | Despliegue en Vercel | Funcionamiento del módulo mínimo en producción | Pendiente | Requiere identificar el proyecto Vercel canónico y validar la URL desplegada | No se ha registrado una prueba de producción |
| A-14 | Verificación final de la aceptación | Cierre del módulo mínimo con evidencia | Pendiente | Completar después de A-09 y A-13 | No declarar aceptación final antes de validar producción |

> Nota: A-11 y A-12 corresponden a la funcionalidad opcional del prompt P08.
> La evidencia local, manual o de CI no sustituye la verificación del despliegue en producción.
