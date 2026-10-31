import { ErrorDeNegocio, type CodigoError } from "@/lib/reglas/errores";

function codigoPostgres(error: unknown): string | undefined {
  if (typeof error !== "object" || error === null || !("code" in error)) return undefined;
  return typeof error.code === "string" ? error.code : undefined;
}

export function traducirErrorBaseDatos(
  error: unknown,
  errorForanea: CodigoError = "ESTUDIANTE_CON_CORTES",
): ErrorDeNegocio {
  if (error instanceof ErrorDeNegocio) return error;

  const codigo = codigoPostgres(error);
  if (codigo === "23505") return new ErrorDeNegocio("NOMBRE_DUPLICADO");
  if (codigo === "23503") return new ErrorDeNegocio(errorForanea);
  if (codigo === "23514" || codigo === "22001") return new ErrorDeNegocio("DATOS_INVALIDOS");

  console.error("Error de base de datos de NotaFlux.", codigo ?? "sin código");
  return new ErrorDeNegocio("ERROR_INTERNO");
}
