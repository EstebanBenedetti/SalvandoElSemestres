import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ResumenModulo } from "./ResumenModulo";

describe("ResumenModulo", () => {
  it("muestra un resumen ejecutivo con el total, aprobación y promedios del grupo", () => {
    render(
      <ResumenModulo
        estudiantes={[
          { id: "1", nombre: "Ana", activo: true, totalCortes: 1, ultimoCorte: { promedio: 4.5, resultado: "Aprobó", fecha: "2024-05-01T10:00:00.000Z" } },
          { id: "2", nombre: "Luis", activo: true, totalCortes: 1, ultimoCorte: { promedio: 3.8, resultado: "Aprobó", fecha: "2024-05-02T10:00:00.000Z" } },
          { id: "3", nombre: "Marta", activo: true, totalCortes: 1, ultimoCorte: { promedio: 2.1, resultado: "Perdió", fecha: "2024-05-03T10:00:00.000Z" } },
        ]}
      />,
    );

    expect(screen.getByText("Resumen del módulo")).toBeInTheDocument();
    expect(screen.getByText("Total")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("Aprobados")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("Perdieron")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("Promedio general")).toBeInTheDocument();
    expect(screen.getByText("3,47")).toBeInTheDocument();
    expect(screen.getByText("Mejor promedio")).toBeInTheDocument();
    expect(screen.getByText("Ana")).toBeInTheDocument();
    expect(screen.getByText("Peor promedio")).toBeInTheDocument();
    expect(screen.getByText("Marta")).toBeInTheDocument();
  });

  it("muestra un estado seguro cuando no hay cortes registrados todavía", () => {
    render(
      <ResumenModulo
        estudiantes={[
          { id: "1", nombre: "Ana", activo: true, totalCortes: 0, ultimoCorte: null },
          { id: "2", nombre: "Luis", activo: true, totalCortes: 0, ultimoCorte: null },
        ]}
      />,
    );

    expect(screen.getByText("Resumen del módulo")).toBeInTheDocument();
    expect(screen.getByText("Total")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("Aprobados")).toBeInTheDocument();
    expect(screen.getAllByText("0").length).toBeGreaterThan(0);
    expect(screen.getByText("Perdieron")).toBeInTheDocument();
    expect(screen.getAllByText("Sin datos").length).toBeGreaterThan(0);
    expect(screen.getByText("Promedio general")).toBeInTheDocument();
    expect(screen.getByText("0,00")).toBeInTheDocument();
  });
});
