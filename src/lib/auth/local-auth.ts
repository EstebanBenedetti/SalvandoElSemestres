import crypto from "node:crypto";
import { create, getAll, JsonDBError } from "@/lib/json-db";
import type { UserRecord } from "@data/_schema/user.schema";

export type LocalUser = UserRecord & {
  password?: string;
};

const COLLECTION_NAME = "user";

const DEFAULT_ADMIN = {
  nombre: "Administrador",
  email: "admin@salvandoelsemestre.com",
  password: "123456",
  rol: "admin" as const,
  activo: true,
};

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, passwordHash: string): boolean {
  if (!password || !passwordHash || !passwordHash.includes(":")) return false;
  const [salt, hash] = passwordHash.split(":");
  const candidate = crypto.pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex");
  return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(candidate, "hex"));
}

export function sanitizeUser(user: UserRecord): LocalUser {
  const { passwordHash, ...safeUser } = user;
  return {
    ...safeUser,
    password: undefined,
  } as LocalUser;
}

export function createToken(user: UserRecord): string {
  const payload = {
    sub: user.id,
    email: user.email,
    rol: user.rol,
    exp: Date.now() + 1000 * 60 * 60 * 24,
  };
  return Buffer.from(JSON.stringify(payload)).toString("base64url");
}

async function createStoredUser(input: {
  nombre: string;
  email: string;
  password: string;
  rol?: "admin" | "usuario" | "coordinador";
  activo?: boolean;
}): Promise<UserRecord> {
  return create<UserRecord>(COLLECTION_NAME, {
    nombre: input.nombre.trim(),
    email: input.email.trim().toLowerCase(),
    passwordHash: hashPassword(input.password),
    rol: input.rol ?? "usuario",
    activo: input.activo ?? true,
  });
}

async function readUsers(): Promise<UserRecord[]> {
  try {
    const response = await getAll<UserRecord>(COLLECTION_NAME, { limit: 100, sortBy: "email", sortOrder: "asc" });
    return response.data;
  } catch (error) {
    if (error instanceof JsonDBError && error.code === "NOT_FOUND") {
      return [await createStoredUser(DEFAULT_ADMIN)];
    }
    throw error;
  }
}

export async function findUserByEmail(email: string): Promise<LocalUser | null> {
  const normalizedEmail = email.trim().toLowerCase();
  const users = await readUsers();
  const user = users.find((item) => item.email.toLowerCase() === normalizedEmail);
  return user ? sanitizeUser(user) : null;
}

export async function verifyCredentials(email: string, password: string): Promise<boolean> {
  const user = await findUserByEmail(email);
  if (!user || !user.activo) return false;
  const storedUser = (await readUsers()).find((item) => item.email.toLowerCase() === email.trim().toLowerCase());
  if (!storedUser) return false;
  return verifyPassword(password, storedUser.passwordHash);
}

export async function createUser(input: Omit<LocalUser, "id" | "createdAt" | "updatedAt" | "passwordHash"> & { password: string }): Promise<LocalUser> {
  const email = input.email.trim().toLowerCase();
  const existing = await findUserByEmail(email);
  if (existing) {
    throw new Error("Ya existe un usuario con ese email.");
  }

  const created = await createStoredUser({
    nombre: input.nombre,
    email,
    password: input.password,
    rol: input.rol ?? "usuario",
    activo: input.activo ?? true,
  });

  return sanitizeUser(created);
}
