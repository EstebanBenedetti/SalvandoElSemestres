import { ErrorDeNegocio } from "@/lib/reglas/errores";

export function normalizarNombre(nombre: string): string {
  return nombre.trim().replace(/\s+/g, " ");
}

export function validarNombre(nombre: string): void {
  if (typeof nombre !== "string" || normalizarNombre(nombre).length < 2) {
    throw new ErrorDeNegocio("DATOS_INVALIDOS");
  }
}
