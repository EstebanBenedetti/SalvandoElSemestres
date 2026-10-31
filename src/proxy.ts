import { NextResponse, type NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth/local-auth";
import { ESTADO_HTTP, MENSAJES } from "@/lib/reglas/errores";

function tieneSesion(request: NextRequest): boolean {
  const token = request.cookies.get("auth_token")?.value;
  return Boolean(token && verifyToken(token));
}

export function proxy(request: NextRequest) {
  if (tieneSesion(request)) {
    return NextResponse.next();
  }

  if (request.nextUrl.pathname.startsWith("/api/notas/")) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          codigo: "NO_AUTORIZADO",
          mensaje: MENSAJES.NO_AUTORIZADO,
          detalles: null,
        },
      },
      {
        status: ESTADO_HTTP.NO_AUTORIZADO,
        headers: { "Cache-Control": "no-store" },
      },
    );
  }

  const destino = request.nextUrl.clone();
  destino.pathname = "/login";
  destino.searchParams.set("returnTo", `${request.nextUrl.pathname}${request.nextUrl.search}`);
  return NextResponse.redirect(destino);
}

export const config = {
  matcher: ["/notas/:path*", "/api/notas/:path*"],
};
