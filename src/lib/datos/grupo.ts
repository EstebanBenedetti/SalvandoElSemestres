import "server-only";
import type { QueryResultRow } from "pg";
import { consultar } from "@/lib/db/conexion";
import { traducirErrorBaseDatos } from "@/lib/datos/errores";
import type { ExtremosGrupo } from "@/lib/datos/tipos";

interface FilaExtremo extends QueryResultRow {
  nombre: string;
  promedio: number;
}

export async function obtenerExtremosGrupo(): Promise<ExtremosGrupo> {
  try {
    const filas = await consultar<FilaExtremo>(
      `SELECT estudiante_nombre AS nombre, promedio
       FROM v_ultimo_corte
       ORDER BY estudiante_nombre`,
    );
    if (filas.length === 0) {
      return { masAltos: [], masBajos: [], totalEnGrupo: 0 };
    }

    const promedioMaximo = filas.reduce(
      (maximo, fila) => Math.max(maximo, fila.promedio),
      Number.NEGATIVE_INFINITY,
    );
    const promedioMinimo = filas.reduce(
      (minimo, fila) => Math.min(minimo, fila.promedio),
      Number.POSITIVE_INFINITY,
    );

    return {
      masAltos: filas
        .filter((fila) => fila.promedio === promedioMaximo)
        .map(({ nombre, promedio }) => ({ nombre, promedio })),
      masBajos: filas
        .filter((fila) => fila.promedio === promedioMinimo)
        .map(({ nombre, promedio }) => ({ nombre, promedio })),
      totalEnGrupo: filas.length,
    };
  } catch (error) {
    throw traducirErrorBaseDatos(error);
  }
}
