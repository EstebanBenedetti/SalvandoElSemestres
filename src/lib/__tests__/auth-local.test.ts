import { beforeEach, describe, expect, it, vi } from "vitest";

type TestRow = Record<string, unknown>;
type QueryBuilder = {
  select: () => QueryBuilder;
  eq: (column: string, value: unknown) => QueryBuilder;
  maybeSingle: () => Promise<{ data: TestRow | null; error: null }>;
  insert: (values: TestRow) => QueryBuilder;
  single: () => Promise<{ data: TestRow; error: null }>;
  update: (values: TestRow) => { eq: (column: string, value: unknown) => Promise<{ error: null }> };
};

const mocks = vi.hoisted(() => ({ rows: [] as TestRow[], client: undefined as unknown }));

vi.mock("@/lib/supabase/server", () => ({
  getSupabaseAdmin: () => mocks.client,
}));

import {
  changePassword,
  createToken,
  createUser,
  findUserByEmail,
  findUserByLogin,
  hashPassword,
  recordSuccessfulLogin,
  verifyCredentials,
  verifyPassword,
  verifyToken,
} from "@/lib/auth/local-auth";

function createMockClient() {
  return {
    from: () => {
      let filter: { column: string; value: unknown } | undefined;
      let inserted: TestRow | undefined;
      const query = {} as QueryBuilder;

      query.select = () => query;
      query.eq = (column, value) => {
        filter = { column, value };
        return query;
      };
      query.maybeSingle = async () => ({
        data: mocks.rows.find((row) => row[filter?.column ?? ""] === filter?.value) ?? null,
        error: null,
      });
      query.insert = (values) => {
        inserted = values;
        return query;
      };
      query.single = async () => {
        const timestamp = new Date().toISOString();
        const row = {
          id: `user-${mocks.rows.length + 1}`,
          ...inserted,
          ultimo_login: null,
          created_at: timestamp,
          updated_at: timestamp,
        };
        mocks.rows.push(row);
        return { data: row, error: null };
      };
      query.update = (values) => ({
        eq: async (column, value) => {
          const row = mocks.rows.find((candidate) => candidate[column] === value);
          if (row) Object.assign(row, values);
          return { error: null };
        },
      });

      return query;
    },
  };
}

describe("auth local", () => {
  beforeEach(() => {
    mocks.rows.length = 0;
    mocks.client = createMockClient();
    vi.stubEnv("SUPABASE_JWT_SECRET", "test-only-secret");
  });

  it("crea usuarios con la contraseña hasheada y verifica sus credenciales", async () => {
    const created = await createUser({
      nombre: "Usuario de prueba",
      email: "PRUEBA@local.test",
      password: "secreto123",
      rol: "usuario",
    });

    expect(created.email).toBe("prueba@local.test");
    expect(created.password).toBeUndefined();
    expect(created).not.toHaveProperty("passwordHash");
    expect(mocks.rows[0]?.password_hash).not.toBe("secreto123");
    await expect(findUserByEmail("prueba@local.test")).resolves.toMatchObject({ nombre: "Usuario de prueba" });
    await expect(findUserByLogin("Usuario de prueba")).resolves.toMatchObject({ email: "prueba@local.test" });
    await expect(verifyCredentials("prueba@local.test", "secreto123")).resolves.toBe(true);
    await expect(verifyCredentials("Usuario de prueba", "secreto123")).resolves.toBe(true);
    await expect(verifyCredentials("prueba@local.test", "incorrecta")).resolves.toBe(false);
  });

  it("rechaza credenciales de usuarios inactivos", async () => {
    await createUser({ nombre: "Inactivo", email: "inactivo@local.test", password: "secreto123", activo: false });
    await expect(verifyCredentials("inactivo@local.test", "secreto123")).resolves.toBe(false);
  });

  it("rechaza correos duplicados aunque cambien mayúsculas", async () => {
    await createUser({ nombre: "Uno", email: "uno@local.test", password: "secreto123" });
    await expect(createUser({ nombre: "Otro", email: "UNO@local.test", password: "secreto123" }))
      .rejects.toThrow("Ya existe un usuario");
  });

  it("firma los tokens y rechaza modificaciones", async () => {
    const user = await createUser({ nombre: "Token", email: "token@local.test", password: "secreto123" });
    const token = createToken({ ...user, passwordHash: "" });
    const [header, payload, signature] = token.split(".");
    if (!header || !payload || !signature) throw new Error("El token generado no tiene el formato esperado.");
    const modifiedSignature = `${signature[0] === "A" ? "B" : "A"}${signature.slice(1)}`;

    expect(verifyToken(token)?.sub).toBe(user.id);
    expect(verifyToken(`${header}.${payload}.${modifiedSignature}`)).toBeNull();
  });

  it("actualiza la fecha del último inicio de sesión", async () => {
    const user = await createUser({ nombre: "Login", email: "login@local.test", password: "secreto123" });
    await recordSuccessfulLogin(user.id);

    expect(mocks.rows[0]?.ultimo_login).toEqual(expect.any(String));
  });

  it("reemplaza la contraseña del usuario y permite iniciar sesión con la nueva", async () => {
    const user = await createUser({ nombre: "Cambio", email: "cambio@local.test", password: "anterior123" });

    await expect(changePassword(user.id, "anterior123", "nueva-clave-456")).resolves.toBe("updated");
    await expect(verifyCredentials(user.email, "anterior123")).resolves.toBe(false);
    await expect(verifyCredentials(user.email, "nueva-clave-456")).resolves.toBe(true);
  });

  it("no cambia la contraseña cuando la actual es incorrecta", async () => {
    const user = await createUser({ nombre: "Cambio", email: "cambio@local.test", password: "anterior123" });
    const originalHash = mocks.rows[0]?.password_hash;

    await expect(changePassword(user.id, "incorrecta", "nueva-clave-456")).resolves.toBe("invalid-current-password");
    expect(mocks.rows[0]?.password_hash).toBe(originalHash);
    await expect(verifyCredentials(user.email, "anterior123")).resolves.toBe(true);
  });

  it("verifica hashes bcrypt sin perder compatibilidad con PBKDF2", async () => {
    const bcryptHash = await (await import("bcryptjs")).default.hash("bcrypt-clave-123", 4);
    const pbkdfHash = hashPassword("secreto123");

    await expect(verifyPassword("bcrypt-clave-123", bcryptHash)).resolves.toBe(true);
    await expect(verifyPassword("otra-clave", bcryptHash)).resolves.toBe(false);
    await expect(verifyPassword("secreto123", pbkdfHash)).resolves.toBe(true);
  });
});
