import { NextRequest, NextResponse } from "next/server";
import { findUserById, sanitizeUser, verifyToken } from "@/lib/auth/local-auth";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth_token")?.value;
    if (!token) {
      return NextResponse.json({ success: false, error: "No autenticado." }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ success: false, error: "Token inválido." }, { status: 401 });
    }

    const user = await findUserById(payload.sub);
    if (!user || !user.activo) {
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
