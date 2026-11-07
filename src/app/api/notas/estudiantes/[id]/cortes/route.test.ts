import { beforeEach, describe, expect, it, vi } from "vitest";

const { exigirSesion, registrarCorte, obtenerEstudiante } = vi.hoisted(() => ({
  exigirSesion: vi.fn(),
  registrarCorte: vi.fn(),
  obtenerEstudiante: vi.fn(),
}));

vi.mock("@/lib/auth/sesion", () => ({ exigirSesion }));
vi.mock("@/lib/dataService", () => ({ registrarCorte, obtenerEstudiante }));

import { POST } from "./route";

describe("POST /api/notas/estudiantes/[id]/cortes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("asocia el corte al correo autenticado y no a un dato del cliente", async () => {
    exigirSesion.mockResolvedValue({ email: "docente@correo.com" });
    registrarCorte.mockResolvedValue({ id: 8, promedio: 4, resultado: "Aprobó" });
    const estudianteId = "737cd269-f375-45dc-bfcc-4fb0e8e72a98";
    const request = new Request("http://localhost/api/notas/estudiantes/cortes", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ parcial1: 4, parcial2: 4, examenFinal: 4, registradoPor: "falso@correo.com" }),
    });

    const respuesta = await POST(request, { params: Promise.resolve({ id: estudianteId }) });

    expect(respuesta.status).toBe(201);
    expect(registrarCorte).toHaveBeenCalledWith(
      { estudianteId, parcial1: 4, parcial2: 4, examenFinal: 4 },
      "docente@correo.com",
    );
  });
});