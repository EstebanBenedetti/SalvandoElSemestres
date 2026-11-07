import pg from "pg";

const { Pool } = pg;
const variableConexion = "POSTGRES_URL_NON_POOLING";

function crearPool() {
  const cadena = process.env[variableConexion];
  if (!cadena) throw new Error(`Falta configurar ${variableConexion}.`);

  const url = new URL(cadena);
  url.searchParams.delete("sslmode");
  return new Pool({
    connectionString: url.toString(),
    ssl: { rejectUnauthorized: false },
    max: 1,
    connectionTimeoutMillis: 10_000,
  });
}

async function main() {
  const pool = crearPool();
  let fallas = 0;
  const informar = (mensaje) => console.log(mensaje);
  const registrarFalla = (mensaje) => {
    fallas += 1;
    informar(`FALLA: ${mensaje}`);
  };

  try {
    const objetos = await pool.query(`
      SELECT
        to_regclass('public.estudiantes') IS NOT NULL AS estudiantes,
        to_regclass('public.cortes') IS NOT NULL AS cortes,
        to_regclass('public.v_ultimo_corte') IS NOT NULL AS vista
    `);
    const existen = objetos.rows[0];
    informar(`Existencia: estudiantes=${existen.estudiantes ? "sí" : "no"}, cortes=${existen.cortes ? "sí" : "no"}, v_ultimo_corte=${existen.vista ? "sí" : "no"}`);
    for (const [nombre, existe] of Object.entries({
      estudiantes: existen.estudiantes,
      cortes: existen.cortes,
      v_ultimo_corte: existen.vista,
    })) {
      if (!existe) registrarFalla(`no existe ${nombre}`);
    }

    const columnaAutor = await pool.query(`
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'cortes'
        AND column_name = 'registrado_por'
    `);
    informar(`Autoría de cortes: ${columnaAutor.rowCount ? "disponible" : "falta migración 0003"}`);
    if (!columnaAutor.rowCount) registrarFalla("falta la columna cortes.registrado_por (migración 0003)");

    for (const tabla of ["estudiantes", "cortes"]) {
      if (!existen[tabla]) {
        informar(`Filas ${tabla}: no disponible`);
        continue;
      }
      const filas = await pool.query(`SELECT count(*)::text AS total FROM public.${tabla}`);
      informar(`Filas ${tabla}: ${filas.rows[0].total}`);
    }

    const restricciones = await pool.query(`
      SELECT c.relname AS tabla, con.conname AS nombre,
             pg_get_constraintdef(con.oid) AS definicion
      FROM pg_constraint con
      JOIN pg_class c ON c.oid = con.conrelid
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public' AND c.relname IN ('estudiantes', 'cortes')
      ORDER BY c.relname, con.conname
    `);
    informar("Restricciones:");
    for (const restriccion of restricciones.rows) {
      informar(`  ${restriccion.tabla}.${restriccion.nombre}: ${restriccion.definicion}`);
    }
    const nombresRestricciones = new Set(restricciones.rows.map((r) => `${r.tabla}.${r.nombre}`));
    const requeridas = [
      "estudiantes.estudiantes_nombre_minimo",
      "cortes.cortes_parcial1_rango",
      "cortes.cortes_parcial2_rango",
      "cortes.cortes_final_rango",
      "cortes.cortes_promedio_rango",
      "cortes.cortes_resultado_valido",
      "cortes.cortes_estudiante_id_fkey",
    ];
    for (const nombre of requeridas) {
      if (!nombresRestricciones.has(nombre)) registrarFalla(`falta la restricción ${nombre}`);
    }

    const indice = await pool.query(`
      SELECT indexdef FROM pg_indexes
      WHERE schemaname = 'public' AND indexname = 'ux_estudiantes_nombre'
    `);
    informar(`Índice ux_estudiantes_nombre: ${indice.rowCount ? indice.rows[0].indexdef : "no existe"}`);
    if (!indice.rowCount || !indice.rows[0].indexdef.includes("UNIQUE")) {
      registrarFalla("falta el índice único ux_estudiantes_nombre");
    }

    const rls = await pool.query(`
      SELECT c.relname, c.relrowsecurity
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public' AND c.relname IN ('estudiantes', 'cortes')
      ORDER BY c.relname
    `);
    for (const tabla of ["estudiantes", "cortes"]) {
      const fila = rls.rows.find((row) => row.relname === tabla);
      informar(`RLS ${tabla}: ${fila?.relrowsecurity ? "activo" : "inactivo"}`);
      if (!fila?.relrowsecurity) registrarFalla(`RLS no está activo en ${tabla}`);
    }

    if (existen.estudiantes && existen.cortes && existen.vista) {
      const client = await pool.connect();
      let transaccionIniciada = false;
      let estudianteId = null;
      let numeroSavepoint = 0;
      try {
        await client.query("BEGIN");
        transaccionIniciada = true;

        await client.query("SAVEPOINT caso_estudiante_valido");
        try {
          const insertado = await client.query(
            "INSERT INTO estudiantes (nombre) VALUES ($1) RETURNING id",
            ["Verif Ana"],
          );
          estudianteId = insertado.rows[0].id;
          await client.query("RELEASE SAVEPOINT caso_estudiante_valido");
          informar("OK: a) estudiante Verif Ana aceptado");
        } catch (error) {
          await client.query("ROLLBACK TO SAVEPOINT caso_estudiante_valido");
          await client.query("RELEASE SAVEPOINT caso_estudiante_valido");
          registrarFalla(`a) insertar estudiante Verif Ana: ${error.code ?? ""} ${error.message}`);
        }

        async function probarRechazo(nombre, codigoEsperado, restriccionEsperada, ejecutar) {
          const savepoint = `sp_rechazo_${numeroSavepoint++}`;
          await client.query(`SAVEPOINT ${savepoint}`);
          let errorReal = null;
          try {
            await ejecutar();
          } catch (error) {
            errorReal = error;
          }
          await client.query(`ROLLBACK TO SAVEPOINT ${savepoint}`);
          await client.query(`RELEASE SAVEPOINT ${savepoint}`);
          const coincide =
            errorReal?.code === codigoEsperado &&
            (!restriccionEsperada || errorReal.constraint === restriccionEsperada);
          if (coincide) {
            informar(`OK: ${nombre} rechazado con ${errorReal.code}${errorReal.constraint ? ` (${errorReal.constraint})` : ""}`);
          } else if (errorReal) {
            registrarFalla(`${nombre}: esperado ${codigoEsperado}${restriccionEsperada ? `/${restriccionEsperada}` : ""}, recibido ${errorReal.code ?? ""}/${errorReal.constraint ?? ""}`);
          } else {
            registrarFalla(`${nombre}: se aceptó una entrada inválida`);
          }
        }

        await probarRechazo("b) nombre duplicado (RN-02)", "23505", "ux_estudiantes_nombre", async () => {
          await client.query("INSERT INTO estudiantes (nombre) VALUES ($1)", ["verif ana"]);
        });
        await probarRechazo("c) nombre en blanco (RN-01)", "23514", "estudiantes_nombre_minimo", async () => {
          await client.query("INSERT INTO estudiantes (nombre) VALUES ($1)", [" "]);
        });

        const idPrueba = estudianteId ?? "00000000-0000-0000-0000-000000000001";
        await probarRechazo("d) parcial1 fuera de rango (RN-03)", "23514", "cortes_parcial1_rango", async () => {
          await client.query(
            "INSERT INTO cortes (estudiante_id, parcial1, parcial2, examen_final, promedio, resultado) VALUES ($1, 6, 3, 3, 3.75, 'Aprobó')",
            [idPrueba],
          );
        });
        await probarRechazo("e) examen_final fuera de rango", "23514", "cortes_final_rango", async () => {
          await client.query(
            "INSERT INTO cortes (estudiante_id, parcial1, parcial2, examen_final, promedio, resultado) VALUES ($1, 3, 3, -1, 1.00, 'Perdió')",
            [idPrueba],
          );
        });
        // El CAST explícito limita la entrada a VARCHAR(7) para ejercitar el CHECK.
        await probarRechazo("f) resultado inválido", "23514", "cortes_resultado_valido", async () => {
          await client.query(
            "INSERT INTO cortes (estudiante_id, parcial1, parcial2, examen_final, promedio, resultado) VALUES ($1, 3, 3, 3, 3.00, CAST('Pendiente' AS varchar(7)))",
            [idPrueba],
          );
        });

        if (!estudianteId) {
          registrarFalla("g) no se pudo comprobar el corte más reciente sin estudiante de prueba");
        } else {
          const primero = await client.query(
            "INSERT INTO cortes (estudiante_id, parcial1, parcial2, examen_final, promedio, resultado) VALUES ($1, 3.00, 3.00, 3.00, 3.00, 'Aprobó') RETURNING id",
            [estudianteId],
          );
          const segundo = await client.query(
            "INSERT INTO cortes (estudiante_id, parcial1, parcial2, examen_final, promedio, resultado) VALUES ($1, 2.90, 2.90, 2.90, 2.90, 'Perdió') RETURNING id",
            [estudianteId],
          );
          const ultimo = await client.query(
            "SELECT corte_id, promedio, resultado FROM v_ultimo_corte WHERE estudiante_id = $1",
            [estudianteId],
          );
          const coincide =
            ultimo.rowCount === 1 &&
            ultimo.rows[0].corte_id === segundo.rows[0].id &&
            ultimo.rows[0].corte_id !== primero.rows[0].id &&
            Number(ultimo.rows[0].promedio) === 2.9 &&
            ultimo.rows[0].resultado === "Perdió";
          if (coincide) {
            informar("OK: g) v_ultimo_corte devuelve el segundo corte");
          } else {
            registrarFalla(`g) v_ultimo_corte no devolvió el segundo corte; obtuvo ${JSON.stringify(ultimo.rows[0] ?? null)}`);
          }
        }
      } catch (error) {
        registrarFalla(`pruebas transaccionales: ${error.code ?? ""} ${error.message}`);
      } finally {
        if (transaccionIniciada) {
          try {
            await client.query("ROLLBACK");
            informar("Transacción de pruebas: ROLLBACK completado");
          } catch (error) {
            registrarFalla(`no se pudo completar ROLLBACK: ${error.code ?? ""} ${error.message}`);
          }
        }
        client.release();
      }
    } else {
      registrarFalla("se omitieron las pruebas transaccionales porque faltan objetos del módulo");
    }
  } finally {
    await pool.end();
  }

  informar(`Total de fallas: ${fallas}`);
  if (fallas) process.exitCode = 1;
}

main().catch((error) => {
  console.error("No se pudo verificar la base de datos:", error.code ?? "", error.message);
  process.exitCode = 1;
});
