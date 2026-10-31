import { exigirSesion } from "@/lib/auth/sesion";
import { obtenerExtremosGrupo } from "@/lib/dataService";
import { conManejoDeErrores, responderOk } from "@/lib/http/respuestas";

export const dynamic = "force-dynamic";

export const GET = conManejoDeErrores(async () => {
  await exigirSesion();

  const extremos = await obtenerExtremosGrupo();
  return responderOk(extremos);
});
