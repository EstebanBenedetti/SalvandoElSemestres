import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  crearEstudiante,
  desactivarEstudiante,
  obtenerEstudiante,
  obtenerExtremosGrupo,
  registrarCorte,
} from "@/lib/dataService";
import { pool } from "@/lib/db/conexion";
import { ErrorDeNegocio, type CodigoError } from "@/lib/reglas/errores";

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
let fallas = 0;
let idAna: string | null = null;
let idBeto: string | null = null;
let idCaro: string | null = null;

function limpiarDatos(): void {
  execFileSync(
    process.execPath,
    [path.join(raiz, "scripts", "limpiar-prueba.mjs"), "--prueba", "--demo"],
    { cwd: raiz, stdio: "inherit", env: process.env },
  );
}

async function paso(numero: number, nombre: string, accion: () => Promise<void>): Promise<void> {
  try {
    await accion();
    console.log(`OK ${numero}. ${nombre}`);
  } catch (error) {
    fallas += 1;
    console.error(`FALLA ${numero}. ${nombre}:`, error instanceof Error ? error.message : error);
  }
}

function exigirId(id: string | null, nombre: string): string {
  if (!id) throw new Error(`No se creó ${nombre} en el paso esperado.`);
  return id;
}

async function esperarError(codigo: CodigoError, accion: () => Promise<unknown>): Promise<void> {
  try {
    await accion();
  } catch (error) {
    if (error instanceof ErrorDeNegocio && error.codigo === codigo) return;
    throw new Error(`Se esperaba ${codigo}, pero se recibió ${error instanceof Error ? error.message : error}.`);
  }
  throw new Error(`Se esperaba el error ${codigo}, pero la operación terminó correctamente.`);
}

async function comprobarRestriccionDeEliminacion(estudianteId: string): Promise<void> {
  const tx = await pool.connect();
  let transaccionIniciada = false;
  try {
    await tx.query("BEGIN");
    transaccionIniciada = true;
    await tx.query("SAVEPOINT comprobar_restrict");

    let codigo: string | undefined;
    try {
      await tx.query("DELETE FROM estudiantes WHERE id = $1", [estudianteId]);
    } catch (error) {
      if (typeof error === "object" && error !== null && "code" in error && typeof error.code === "string") {
        codigo = error.code;
      }
    }
    await tx.query("ROLLBACK TO SAVEPOINT comprobar_restrict");
    await tx.query("RELEASE SAVEPOINT comprobar_restrict");
    if (codigo !== "23503") {
      throw new Error(`Se esperaba la restricción ON DELETE RESTRICT (23503), se recibió ${codigo ?? "ningún error"}.`);
    }
    await tx.query("COMMIT");
    transaccionIniciada = false;
  } catch (error) {
    if (transaccionIniciada) await tx.query("ROLLBACK");
    throw error;
  } finally {
    tx.release();
  }
}

async function ejecutar(): Promise<void> {
  try {
    limpiarDatos();
    await paso(1, "crear Prueba Ana", async () => {
      idAna = (await crearEstudiante("Prueba Ana")).id;
      if (!idAna) throw new Error("La creación no devolvió un identificador.");
    });

    await paso(2, "rechazar nombre duplicado sin distinguir mayúsculas", async () => {
      await esperarError("NOMBRE_DUPLICADO", () => crearEstudiante("prueba ana"));
    });

    await paso(3, "rechazar nombre vacío", async () => {
      await esperarError("DATOS_INVALIDOS", () => crearEstudiante("  "));
    });

    await paso(4, "registrar corte aprobado de 3.30", async () => {
      const corte = await registrarCorte({
        estudianteId: exigirId(idAna, "Prueba Ana"),
        parcial1: 3.3,
        parcial2: 3.3,
        examenFinal: 3.3,
      });
      if (corte.promedio !== 3.3 || corte.resultado !== "Aprobó") {
        throw new Error(`Resultado inesperado: ${corte.promedio}, ${corte.resultado}.`);
      }
    });

    await paso(5, "registrar corte con promedio 3.25", async () => {
      const corte = await registrarCorte({
        estudianteId: exigirId(idAna, "Prueba Ana"),
        parcial1: 2,
        parcial2: 3,
        examenFinal: 4,
      });
      if (corte.promedio !== 3.25 || corte.resultado !== "Perdió") {
        throw new Error(`Resultado inesperado: ${corte.promedio}, ${corte.resultado}.`);
      }
    });

    await paso(6, "rechazar nota fuera de rango", async () => {
      await esperarError("DATOS_INVALIDOS", () =>
        registrarCorte({
          estudianteId: exigirId(idAna, "Prueba Ana"),
          parcial1: 6,
          parcial2: 3,
          examenFinal: 4,
        }),
      );
    });

    await paso(7, "rechazar corte de estudiante inexistente", async () => {
      await esperarError("ESTUDIANTE_NO_ENCONTRADO", () =>
        registrarCorte({
          estudianteId: "00000000-0000-4000-8000-000000000000",
          parcial1: 3,
          parcial2: 3,
          examenFinal: 3,
        }),
      );
    });

    await paso(8, "consultar historial en orden descendente", async () => {
      const detalle = await obtenerEstudiante(exigirId(idAna, "Prueba Ana"));
      if (
        detalle.cortes.length !== 2 ||
        detalle.cortes[0]?.promedio !== 3.25 ||
        detalle.estudiante.totalCortes !== 2
      ) {
        throw new Error("El historial no contiene los dos cortes en el orden esperado.");
      }
    });

    await paso(9, "crear Prueba Beto con promedio 5.00", async () => {
      idBeto = (await crearEstudiante("Prueba Beto")).id;
      const corte = await registrarCorte({
        estudianteId: exigirId(idBeto, "Prueba Beto"),
        parcial1: 5,
        parcial2: 5,
        examenFinal: 5,
      });
      if (corte.promedio !== 5 || corte.resultado !== "Aprobó") {
        throw new Error("Prueba Beto no obtuvo 5.00 y Aprobó.");
      }
    });

    await paso(10, "crear Prueba Caro con promedio 1.00", async () => {
      idCaro = (await crearEstudiante("Prueba Caro")).id;
      const corte = await registrarCorte({
        estudianteId: exigirId(idCaro, "Prueba Caro"),
        parcial1: 1,
        parcial2: 1,
        examenFinal: 1,
      });
      if (corte.promedio !== 1 || corte.resultado !== "Perdió") {
        throw new Error("Prueba Caro no obtuvo 1.00 y Perdió.");
      }
    });

    await paso(11, "identificar máximo y mínimo del grupo", async () => {
      const extremos = await obtenerExtremosGrupo();
      if (
        !extremos.masAltos.some((fila) => fila.nombre === "Prueba Beto" && fila.promedio === 5) ||
        !extremos.masBajos.some((fila) => fila.nombre === "Prueba Caro" && fila.promedio === 1)
      ) {
        throw new Error("Los extremos del grupo no incluyen a Prueba Beto (5.00) y Prueba Caro (1.00).");
      }
    });

    await paso(12, "detectar empate en el promedio máximo", async () => {
      await registrarCorte({
        estudianteId: exigirId(idCaro, "Prueba Caro"),
        parcial1: 5,
        parcial2: 5,
        examenFinal: 5,
      });
      const extremos = await obtenerExtremosGrupo();
      const nombres = new Set(extremos.masAltos.map((fila) => fila.nombre));
      if (!nombres.has("Prueba Beto") || !nombres.has("Prueba Caro")) {
        throw new Error("No se detectó el empate entre Prueba Beto y Prueba Caro.");
      }
    });

    await paso(13, "excluir del grupo al estudiante desactivado", async () => {
      await desactivarEstudiante(exigirId(idBeto, "Prueba Beto"));
      const extremos = await obtenerExtremosGrupo();
      if (
        extremos.masAltos.some((fila) => fila.nombre === "Prueba Beto") ||
        !extremos.masAltos.some((fila) => fila.nombre === "Prueba Caro")
      ) {
        throw new Error("El estudiante desactivado aparece en el grupo o falta Prueba Caro.");
      }
    });

    await paso(14, "comprobar ON DELETE RESTRICT y conservar el estudiante", async () => {
      await comprobarRestriccionDeEliminacion(exigirId(idAna, "Prueba Ana"));
    });
  } finally {
    try {
      limpiarDatos();
    } finally {
      await pool.end();
    }
  }

  console.log(`Resultado de la prueba de flujo: ${14 - fallas} OK, ${fallas} fallas.`);
  if (fallas > 0) process.exitCode = 1;
}

ejecutar().catch(async (error) => {
  console.error("No se pudo completar la prueba de flujo:", error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
