import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/local-auth";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth_token")?.value;
    const user = await getAuthenticatedUser(token);
    if (!user) {
      return NextResponse.json({ success: false, error: "Usuario no encontrado." }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch {
    return NextResponse.json({ success: false, error: "Token inválido." }, { status: 401 });
  }
}
