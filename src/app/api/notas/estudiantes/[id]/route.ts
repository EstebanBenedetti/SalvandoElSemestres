import { exigirSesion } from "@/lib/auth/sesion";
import {
  desactivarEstudiante,
  obtenerEstudiante,
} from "@/lib/dataService";
import {
  conManejoDeErrores,
  leerCuerpo,
  responderOk,
} from "@/lib/http/respuestas";
import {
  esquemaDesactivar,
  esquemaId,
} from "@/lib/validacion/esquemas";

type ParametrosRuta = {
  params: Promise<{ id: string }>;
};

export const dynamic = "force-dynamic";

export const GET = conManejoDeErrores(async (_request: Request, contexto: ParametrosRuta) => {
  await exigirSesion();

  const { id } = await contexto.params;
  const estudiante = await obtenerEstudiante(esquemaId.parse(id));
  return responderOk(estudiante);
});

export const PATCH = conManejoDeErrores(
  async (request: Request, contexto: ParametrosRuta) => {
    await exigirSesion();

    const { id } = await contexto.params;
    const identificador = esquemaId.parse(id);
    await leerCuerpo(request, esquemaDesactivar);
    await desactivarEstudiante(identificador);
    return responderOk({ actualizado: true });
  },
);
