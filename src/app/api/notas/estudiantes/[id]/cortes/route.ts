import { exigirSesion } from "@/lib/auth/sesion";
import {
  obtenerEstudiante,
  registrarCorte,
} from "@/lib/dataService";
import {
  conManejoDeErrores,
  leerCuerpo,
  responderOk,
} from "@/lib/http/respuestas";
import {
  esquemaCorte,
  esquemaId,
} from "@/lib/validacion/esquemas";

type ParametrosRuta = {
  params: Promise<{ id: string }>;
};

export const dynamic = "force-dynamic";

export const GET = conManejoDeErrores(
  async (_request: Request, contexto: ParametrosRuta) => {
    await exigirSesion();

    const { id } = await contexto.params;
    const estudiante = await obtenerEstudiante(esquemaId.parse(id));
    return responderOk(estudiante.cortes);
  },
);

export const POST = conManejoDeErrores(
  async (request: Request, contexto: ParametrosRuta) => {
    await exigirSesion();

    const { id } = await contexto.params;
    const estudianteId = esquemaId.parse(id);
    const cuerpo = await leerCuerpo(request, esquemaCorte);
    const corte = await registrarCorte({ ...cuerpo, estudianteId });
    return responderOk(corte, 201);
  },
);
