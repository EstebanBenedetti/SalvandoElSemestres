import { exigirSesion } from "@/lib/auth/sesion";
import {
  crearEstudiante,
  listarEstudiantes,
} from "@/lib/dataService";
import {
  conManejoDeErrores,
  leerCuerpo,
  responderOk,
} from "@/lib/http/respuestas";
import {
  esquemaEstudiante,
  esquemaFiltrosEstudiantes,
} from "@/lib/validacion/esquemas";

export const dynamic = "force-dynamic";

export const GET = conManejoDeErrores(async (request: Request) => {
  await exigirSesion();

  const parametros = new URL(request.url).searchParams;
  const filtrosValidados = esquemaFiltrosEstudiantes.parse({
    incluirInactivos: parametros.get("incluirInactivos") ?? undefined,
    busqueda: parametros.get("busqueda") ?? undefined,
  });
  const { busqueda } = filtrosValidados;
  const filtros = {
    incluirInactivos: filtrosValidados.incluirInactivos,
    ...(busqueda === undefined ? {} : { busqueda }),
  };
  const estudiantes = await listarEstudiantes(filtros);
  return responderOk(estudiantes);
});

export const POST = conManejoDeErrores(async (request: Request) => {
  await exigirSesion();

  const cuerpo = await leerCuerpo(request, esquemaEstudiante);
  const estudiante = await crearEstudiante(cuerpo.nombre);
  return responderOk(estudiante, 201);
});
