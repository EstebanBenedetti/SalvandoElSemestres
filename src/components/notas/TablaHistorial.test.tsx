import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TablaHistorial } from "./TablaHistorial";

const cortes = [
  {
    id: 1,
    estudianteId: "estudiante-1",
    registradoPor: "docente@correo.com",
    parcial1: 4,
    parcial2: 3.5,
    examenFinal: 4,
    promedio: 3.88,
    resultado: "Aprobó" as const,
    fecha: "2026-11-07T10:00:00.000Z",
  },
  {
    id: 2,
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

describe("TablaHistorial", () => {
  it("muestra quién registró cada corte y señala los históricos sin autor", () => {
    render(<TablaHistorial cortes={cortes} estudianteId="estudiante-1" />);

    expect(screen.getAllByText("docente@correo.com")).toHaveLength(2);
    expect(screen.getAllByText("No disponible")).toHaveLength(2);
    expect(screen.getByRole("columnheader", { name: "Registrado por" })).toBeInTheDocument();
  });
});