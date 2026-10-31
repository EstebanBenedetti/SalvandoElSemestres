import { cookies } from "next/headers";
import { findUserById, verifyToken } from "@/lib/auth/local-auth";
import { ErrorDeNegocio } from "@/lib/reglas/errores";

export async function obtenerSesion(): Promise<{ email: string } | null> {
  const token = (await cookies()).get("auth_token")?.value;
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload) return null;

  const usuario = await findUserById(payload.sub);
  if (!usuario?.activo) return null;

  return { email: usuario.email };
}

export async function exigirSesion(): Promise<{ email: string }> {
  const sesion = await obtenerSesion();
  if (!sesion) {
    throw new ErrorDeNegocio("NO_AUTORIZADO");
  }
  return sesion;
}
