import { NextResponse } from "next/server";
import { z } from "zod";
import { createUser, sanitizeUser } from "@/lib/auth/local-auth";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const nombre = String(body.nombre ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");
    if (!nombre || nombre.length > 120 || !z.email().safeParse(email).success || password.length < 8) {
      return NextResponse.json({ success: false, error: "Nombre, email y contraseña son requeridos." }, { status: 400 });
    }

    const user = await createUser({
      nombre,
      email,
      password,
      rol: "usuario",
      activo: true,
    });

    return NextResponse.json({ success: true, data: sanitizeUser({
      ...user,
      passwordHash: "",
    }) }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo crear el usuario.";
    return NextResponse.json({ success: false, error: message }, { status: message.includes("Ya existe") ? 409 : 500 });
  }
}
