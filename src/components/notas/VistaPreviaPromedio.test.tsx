import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { VistaPreviaPromedio } from "./VistaPreviaPromedio";

describe("VistaPreviaPromedio", () => {
  it("muestra el promedio y el resultado con las notas válidas", () => {
    render(
      <VistaPreviaPromedio
        parcial1="3.30"
        parcial2="3.30"
        examenFinal="3.30"
      />,
    );

    expect(screen.getByText("Promedio: 3,30")).toBeInTheDocument();
    expect(screen.getByText("Aprobó")).toBeInTheDocument();
  });

  it("pide completar las tres notas si faltan datos o la nota supera el rango", () => {
    render(
      <VistaPreviaPromedio
        parcial1="3.30"
        parcial2="3.30"
        examenFinal=""
      />,
    );

    expect(screen.getByText("Ingrese las tres notas (0.0 a 5.0) para ver el promedio")).toBeInTheDocument();
  });
});
