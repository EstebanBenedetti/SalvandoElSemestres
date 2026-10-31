import { describe, expect, it } from "vitest";
import { normalizarNombre, validarNombre } from "@/lib/reglas/estudiante";
import { esperarCodigo } from "./ayudas";

describe("reglas de estudiantes", () => {
  it("T-20 rechaza un nombre vacío después de recortar espacios", () => {
    esperarCodigo(() => validarNombre("  "), "DATOS_INVALIDOS");
  });

  it("T-21 rechaza un nombre de un carácter", () => {
    esperarCodigo(() => validarNombre("A"), "DATOS_INVALIDOS");
  });

  it("T-22 acepta el nombre Ana", () => {
    expect(() => validarNombre("Ana")).not.toThrow();
  });

  it("T-23 recorta y colapsa espacios del nombre", () => {
    expect(normalizarNombre("  Ana   María ")).toBe("Ana María");
  });

});
