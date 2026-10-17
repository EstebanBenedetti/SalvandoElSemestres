import "server-only";
import { getToken } from "@vercel/connect";
import { Resend } from "resend";

type CorreoEntrada = {
  para: string;
  asunto: string;
  html: string;
};

type CorreoResultado = { ok: true; id: string } | { ok: false; error: string };

export async function obtenerClaveResend(): Promise<string> {
  if (process.env.RESEND_API_KEY) return process.env.RESEND_API_KEY;

  return getToken("resend/salvandoelsemestres", { subject: { type: "app" } });
}

export async function enviarCorreo({ para, asunto, html }: CorreoEntrada): Promise<CorreoResultado> {
  try {
    const clave = await obtenerClaveResend();
    const resend = new Resend(clave);
    const { data: datos, error: errorResend } = await resend.emails.send({
      from: process.env.RESEND_FROM || "onboarding@resend.dev",
      to: para,
      subject: asunto,
      html,
    });

    if (errorResend) return { ok: false, error: errorResend.message };
    if (!datos?.id) return { ok: false, error: "El servicio de correo no devolvió un identificador de envío." };
    return { ok: true, id: datos.id };
  } catch (errorEnvio) {
    return {
      ok: false,
      error: errorEnvio instanceof Error ? errorEnvio.message : "No se pudo conectar con el servicio de correo.",
    };
  }
}
