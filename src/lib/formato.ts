const formatoNota = new Intl.NumberFormat("es-CO", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const formatoFecha = new Intl.DateTimeFormat("es-CO", {
  dateStyle: "medium",
  timeZone: "America/Bogota",
});

export function formatearNota(nota: number): string {
  return formatoNota.format(nota);
}

export function formatearFecha(fecha: string | Date): string {
  return formatoFecha.format(new Date(fecha));
}

export function normalizarEntradaNota(texto: string): number {
  const normalizado = texto.trim().replace(",", ".");
  if (!normalizado) return Number.NaN;
  return Number(normalizado);
}
