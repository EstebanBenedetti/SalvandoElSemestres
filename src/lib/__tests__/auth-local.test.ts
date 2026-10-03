import { describe, expect, it } from "vitest";
import { findUserByEmail, verifyCredentials, createUser, type LocalUser } from "@/lib/auth/local-auth";

describe("auth local", () => {
  it("verifica credenciales de un usuario registrado", async () => {
    const user = await findUserByEmail("admin@salvandoelsemestre.com");
    expect(user).not.toBeNull();
    const ok = await verifyCredentials("admin@salvandoelsemestre.com", "123456");
    expect(ok).toBe(true);
  });

  it("rechaza credenciales inválidas", async () => {
    const ok = await verifyCredentials("admin@salvandoelsemestre.com", "incorrecta");
    expect(ok).toBe(false);
  });

  it("crea un usuario nuevo con contraseña hasheada", async () => {
    const payload: Omit<LocalUser, "id" | "createdAt" | "updatedAt"> = {
      nombre: "Usuario de prueba",
      email: "prueba@local.test",
      password: "secreto123",
      rol: "usuario",
      activo: true,
    };

    const created = await createUser(payload);
    expect(created.email).toBe("prueba@local.test");
    expect(created.password).toBeUndefined();
    const ok = await verifyCredentials("prueba@local.test", "secreto123");
    expect(ok).toBe(true);
  });
});
