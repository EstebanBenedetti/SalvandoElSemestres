import type { RegistroNotaReporte } from "@/lib/datos/tipos";

const encabezados = [
  "Estudiante",
  "Estado",
  "Fecha del corte",
  "Parcial 1",
  "Parcial 2",
  "Examen final",
  "Promedio",
  "Resultado",
  "Registrado por",
];

function escaparCelda(valor: string): string {
  const protegido = /^[\s]*[=+\-@]/.test(valor) ? `'${valor}` : valor;
  return `"${protegido.replaceAll('"', '""')}"`;
}

export function serializarNotasCSV(registros: RegistroNotaReporte[]): string {
  const filas = registros.map(({ estudiante, activo, corte }) => [
    estudiante,
    activo ? "Activo" : "Inactivo",
    corte?.fecha ?? "",
    corte?.parcial1.toFixed(2) ?? "",
    corte?.parcial2.toFixed(2) ?? "",
    corte?.examenFinal.toFixed(2) ?? "",
    corte?.promedio.toFixed(2) ?? "",
    corte?.resultado ?? "",
    corte?.registradoPor ?? "",
  ]);

  return `\uFEFF${[encabezados, ...filas]
    .map((fila) => fila.map(escaparCelda).join(","))
    .join("\r\n")}`;
}