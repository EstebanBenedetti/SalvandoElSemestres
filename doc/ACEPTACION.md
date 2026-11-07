# Aceptación del módulo mínimo · NotaFlux

| ID | Acción | Resultado esperado | Resultado obtenido | Evidencia | Observación |
|---|---|---|---|---|---|
| A-01 | Inicio de sesión con credenciales válidas | Redirección a /notas y acceso al módulo |  |  |  |
| A-02 | Acceso sin sesión a /notas | Redirección al login |  |  |  |
| A-03 | Lista de estudiantes con cortes | Se muestran estudiantes y último promedio |  |  |  |
| A-04 | Crear estudiante con nombre válido | Registrado y redirige al historial |  |  |  |
| A-05 | Intentar estudiante duplicado | Error de nombre duplicado |  |  |  |
| A-06 | Buscar estudiante por nombre | La lista se filtra correctamente |  |  |  |
| A-07 | Registrar corte con notas válidas | Se guarda y se calcula el promedio |  |  |  |
| A-08 | Registrar corte con nota fuera de rango | Se rechaza con 400 |  |  |  |
| A-09 | Historial de cortes | Se listan por fecha descendente |  |  |  |
| A-10 | Desactivar estudiante con cortes | Se desactiva y mantiene el historial |  |  |  |
| A-11 | Máximo del grupo | Muestra el o los estudiantes con mayor promedio |  |  | Opcional, P08 |
| A-12 | Mínimo del grupo | Muestra el o los estudiantes con menor promedio |  |  | Opcional, P08 |
| A-13 | Despliegue en Vercel | Funcionamiento del módulo mínimo en producción |  |  |  |
| A-14 | Verificación final de la aceptación | Cierre del módulo mínimo con evidencia |  |  |  |

> Nota: A-11 y A-12 corresponden a la funcionalidad opcional del prompt P08.
