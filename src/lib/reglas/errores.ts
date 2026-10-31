export type CodigoError =
  | "DATOS_INVALIDOS"
  | "NO_AUTORIZADO"
  | "NOMBRE_DUPLICADO"
  | "ESTUDIANTE_NO_ENCONTRADO"
  | "ESTUDIANTE_CON_CORTES"
  | "ERROR_INTERNO";

export const MENSAJES: Record<CodigoError, string> = {
  DATOS_INVALIDOS: "Revise los datos ingresados.",
  NO_AUTORIZADO: "Debe iniciar sesión.",
  NOMBRE_DUPLICADO: "Ya existe un estudiante con ese nombre.",
  ESTUDIANTE_NO_ENCONTRADO: "El estudiante no existe o está inactivo.",
  ESTUDIANTE_CON_CORTES: "El estudiante tiene cortes registrados y no se puede eliminar; desactívelo.",
  ERROR_INTERNO: "Ocurrió un error inesperado. Intente de nuevo.",
};

export const ESTADO_HTTP: Record<CodigoError, number> = {
  DATOS_INVALIDOS: 400,
  NO_AUTORIZADO: 401,
  NOMBRE_DUPLICADO: 409,
  ESTUDIANTE_NO_ENCONTRADO: 404,
  ESTUDIANTE_CON_CORTES: 409,
  ERROR_INTERNO: 500,
};

export class ErrorDeNegocio extends Error {
  constructor(
    public codigo: CodigoError,
    mensaje: string = MENSAJES[codigo],
    public detalles?: unknown,
  ) {
    super(mensaje);
    this.name = "ErrorDeNegocio";
  }
}
