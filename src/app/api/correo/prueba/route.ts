import { NextResponse } from "next/server";
import { z } from "zod";
import { enviarCorreo } from "@/lib/correo";

const solicitudSchema = z.object({ para: z.email() });

export async function POST(solicitud: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ ok: false, error: "No encontrado." }, { status: 404 });
  }

  const cuerpo = await solicitud.json().catch(() => null);
  const resultadoValidacion = solicitudSchema.safeParse(cuerpo);
  if (!resultadoValidacion.success) {
    return NextResponse.json({ ok: false, error: "Ingresa una dirección de correo válida." }, { status: 400 });
  }

  const resultado = await enviarCorreo({
    para: resultadoValidacion.data.para,
    asunto: "Prueba de correo",
    html: "<p>El envío de correo de SalvandoElSemestre funciona correctamente.</p>",
  });

  if (!resultado.ok) {
    return NextResponse.json({ ok: false, error: resultado.error }, { status: 500 });
  }

  return NextResponse.json({ ok: true, id: resultado.id, mensaje: "Correo enviado" });
}
