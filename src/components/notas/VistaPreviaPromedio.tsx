"use client";

import { InsigniaResultado } from "@/components/notas/InsigniaResultado";
import { formatearNota } from "@/lib/formato";
import { calcularPromedio, determinarResultado } from "@/lib/reglas/nota";
import { normalizarEntradaNota } from "@/lib/formato";

type VistaPreviaPromedioProps = {
  parcial1: string;
  parcial2: string;
  examenFinal: string;
};

export function VistaPreviaPromedio({
  parcial1,
  parcial2,
  examenFinal,
}: VistaPreviaPromedioProps) {
  const notas = [parcial1, parcial2, examenFinal].map((valor) => normalizarEntradaNota(valor));
  const hayValores = notas.every((valor) => Number.isFinite(valor));
  const rangoValido = notas.every((valor) => valor >= 0 && valor <= 5);

  if (!parcial1.trim() || !parcial2.trim() || !examenFinal.trim() || !hayValores || !rangoValido) {
    return (
      <p className="text-sm font-medium text-texto-suave">
        Ingrese las tres notas (0.0 a 5.0) para ver el promedio
      </p>
    );
  }

  const [nota1, nota2, nota3] = notas;
  if (nota1 === undefined || nota2 === undefined || nota3 === undefined) {
    return (
      <p className="text-sm font-medium text-texto-suave">
        Ingrese las tres notas (0.0 a 5.0) para ver el promedio
      </p>
    );
  }

  const promedio = calcularPromedio(nota1, nota2, nota3);
  const resultado = determinarResultado(promedio);

  return (
    <div className="rounded-xl border border-borde bg-superficie p-4">
      <p className="text-sm text-texto-suave">Promedio: {formatearNota(promedio)}</p>
      <div className="mt-3">
        <InsigniaResultado resultado={resultado} />
      </div>
    </div>
  );
}
