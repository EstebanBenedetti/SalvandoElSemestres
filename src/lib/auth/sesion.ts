import { cookies } from "next/headers";
import { getAuthenticatedUser } from "@/lib/auth/local-auth";
import { ErrorDeNegocio } from "@/lib/reglas/errores";

export async function obtenerSesion(): Promise<{ email: string } | null> {
  const token = (await cookies()).get("auth_token")?.value;
  const usuario = await getAuthenticatedUser(token);
  if (!usuario) return null;

  return { email: usuario.email };
}

export async function exigirSesion(): Promise<{ email: string }> {
  const sesion = await obtenerSesion();
  if (!sesion) {
    throw new ErrorDeNegocio("NO_AUTORIZADO");
  }
  return sesion;
}
