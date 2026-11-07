import { exigirSesion } from "@/lib/auth/sesion";
import { listarNotasReporte } from "@/lib/dataService";
import { conManejoDeErrores } from "@/lib/http/respuestas";
import { serializarNotasCSV } from "@/lib/reportes/csv";

export const dynamic = "force-dynamic";

export const GET = conManejoDeErrores(async () => {
  await exigirSesion();
  const contenido = serializarNotasCSV(await listarNotasReporte());
  const fecha = new Date().toISOString().slice(0, 10);

  return new Response(contenido, {
    headers: {
      "Cache-Control": "no-store",
      "Content-Disposition": `attachment; filename="notaflux-notas-${fecha}.csv"`,
      "Content-Type": "text/csv; charset=utf-8",
    },
  });
});