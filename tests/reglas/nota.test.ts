import { describe, expect, it } from "vitest";
import {
  calcularPromedio,
  determinarResultado,
  esNotaValida,
  validarNotas,
} from "@/lib/reglas/nota";
import { esperarCodigo } from "./ayudas";

describe("reglas de notas", () => {
  it("T-01 calcula 3.30 con notas 3.30, 3.30 y 3.30", () => {
    expect(calcularPromedio(3.3, 3.3, 3.3)).toBe(3.3);
  });

  it("T-02 calcula 3.25 con notas 2.00, 3.00 y 4.00", () => {
    expect(calcularPromedio(2, 3, 4)).toBe(3.25);
  });

  it("T-03 calcula 3.25 con notas 3.00, 3.00 y 3.50", () => {
    expect(calcularPromedio(3, 3, 3.5)).toBe(3.25);
  });

  it("T-04 calcula 5.00 con notas máximas", () => {
    expect(calcularPromedio(5, 5, 5)).toBe(5);
  });

  it("T-05 calcula 0.00 con notas mínimas", () => {
    expect(calcularPromedio(0, 0, 0)).toBe(0);
  });

  it("T-06 calcula 3.50 con notas 4.00, 4.00 y 3.00", () => {
    expect(calcularPromedio(4, 4, 3)).toBe(3.5);
  });

  it("T-07 redondea 3.325 a 3.33", () => {
    expect(calcularPromedio(3.4, 3.4, 3.25)).toBe(3.33);
  });

  it("T-08 calcula 3.50 con notas 1.50, 2.50 y 5.00", () => {
    expect(calcularPromedio(1.5, 2.5, 5)).toBe(3.5);
  });

  it("T-09 aprueba el promedio exacto de 3.00", () => {
    expect(determinarResultado(3)).toBe("Aprobó");
  });

  it("T-10 pierde justo por debajo del umbral, con 2.99", () => {
    expect(determinarResultado(2.99)).toBe("Perdió");
  });

  it("T-11 pierde con promedio 2.90", () => {
    expect(determinarResultado(2.9)).toBe("Perdió");
  });

  it("aprueba promedios entre el umbral y 3.30, como 3.25", () => {
    expect(determinarResultado(3.25)).toBe("Aprobó");
  });

  it("T-12 aprueba con promedio 5.00", () => {
    expect(determinarResultado(5)).toBe("Aprobó");
  });

  it("T-13 pierde con promedio 0.00", () => {
    expect(determinarResultado(0)).toBe("Perdió");
  });

  it("T-14 rechaza una nota menor que cero", () => {
    expect(esNotaValida(-0.1)).toBe(false);
  });

  it("T-15 rechaza una nota mayor que cinco", () => {
    expect(esNotaValida(5.1)).toBe(false);
  });

  it("T-16 acepta las notas mínima, máxima y decimal dentro del rango", () => {
    expect([esNotaValida(0), esNotaValida(5), esNotaValida(3.3)]).toEqual([
      true,
      true,
      true,
    ]);
    expect(esNotaValida(Number.NaN)).toBe(false);
    expect(esNotaValida(Number.POSITIVE_INFINITY)).toBe(false);
  });

  it("T-17 rechaza parcial1 fuera del rango", () => {
    esperarCodigo(
      () => validarNotas({ parcial1: 6, parcial2: 3, examenFinal: 3 }),
      "DATOS_INVALIDOS",
    );
  });

  it("T-18 rechaza examenFinal fuera del rango", () => {
    esperarCodigo(
      () => validarNotas({ parcial1: 3.3, parcial2: 3.3, examenFinal: -1 }),
      "DATOS_INVALIDOS",
    );
  });

  it("T-19 acepta tres notas dentro del rango", () => {
    expect(() =>
      validarNotas({ parcial1: 3.3, parcial2: 3.3, examenFinal: 3.3 }),
    ).not.toThrow();
  });

  it("T-24 redondea a 3.33 y aprueba el resultado", () => {
    const promedio = calcularPromedio(3.4, 3.4, 3.25);

    expect(promedio).toBe(3.33);
    expect(determinarResultado(promedio)).toBe("Aprobó");
  });

});
