import { NextRequest, NextResponse } from "next/server";
import { findUserByEmail, sanitizeUser } from "@/lib/auth/local-auth";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth_token")?.value;
    if (!token) {
      return NextResponse.json({ success: false, error: "No autenticado." }, { status: 401 });
    }

    const payload = JSON.parse(Buffer.from(token, "base64url").toString("utf8"));
    const user = await findUserByEmail(payload.email);
    if (!user) {
      return NextResponse.json({ success: false, error: "Usuario no encontrado." }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      data: sanitizeUser({
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        passwordHash: "",
        rol: user.rol,
        activo: user.activo,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      }),
    });
  } catch {
    return NextResponse.json({ success: false, error: "Token inválido." }, { status: 401 });
  }
}
