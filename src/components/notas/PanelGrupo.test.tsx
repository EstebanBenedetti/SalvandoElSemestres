import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PanelGrupo } from "./PanelGrupo";

describe("PanelGrupo", () => {
  it("muestra los estudiantes con mayor y menor promedio del grupo", () => {
    render(
      <PanelGrupo
        datos={{
          masAltos: [{ nombre: "Ana", promedio: 4.5 }],
          masBajos: [{ nombre: "Sofía", promedio: 2.1 }],
          totalEnGrupo: 3,
        }}
      />,
    );

    expect(screen.getByText("Máximo del grupo")).toBeInTheDocument();
    expect(screen.getByText("Ana")).toBeInTheDocument();
    expect(screen.getByText("Mínimo del grupo")).toBeInTheDocument();
    expect(screen.getByText("Sofía")).toBeInTheDocument();
    expect(screen.getByText("Total en grupo")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });
});
