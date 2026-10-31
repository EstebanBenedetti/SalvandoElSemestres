import {
  NOTA_MAXIMA,
  NOTA_MINIMA,
  PESO_EXAMEN_FINAL,
  PESO_PARCIAL1,
  PESO_PARCIAL2,
  UMBRAL_APROBACION,
} from "@/lib/config/notas";
import { ErrorDeNegocio } from "@/lib/reglas/errores";

export type Resultado = "Aprobó" | "Perdió";

function aCentimas(nota: number): number {
  return Math.round(nota * 100);
}

export function esNotaValida(nota: number): boolean {
  return Number.isFinite(nota) && nota >= NOTA_MINIMA && nota <= NOTA_MAXIMA;
}

export function validarNotas(datos: {
  parcial1: number;
  parcial2: number;
  examenFinal: number;
}): void {
  if (
    !esNotaValida(datos.parcial1) ||
    !esNotaValida(datos.parcial2) ||
    !esNotaValida(datos.examenFinal)
  ) {
    throw new ErrorDeNegocio("DATOS_INVALIDOS");
  }
}

export function calcularPromedio(
  parcial1: number,
  parcial2: number,
  examenFinal: number,
): number {
  const pesoTotal = PESO_PARCIAL1 + PESO_PARCIAL2 + PESO_EXAMEN_FINAL;
  const centimasPonderadas =
    aCentimas(parcial1) * PESO_PARCIAL1 +
    aCentimas(parcial2) * PESO_PARCIAL2 +
    aCentimas(examenFinal) * PESO_EXAMEN_FINAL;

  return Math.round(centimasPonderadas / pesoTotal) / 100;
}

export function determinarResultado(promedio: number): Resultado {
  return aCentimas(promedio) >= aCentimas(UMBRAL_APROBACION)
    ? "Aprobó"
    : "Perdió";
}
