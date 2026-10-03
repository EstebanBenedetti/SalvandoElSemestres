import { NextResponse } from "next/server";
import { createUser, sanitizeUser } from "@/lib/auth/local-auth";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const nombre = String(body.nombre ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");
    const rol = String(body.rol ?? "usuario");

    if (!nombre || !email || !password) {
      return NextResponse.json({ success: false, error: "Nombre, email y contraseña son requeridos." }, { status: 400 });
    }

    const user = await createUser({
      nombre,
      email,
      password,
      rol: rol === "admin" || rol === "coordinador" ? rol : "usuario",
      activo: true,
    });

    return NextResponse.json({ success: true, data: sanitizeUser({
      id: user.id,
      nombre: user.nombre,
      email: user.email,
      passwordHash: "",
      rol: user.rol,
      activo: user.activo,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }) }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo crear el usuario.";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
