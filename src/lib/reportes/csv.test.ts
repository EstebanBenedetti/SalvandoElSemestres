import { describe, expect, it } from "vitest";
import { serializarNotasCSV } from "./csv";

describe("serializarNotasCSV", () => {
  it("incluye los cortes, el estado y la autoría con formato compatible con hojas de cálculo", () => {
    const csv = serializarNotasCSV([
      {
        estudianteId: "estudiante-1",
        estudiante: 'Ana "Luz", Pérez',
        activo: true,
        corte: {
          id: 1,
          estudianteId: "estudiante-1",
          registradoPor: "docente@correo.com",
          parcial1: 4,
          parcial2: 3.5,
          examenFinal: 4,
          promedio: 3.88,
          resultado: "Aprobó",
          fecha: "2026-11-07T10:00:00.000Z",
        },
      },
    ]);

    expect(csv).toContain("\uFEFF");
    expect(csv).toContain('"Ana ""Luz"", Pérez"');
    expect(csv).toContain('"3.88"');
    expect(csv).toContain('"docente@correo.com"');
  });

  it("neutraliza valores que una hoja de cálculo podría interpretar como fórmulas", () => {
    const csv = serializarNotasCSV([
      { estudianteId: "estudiante-2", estudiante: "=1+1", activo: false, corte: null },
    ]);

    expect(csv).toContain("'=1+1");
    expect(csv).toContain('"Inactivo"');
  });
});