import "server-only";
import type { PoolClient, QueryResultRow } from "pg";
import { consultar, conTransaccion } from "@/lib/db/conexion";
import { ErrorDeNegocio } from "@/lib/reglas/errores";
import { LIMITE_LISTADO } from "@/lib/config/notas";
import { normalizarNombre, validarNombre } from "@/lib/reglas/estudiante";
import { traducirErrorBaseDatos } from "@/lib/datos/errores";
import type { Corte, DetalleEstudiante, FilaEstudiante } from "@/lib/datos/tipos";
import { listarCortes } from "@/lib/datos/cortes";

interface FilaListado extends QueryResultRow {
  id: string;
  nombre: string;
  activo: boolean;
  total_cortes: number;
  promedio: number | null;
  resultado: "Aprobó" | "Perdió" | null;
  fecha_ultimo_corte: string | null;
}

interface FilaEstudianteDB extends QueryResultRow {
  id: string;
  nombre: string;
  activo: boolean;
  created_at: string;
}

export async function listarEstudiantes(filtros: {
  incluirInactivos?: boolean;
  busqueda?: string;
} = {}): Promise<FilaEstudiante[]> {
  try {
    const busqueda = filtros.busqueda === undefined ? null : normalizarNombre(filtros.busqueda);
    const filas = await consultar<FilaListado>(
      `SELECT
         e.id,
         e.nombre,
         e.activo,
         COUNT(c.id)::int AS total_cortes,
         v.promedio,
         v.resultado,
         v.created_at AS fecha_ultimo_corte
       FROM estudiantes e
       LEFT JOIN cortes c ON c.estudiante_id = e.id
       LEFT JOIN v_ultimo_corte v ON v.estudiante_id = e.id
       WHERE ($1::boolean OR e.activo = true)
         AND ($2::text IS NULL OR lower(e.nombre) LIKE '%' || lower($2) || '%')
       GROUP BY e.id, v.promedio, v.resultado, v.created_at
       ORDER BY e.nombre
       LIMIT $3`,
      [filtros.incluirInactivos ?? false, busqueda || null, LIMITE_LISTADO],
    );

    return filas.map((fila) => ({
      id: fila.id,
      nombre: fila.nombre,
      activo: fila.activo,
      totalCortes: fila.total_cortes,
      ultimoCorte:
        fila.promedio === null || fila.resultado === null || fila.fecha_ultimo_corte === null
          ? null
          : {
              promedio: fila.promedio,
              resultado: fila.resultado,
              fecha: fila.fecha_ultimo_corte,
            },
    }));
  } catch (error) {
    throw traducirErrorBaseDatos(error);
  }
}

export async function crearEstudiante(nombre: string): Promise<{ id: string }> {
  validarNombre(nombre);
  const nombreNormalizado = normalizarNombre(nombre);
  if (nombreNormalizado.length > 120) throw new ErrorDeNegocio("DATOS_INVALIDOS");

  try {
    return await conTransaccion(async (tx) => {
      const resultado = await tx.query<{ id: string }>(
        "INSERT INTO estudiantes (nombre) VALUES ($1) RETURNING id",
        [nombreNormalizado],
      );
      const estudiante = resultado.rows[0];
      if (!estudiante) throw new Error("La inserción no devolvió el estudiante creado.");
      return { id: estudiante.id };
    });
  } catch (error) {
    throw traducirErrorBaseDatos(error);
  }
}

export async function obtenerEstudiante(id: string): Promise<DetalleEstudiante> {
  try {
    const filas = await consultar<FilaEstudianteDB>(
      "SELECT id, nombre, activo, created_at FROM estudiantes WHERE id = $1",
      [id],
    );
    const estudiante = filas[0];
    if (!estudiante) throw new ErrorDeNegocio("ESTUDIANTE_NO_ENCONTRADO");

    const cortes: Corte[] = await listarCortes(id);
    return {
      estudiante: {
        id: estudiante.id,
        nombre: estudiante.nombre,
        activo: estudiante.activo,
        fechaRegistro: estudiante.created_at,
        totalCortes: cortes.length,
      },
      cortes,
    };
  } catch (error) {
    throw traducirErrorBaseDatos(error);
  }
}

export async function desactivarEstudiante(id: string): Promise<void> {
  try {
    await conTransaccion(async (tx) => {
      const resultado = await tx.query<{ id: string }>(
        "UPDATE estudiantes SET activo = false WHERE id = $1 RETURNING id",
        [id],
      );
      if (!resultado.rowCount) throw new ErrorDeNegocio("ESTUDIANTE_NO_ENCONTRADO");
    });
  } catch (error) {
    throw traducirErrorBaseDatos(error);
  }
}

export async function obtenerEstudianteActivo(
  tx: PoolClient,
  id: string,
): Promise<{ id: string }> {
  try {
    const resultado = await tx.query<{ id: string }>(
      "SELECT id FROM estudiantes WHERE id = $1 AND activo = true",
      [id],
    );
    const estudiante = resultado.rows[0];
    if (!estudiante) throw new ErrorDeNegocio("ESTUDIANTE_NO_ENCONTRADO");
    return estudiante;
  } catch (error) {
    throw traducirErrorBaseDatos(error, "ESTUDIANTE_NO_ENCONTRADO");
  }
}
