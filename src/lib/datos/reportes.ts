import "server-only";
import type { QueryResultRow } from "pg";
import { consultar } from "@/lib/db/conexion";
import { traducirErrorBaseDatos } from "@/lib/datos/errores";
import type { Corte, RegistroNotaReporte } from "@/lib/datos/tipos";
import type { Resultado } from "@/lib/reglas/nota";

interface FilaReporte extends QueryResultRow {
  estudiante_id: string;
  nombre: string;
  activo: boolean;
  corte_id: number | null;
  registrado_por: string | null;
  parcial1: number | null;
  parcial2: number | null;
  examen_final: number | null;
  promedio: number | null;
  resultado: Resultado | null;
  created_at: string | null;
}

function mapearCorte(fila: FilaReporte): Corte | null {
  if (fila.corte_id === null) return null;
  if (
    fila.parcial1 === null ||
    fila.parcial2 === null ||
    fila.examen_final === null ||
    fila.promedio === null ||
    fila.resultado === null ||
    fila.created_at === null
  ) {
    throw new Error("El corte del reporte tiene datos incompletos.");
  }

  return {
    id: fila.corte_id,
    estudianteId: fila.estudiante_id,
    registradoPor: fila.registrado_por,
    parcial1: fila.parcial1,
    parcial2: fila.parcial2,
    examenFinal: fila.examen_final,
    promedio: fila.promedio,
    resultado: fila.resultado,
    fecha: fila.created_at,
  };
}

export async function listarNotasReporte(): Promise<RegistroNotaReporte[]> {
  try {
    const filas = await consultar<FilaReporte>(
      `SELECT e.id AS estudiante_id, e.nombre, e.activo,
              c.id AS corte_id, c.registrado_por, c.parcial1, c.parcial2,
              c.examen_final, c.promedio, c.resultado, c.created_at
       FROM estudiantes e
       LEFT JOIN cortes c ON c.estudiante_id = e.id
       ORDER BY lower(e.nombre), e.id, c.created_at, c.id`,
    );

    return filas.map((fila) => ({
      estudianteId: fila.estudiante_id,
      estudiante: fila.nombre,
      activo: fila.activo,
      corte: mapearCorte(fila),
    }));
  } catch (error) {
    throw traducirErrorBaseDatos(error);
  }
}