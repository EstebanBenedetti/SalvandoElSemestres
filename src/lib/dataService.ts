import "server-only";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export type UsuarioRecuperacion = {
  id: string;
  email: string;
  activo: boolean;
};

export type TokenRecuperacion = {
  id: string;
  usuario_id: string;
};

export async function buscarUsuarioPorEmail(email: string): Promise<UsuarioRecuperacion | null> {
  const { data, error } = await getSupabaseAdmin()
    .from("usuarios")
    .select("id,email,activo")
    .eq("email", email.trim().toLowerCase())
    .maybeSingle();
  if (error) throw new Error("No se pudo consultar la cuenta.");
  return data;
}

export async function contarSolicitudesRecuperacion(usuarioId: string): Promise<number> {
  const { data, error } = await getSupabaseAdmin()
    .rpc("contar_solicitudes_rest_contrasena", { p_usuario_id: usuarioId });
  if (error) throw new Error("No se pudo comprobar el límite de solicitudes.");
  return data;
}

export async function invalidarTokensPendientes(usuarioId: string): Promise<void> {
  const { error } = await getSupabaseAdmin()
    .from("restablecimientos_contrasena")
    .update({ usado_en: new Date().toISOString() })
    .eq("usuario_id", usuarioId)
    .is("usado_en", null);
  if (error) throw new Error("No se pudieron invalidar los enlaces anteriores.");
}

export async function crearTokenRecuperacion(
  usuarioId: string,
  tokenHash: string,
  expiraEn: string,
): Promise<void> {
  const { error } = await getSupabaseAdmin()
    .from("restablecimientos_contrasena")
    .insert({ usuario_id: usuarioId, token_hash: tokenHash, expira_en: expiraEn });
  if (error) throw new Error("No se pudo crear el enlace de recuperación.");
}

export async function buscarTokenVigentePorHash(tokenHash: string): Promise<TokenRecuperacion | null> {
  const { data, error } = await getSupabaseAdmin()
    .rpc("buscar_token_rest_contrasena_vigente", { p_token_hash: tokenHash });
  if (error) throw new Error("No se pudo validar el enlace de recuperación.");
  return data[0] ?? null;
}

export async function marcarTokenComoUsado(tokenId: string): Promise<boolean> {
  const { data, error } = await getSupabaseAdmin()
    .rpc("marcar_token_rest_contrasena_usado", { p_token_id: tokenId });
  if (error) throw new Error("No se pudo consumir el enlace de recuperación.");
  return data;
}

export async function actualizarContrasena(usuarioId: string, contrasenaHash: string): Promise<void> {
  const { error } = await getSupabaseAdmin()
    .from("usuarios")
    .update({ password_hash: contrasenaHash })
    .eq("id", usuarioId);
  if (error) throw new Error("No se pudo actualizar la contraseña.");
}

export async function completarRestablecimiento(
  tokenId: string,
  usuarioId: string,
  contrasenaHash: string,
): Promise<boolean> {
  const { data, error } = await getSupabaseAdmin()
    .rpc("completar_rest_contrasena", {
      p_token_id: tokenId,
      p_usuario_id: usuarioId,
      p_password_hash: contrasenaHash,
    });
  if (error) throw new Error("No se pudo completar el restablecimiento.");
  return data;
}
