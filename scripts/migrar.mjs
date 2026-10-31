import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const { Pool } = pg;
const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const carpetaMigraciones = path.join(raiz, "supabase", "migrations");
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

async function registrarMigracionesLogin(pool) {
  const client = await pool.connect();
  let transaccionIniciada = false;
  try {
    await client.query("BEGIN");
    transaccionIniciada = true;
    const resultados = await client.query(`
      SELECT
        to_regclass('public.usuarios') IS NOT NULL
          AND to_regclass('public.idx_usuarios_email_lower') IS NOT NULL
          AND EXISTS (
            SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
            WHERE n.nspname = 'public' AND p.proname = 'usuarios_set_updated_at'
          )
          AND EXISTS (
            SELECT 1 FROM pg_trigger t JOIN pg_class c ON c.oid = t.tgrelid
            JOIN pg_namespace n ON n.oid = c.relnamespace
            WHERE n.nspname = 'public' AND t.tgname = 'trg_usuarios_updated_at'
              AND NOT t.tgisinternal
          ) AS usuarios_aplicada,
        to_regclass('public.restablecimientos_contrasena') IS NOT NULL
          AND to_regclass('public.idx_restablecimientos_contrasena_usuario_id') IS NOT NULL
          AND (
            SELECT count(*) = 4 FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
            WHERE n.nspname = 'public' AND p.proname IN (
              'contar_solicitudes_rest_contrasena',
              'buscar_token_rest_contrasena_vigente',
              'marcar_token_rest_contrasena_usado',
              'completar_rest_contrasena'
            )
          ) AS restablecimientos_aplicada
    `);

    const antiguas = [
      ["usuarios.sql", resultados.rows[0].usuarios_aplicada],
      ["restablecimientos_contrasena.sql", resultados.rows[0].restablecimientos_aplicada],
    ];
    for (const [archivo, aplicada] of antiguas) {
      if (!aplicada) continue;
      const resultado = await client.query(
        "INSERT INTO _migrations (archivo) VALUES ($1) ON CONFLICT (archivo) DO NOTHING",
        [archivo],
      );
      if (resultado.rowCount) console.log(`${archivo}: registrada (esquema existente; no se ejecutó).`);
    }
    await client.query("COMMIT");
    transaccionIniciada = false;
  } catch (error) {
    if (transaccionIniciada) await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function main() {
  const pool = crearPool();
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS _migrations (
        id serial primary key,
        archivo text unique not null,
        aplicada_en timestamptz default now()
      )
    `);
    await registrarMigracionesLogin(pool);

    const archivos = (await readdir(carpetaMigraciones))
      .filter((archivo) => archivo.endsWith(".sql"))
      .sort((a, b) => a.localeCompare(b, "en"));

    for (const archivo of archivos) {
      const client = await pool.connect();
      let transaccionIniciada = false;
      try {
        await client.query("BEGIN");
        transaccionIniciada = true;
        const registrada = await client.query(
          "SELECT 1 FROM _migrations WHERE archivo = $1",
          [archivo],
        );
        if (registrada.rowCount) {
          await client.query("COMMIT");
          transaccionIniciada = false;
          console.log(`${archivo}: omitida.`);
          continue;
        }

        const sql = await readFile(path.join(carpetaMigraciones, archivo), "utf8");
        await client.query(sql);
        await client.query("INSERT INTO _migrations (archivo) VALUES ($1)", [archivo]);
        await client.query("COMMIT");
        transaccionIniciada = false;
        console.log(`${archivo}: aplicada.`);
      } catch (error) {
        if (transaccionIniciada) await client.query("ROLLBACK");
        console.error(`${archivo}: error de migración`, error.code ?? "", error.message);
        process.exitCode = 1;
        break;
      } finally {
        client.release();
      }
    }
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error("No se pudieron aplicar las migraciones:", error.code ?? "", error.message);
  process.exitCode = 1;
});
