import pg from "pg";

const { Pool } = pg;
const variableConexion = "POSTGRES_URL_NON_POOLING";
const argumentosValidos = new Set(["--prueba", "--demo"]);

function obtenerPrefijos(argumentos) {
  const desconocidos = argumentos.filter((argumento) => !argumentosValidos.has(argumento));
  if (desconocidos.length > 0) {
    throw new Error(`Opción no reconocida: ${desconocidos.join(", ")}`);
  }

  const seleccion = argumentos.length === 0 ? argumentosValidos : new Set(argumentos);
  return [...seleccion].map((argumento) => `${argumento.slice(2).toLowerCase()}%`);
}

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
  const prefijos = obtenerPrefijos(process.argv.slice(2));
  const pool = crearPool();
  let tx;
  let transaccionIniciada = false;

  try {
    tx = await pool.connect();
    await tx.query("BEGIN");
    transaccionIniciada = true;
    const cortes = await tx.query(
      `DELETE FROM cortes c
       USING estudiantes e
       WHERE c.estudiante_id = e.id
         AND lower(e.nombre) LIKE ANY($1::text[])
       RETURNING c.id`,
      [prefijos],
    );
    const estudiantes = await tx.query(
      `DELETE FROM estudiantes
       WHERE lower(nombre) LIKE ANY($1::text[])
       RETURNING id`,
      [prefijos],
    );
    await tx.query("COMMIT");
    transaccionIniciada = false;
    console.log(
      `Limpieza completada: ${cortes.rowCount ?? 0} cortes y ${estudiantes.rowCount ?? 0} estudiantes eliminados.`,
    );
  } catch (error) {
    if (transaccionIniciada) await tx.query("ROLLBACK");
    throw error;
  } finally {
    tx?.release();
    await pool.end();
  }
}

main().catch((error) => {
  console.error("No se pudieron limpiar los datos de prueba:", error.code ?? "", error.message);
  process.exitCode = 1;
});
