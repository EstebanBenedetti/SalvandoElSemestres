import { describe, expect, it } from "vitest";
import { calcularHashToken, generarToken } from "@/lib/tokenRecuperacion";

describe("token de recuperación", () => {
  it("genera un token hexadecimal de 32 bytes", () => {
    const token = generarToken();

    expect(token).toMatch(/^[a-f\d]{64}$/);
  });

  it("calcula un hash SHA-256 hexadecimal", () => {
    expect(calcularHashToken("token-de-prueba")).toBe(
      "6f01606f61af728b4309e0e78f0c9a7c35f76c1e02b3c892f245a9cfc9bc8314",
    );
  });
});
