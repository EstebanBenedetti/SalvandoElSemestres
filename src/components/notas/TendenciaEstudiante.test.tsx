import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TendenciaEstudiante } from "./TendenciaEstudiante";

const cortes = [
  {
    id: 2,
    estudianteId: "estudiante-1",
    registradoPor: null,
    parcial1: 4,
    parcial2: 4,
    examenFinal: 3,
    promedio: 3.75,
    resultado: "Aprobó" as const,
    fecha: "2026-11-07T10:00:00.000Z",
  },
  {
    id: 1,
    estudianteId: "estudiante-1",
    registradoPor: null,
    parcial1: 2,
    parcial2: 2,
    examenFinal: 2,
    promedio: 2,
    resultado: "Perdió" as const,
    fecha: "2026-10-07T10:00:00.000Z",
  },
];

describe("TendenciaEstudiante", () => {
  it("ordena los cortes cronológicamente y compara el primer y último promedio", () => {
    render(<TendenciaEstudiante cortes={cortes} />);

    expect(screen.getByText("Subió 1,75 desde el primer corte.")).toBeInTheDocument();
    expect(screen.getByRole("meter", { name: /Corte 1: promedio 2,00 sobre 5/ })).toHaveAttribute(
      "aria-valuenow",
      "2",
    );
  });

  it("solicita un segundo corte antes de mostrar una comparación", () => {
    render(<TendenciaEstudiante cortes={[cortes[0]!]} />);

    expect(screen.getByText("Registra otro corte para comparar el rendimiento.")).toBeInTheDocument();
  });
});