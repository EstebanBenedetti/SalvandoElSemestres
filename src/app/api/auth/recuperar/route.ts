import { NextResponse } from "next/server";
import { z } from "zod";
import {
  buscarUsuarioPorEmail,
  contarSolicitudesRecuperacion,
  crearTokenRecuperacion,
  invalidarTokensPendientes,
} from "@/lib/dataService";
import { enviarCorreo } from "@/lib/correo";
import { plantillaRecuperacion } from "@/lib/plantillasCorreo";
import { calcularHashToken, generarToken } from "@/lib/tokenRecuperacion";
import { obtenerUrlBase } from "@/lib/urlBase";

const solicitudSchema = z.object({ email: z.email() });
const mensajeGenerico = "Si el correo está registrado, recibirás un enlace para restablecer la contraseña.";

export async function POST(solicitud: Request) {
  const cuerpo = await solicitud.json().catch(() => null);
  const validacion = solicitudSchema.safeParse(cuerpo);
  if (!validacion.success) {
    return NextResponse.json({ success: false, error: "Ingresa una dirección de correo válida." }, { status: 400 });
  }

  let etapa:
    | "consulta_usuario"
    | "limite_solicitudes"
    | "invalidar_enlaces"
    | "crear_solicitud"
    | "enviar_correo" = "consulta_usuario";

  try {
    const usuario = await buscarUsuarioPorEmail(validacion.data.email);
    if (usuario?.activo) {
      etapa = "limite_solicitudes";
      if ((await contarSolicitudesRecuperacion(usuario.id)) >= 3) {
        return NextResponse.json({ success: true, message: mensajeGenerico });
      }

      etapa = "invalidar_enlaces";
      await invalidarTokensPendientes(usuario.id);
      const token = generarToken();
      const tokenHash = calcularHashToken(token);
      const expiraEn = new Date(Date.now() + 30 * 60 * 1000).toISOString();
      etapa = "crear_solicitud";
      await crearTokenRecuperacion(usuario.id, tokenHash, expiraEn);

      const enlace = `${obtenerUrlBase()}/restablecer-contrasena?token=${token}`;
      etapa = "enviar_correo";
      const resultadoCorreo = await enviarCorreo({
        para: usuario.email,
        asunto: "Restablecer contraseña",
        html: plantillaRecuperacion(enlace),
      });
      if (!resultadoCorreo.ok) console.error("[recuperar] fallo en proveedor de correo.");
    }
  } catch (error) {
    const tipoError = error instanceof Error ? error.name : "Error";
    console.error(`[recuperar] fallo en etapa ${etapa} (${tipoError}).`);
    // Mantiene la respuesta genérica también cuando falla la base de datos o el correo.
  }

  return NextResponse.json({ success: true, message: mensajeGenerico });
}
