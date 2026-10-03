import crypto from "node:crypto";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import type { UserRecord } from "@data/_schema/user.schema";

export type LocalUser = Omit<UserRecord, "passwordHash"> & {
  password?: string;
};

type UserRow = {
  id: string;
  nombre: string;
  email: string;
  password_hash: string;
  rol: UserRecord["rol"];
  activo: boolean;
  ultimo_login: string | null;
  created_at: string;
  updated_at: string;
};

const USER_FIELDS = "id,nombre,email,password_hash,rol,activo,ultimo_login,created_at,updated_at";
const USER_ROLES = ["admin", "usuario", "coordinador"] as const;

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, passwordHash: string): boolean {
  if (!password || !passwordHash || !passwordHash.includes(":")) return false;
  const [salt, hash, extra] = passwordHash.split(":");
  if (!salt || !hash || extra || !/^[a-f\d]{32}$/i.test(salt) || !/^[a-f\d]{128}$/i.test(hash)) return false;
  const candidate = crypto.pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex");
  return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(candidate, "hex"));
}

export function sanitizeUser(user: UserRecord): LocalUser {
  return {
    id: user.id,
    nombre: user.nombre,
    email: user.email,
    rol: user.rol,
    activo: user.activo,
    ultimoLogin: user.ultimoLogin,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

function mapUser(row: UserRow): UserRecord {
  return {
    id: row.id,
    nombre: row.nombre,
    email: row.email,
    passwordHash: row.password_hash,
    rol: row.rol,
    activo: row.activo,
    ultimoLogin: row.ultimo_login,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function tokenSecret(): string {
  const secret = process.env.SUPABASE_JWT_SECRET;
  if (!secret) throw new Error("Falta configurar SUPABASE_JWT_SECRET.");
  return secret;
}

export function createToken(user: UserRecord): string {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const payload = {
    sub: user.id,
    email: user.email,
    rol: user.rol,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const unsignedToken = `${header}.${encodedPayload}`;
  const signature = crypto.createHmac("sha256", tokenSecret()).update(unsignedToken).digest("base64url");
  return `${unsignedToken}.${signature}`;
}

export type AuthTokenPayload = {
  sub: string;
  email: string;
  rol: UserRecord["rol"];
  exp: number;
};

export function verifyToken(token: string): AuthTokenPayload | null {
  const parts = token.split(".");
  if (parts.length !== 3 || !parts.every(Boolean)) return null;

  try {
    const [encodedHeader, encodedPayload, encodedSignature] = parts;
    if (!encodedHeader || !encodedPayload || !encodedSignature) return null;
    const header = JSON.parse(Buffer.from(encodedHeader, "base64url").toString("utf8"));
    if (header.alg !== "HS256") return null;

    const expectedSignature = crypto
      .createHmac("sha256", tokenSecret())
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest();
    const actualSignature = Buffer.from(encodedSignature, "base64url");
    if (actualSignature.length !== expectedSignature.length || !crypto.timingSafeEqual(actualSignature, expectedSignature)) return null;

    const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8")) as AuthTokenPayload;
    if (
      typeof payload.sub !== "string" ||
      typeof payload.email !== "string" ||
      !USER_ROLES.includes(payload.rol) ||
      !Number.isInteger(payload.exp) ||
      payload.exp <= Math.floor(Date.now() / 1000)
    ) return null;

    return payload;
  } catch {
    return null;
  }
}

async function findStoredUser(column: "email" | "id", value: string): Promise<UserRecord | null> {
  const { data, error } = await getSupabaseAdmin()
    .from("usuarios")
    .select(USER_FIELDS)
    .eq(column, value)
    .maybeSingle();
  if (error) throw new Error("No se pudo consultar usuarios en Supabase.");
  return data ? mapUser(data as unknown as UserRow) : null;
}

export async function findUserByEmail(email: string): Promise<LocalUser | null> {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await findStoredUser("email", normalizedEmail);
  return user ? sanitizeUser(user) : null;
}

export async function findUserById(id: string): Promise<LocalUser | null> {
  const user = await findStoredUser("id", id);
  return user ? sanitizeUser(user) : null;
}

export async function verifyCredentials(email: string, password: string): Promise<boolean> {
  const user = await findStoredUser("email", email.trim().toLowerCase());
  return Boolean(user?.activo && verifyPassword(password, user.passwordHash));
}

export async function recordSuccessfulLogin(userId: string): Promise<void> {
  const { error } = await getSupabaseAdmin()
    .from("usuarios")
    .update({ ultimo_login: new Date().toISOString() })
    .eq("id", userId);
  if (error) throw new Error("No se pudo actualizar el último inicio de sesión.");
}

export async function createUser(input: {
  nombre: string;
  email: string;
  password: string;
  rol?: UserRecord["rol"];
  activo?: boolean;
}): Promise<LocalUser> {
  const nombre = input.nombre.trim();
  const email = input.email.trim().toLowerCase();
  const existing = await findStoredUser("email", email);
  if (existing) throw new Error("Ya existe un usuario con ese email.");

  const { data, error } = await getSupabaseAdmin()
    .from("usuarios")
    .insert({
      nombre,
      email,
      password_hash: hashPassword(input.password),
      rol: input.rol ?? "usuario",
      activo: input.activo ?? true,
    })
    .select(USER_FIELDS)
    .single();

  if (error?.code === "23505") throw new Error("Ya existe un usuario con ese email.");
  if (error || !data) throw new Error("No se pudo crear el usuario en Supabase.");
  return sanitizeUser(mapUser(data as unknown as UserRow));
}
