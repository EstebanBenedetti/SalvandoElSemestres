export function plantillaRecuperacion(enlace: string): string {
  const enlaceSeguro = enlace.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

  return `
    <div style="font-family:Arial,sans-serif;color:#0f172a;line-height:1.6;max-width:560px;margin:0 auto;padding:24px">
      <h1 style="font-size:24px">Restablecer contraseña</h1>
      <p>Recibimos una solicitud para cambiar la contraseña de tu cuenta.</p>
      <p style="margin:28px 0">
        <a href="${enlaceSeguro}" style="display:inline-block;background:#22d3ee;color:#082f49;padding:12px 20px;border-radius:6px;text-decoration:none;font-weight:bold">
          Elegir nueva contraseña
        </a>
      </p>
      <p>Este enlace vence en 30 minutos.</p>
      <p>Si no solicitaste este cambio, puedes ignorar este mensaje.</p>
    </div>
  `;
}
