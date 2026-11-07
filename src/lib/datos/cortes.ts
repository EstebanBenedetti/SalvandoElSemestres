import "server-only";
import type { QueryResultRow } from "pg";
import { consultar, conTransaccion } from "@/lib/db/conexion";
import { traducirErrorBaseDatos } from "@/lib/datos/errores";
import { obtenerEstudianteActivo } from "@/lib/datos/estudiantes";
import type { Corte, DatosCorte } from "@/lib/datos/tipos";
import {
  calcularPromedio,
  determinarResultado,
  validarNotas,
  type Resultado,
} from "@/lib/reglas/nota";

interface FilaCorte extends QueryResultRow {
  id: number;
  estudiante_id: string;
  registrado_por: string | null;
  parcial1: number;
  parcial2: number;
  examen_final: number;
  promedio: number;
  resultado: Resultado;
  created_at: string;
}

function mapearCorte(fila: FilaCorte): Corte {
  return {
    id: fila.id,
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

export async function registrarCorte(
  datos: DatosCorte,
  registradoPor: string | null = null,
): Promise<Corte> {
  validarNotas(datos);

  try {
    return await conTransaccion(async (tx) => {
      await obtenerEstudianteActivo(tx, datos.estudianteId);
      const promedio = calcularPromedio(datos.parcial1, datos.parcial2, datos.examenFinal);
      const resultado = determinarResultado(promedio);
      const insercion = await tx.query<FilaCorte>(
        `INSERT INTO cortes (estudiante_id, parcial1, parcial2, examen_final, promedio, resultado, registrado_por)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id, estudiante_id, registrado_por, parcial1, parcial2, examen_final, promedio, resultado, created_at`,
        [
          datos.estudianteId,
          datos.parcial1,
          datos.parcial2,
          datos.examenFinal,
          promedio,
          resultado,
          registradoPor,
        ],
      );
      const fila = insercion.rows[0];
      if (!fila) throw new Error("La inserción no devolvió el corte creado.");
      return mapearCorte(fila);
    });
  } catch (error) {
    throw traducirErrorBaseDatos(error, "ESTUDIANTE_NO_ENCONTRADO");
  }
}

export async function listarCortes(estudianteId: string): Promise<Corte[]> {
  try {
    const filas = await consultar<FilaCorte>(
      `SELECT id, estudiante_id, registrado_por, parcial1, parcial2, examen_final, promedio, resultado, created_at
       FROM cortes
       WHERE estudiante_id = $1
       ORDER BY created_at DESC, id DESC`,
      [estudianteId],
    );
    return filas.map(mapearCorte);
  } catch (error) {
    throw traducirErrorBaseDatos(error);
  }
}
