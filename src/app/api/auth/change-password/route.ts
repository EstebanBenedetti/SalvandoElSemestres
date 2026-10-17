import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { changePassword, verifyToken } from "@/lib/auth/local-auth";

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(128),
});

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("auth_token")?.value;
    const payload = token ? verifyToken(token) : null;
    if (!payload) {
      return NextResponse.json({ success: false, error: "Inicia sesión para continuar." }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    const parsed = changePasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "La contraseña nueva debe tener entre 8 y 128 caracteres." },
        { status: 400 },
      );
    }

    const result = await changePassword(payload.sub, parsed.data.currentPassword, parsed.data.newPassword);
    if (result === "invalid-current-password") {
      return NextResponse.json({ success: false, error: "La contraseña actual es incorrecta." }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: "Tu contraseña se actualizó correctamente." });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: "No se pudo actualizar la contraseña." }, { status: 500 });
  }
}
