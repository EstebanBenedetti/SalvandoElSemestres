import { NextResponse } from "next/server";
import { createToken, findUserByEmail, recordSuccessfulLogin, sanitizeUser, verifyCredentials } from "@/lib/auth/local-auth";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");

    if (!email || !password) {
      return NextResponse.json({ success: false, error: "Email y contraseña son requeridos." }, { status: 400 });
    }

    if (!(await verifyCredentials(email, password))) {
      return NextResponse.json({ success: false, error: "Credenciales inválidas." }, { status: 401 });
    }

    const user = await findUserByEmail(email);
    if (!user || !user.activo) {
      return NextResponse.json({ success: false, error: "Credenciales inválidas." }, { status: 401 });
    }
    await recordSuccessfulLogin(user.id);

    const token = createToken({
      id: user.id,
      nombre: user.nombre,
      email: user.email,
      passwordHash: "",
      rol: user.rol,
      activo: user.activo,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });

    const response = NextResponse.json({
      success: true,
      data: {
        token,
        user: sanitizeUser({
          id: user.id,
          nombre: user.nombre,
          email: user.email,
          passwordHash: "",
          rol: user.rol,
          activo: user.activo,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        }),
      },
    });

    response.cookies.set("auth_token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: "No se pudo iniciar sesión." }, { status: 500 });
  }
}
