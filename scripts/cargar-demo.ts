import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { crearEstudiante, registrarCorte } from "@/lib/dataService";
import { pool } from "@/lib/db/conexion";

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function limpiarDemo(): void {
  execFileSync(process.execPath, [path.join(raiz, "scripts", "limpiar-prueba.mjs"), "--demo"], {
    cwd: raiz,
    stdio: "inherit",
    env: process.env,
  });
}

async function main(): Promise<void> {
  limpiarDemo();
  const estudiantes = [
    {
      nombre: "Demo Ana",
      cortes: [
        [4, 3.8, 4],
        [3, 3, 3],
      ],
    },
    { nombre: "Demo Beto", cortes: [[5, 5, 5]] },
    {
      nombre: "Demo Carla",
      cortes: [
        [1, 2, 2],
        [2, 3, 4],
      ],
    },
    { nombre: "Demo Diego", cortes: [[2, 2, 2]] },
    { nombre: "Demo Elena", cortes: [[5, 5, 5]] },
  ] as const;

  try {
    const filas: Array<{ nombre: string; promedio: number; resultado: string }> = [];
    for (const estudiante of estudiantes) {
      const { id } = await crearEstudiante(estudiante.nombre);
      let ultimoPromedio = 0;
      let ultimoResultado = "";
      for (const [parcial1, parcial2, examenFinal] of estudiante.cortes) {
        const corte = await registrarCorte({ estudianteId: id, parcial1, parcial2, examenFinal });
        ultimoPromedio = corte.promedio;
        ultimoResultado = corte.resultado;
      }
      filas.push({
        nombre: estudiante.nombre,
        promedio: ultimoPromedio,
        resultado: ultimoResultado,
      });
    }
    console.table(filas);
  } catch (error) {
    limpiarDemo();
    throw error;
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error("No se pudieron cargar los datos demo:", error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
