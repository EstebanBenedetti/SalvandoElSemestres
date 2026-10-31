import { Pool, types, type PoolClient, type QueryResultRow } from "pg";

types.setTypeParser(1082, (valor) => valor);
types.setTypeParser(1114, (valor) => valor);
types.setTypeParser(1184, (valor) => valor);
types.setTypeParser(20, (valor) => Number.parseInt(valor, 10));
types.setTypeParser(1700, (valor) => Number.parseFloat(valor));

declare global {
  var poolNotas: Pool | undefined;
}

function crearPool(): Pool {
  const connectionString = process.env.POSTGRES_URL_NON_POOLING;
  if (!connectionString) {
    throw new Error("Falta configurar POSTGRES_URL_NON_POOLING.");
  }

  const url = new URL(connectionString);
  url.searchParams.delete("sslmode");

  return new Pool({
    connectionString: url.toString(),
    ssl: { rejectUnauthorized: false },
    max: 3,
    idleTimeoutMillis: 10_000,
  });
}

export const pool = globalThis.poolNotas ?? crearPool();

if (process.env.NODE_ENV !== "production") {
  globalThis.poolNotas = pool;
}

export async function consultar<T extends QueryResultRow>(
  sql: string,
  valores: unknown[] = [],
): Promise<T[]> {
  const resultado = await pool.query<T>(sql, valores);
  return resultado.rows;
}

export async function conTransaccion<T>(trabajo: (tx: PoolClient) => Promise<T>): Promise<T> {
  const tx = await pool.connect();
  let transaccionIniciada = false;

  try {
    await tx.query("BEGIN");
    transaccionIniciada = true;

    const resultado = await trabajo(tx);
    await tx.query("COMMIT");
    transaccionIniciada = false;
    return resultado;
  } catch (error) {
    if (transaccionIniciada) {
      await tx.query("ROLLBACK");
    }
    throw error;
  } finally {
    tx.release();
  }
}
