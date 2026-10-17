import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import {
  buscarTokenVigentePorHash,
  completarRestablecimiento,
} from "@/lib/dataService";
import { calcularHashToken } from "@/lib/tokenRecuperacion";

const solicitudSchema = z.object({
  token: z.string().regex(/^[a-f\d]{64}$/i, "El enlace no es válido o ya venció."),
  contrasena: z.string().min(8, "La contraseña debe tener al menos 8 caracteres."),
  confirmacion: z.string(),
}).refine((datos) => datos.contrasena === datos.confirmacion, {
  path: ["confirmacion"],
  message: "Las contraseñas no coinciden.",
});

const errorEnlace = "El enlace no es válido o ya venció.";

export async function POST(solicitud: Request) {
  const cuerpo = await solicitud.json().catch(() => null);
  const validacion = solicitudSchema.safeParse(cuerpo);
  if (!validacion.success) {
    return NextResponse.json({
      success: false,
      error: validacion.error.issues[0]?.message ?? "Revisa los datos de la contraseña.",
    }, { status: 400 });
  }

  try {
    const token = await buscarTokenVigentePorHash(calcularHashToken(validacion.data.token));
    if (!token) {
      return NextResponse.json({ success: false, error: errorEnlace }, { status: 400 });
    }

    const contrasenaHash = await bcrypt.hash(validacion.data.contrasena, 12);
    if (!(await completarRestablecimiento(token.id, token.usuario_id, contrasenaHash))) {
      return NextResponse.json({ success: false, error: errorEnlace }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: "La contraseña se restableció correctamente." });
  } catch {
    return NextResponse.json({ success: false, error: "No se pudo restablecer la contraseña. Inténtalo de nuevo." }, { status: 500 });
  }
}
