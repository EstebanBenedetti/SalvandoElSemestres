import Link from "next/link";
import { notFound } from "next/navigation";
import { FormularioCorte } from "@/components/notas/FormularioCorte";
import { Aviso } from "@/components/ui/Aviso";
import { obtenerEstudiante } from "@/lib/dataService";
import { ErrorDeNegocio } from "@/lib/reglas/errores";
import { esquemaId } from "@/lib/validacion/esquemas";

type PaginaCorteProps = {
  params: Promise<{ id: string }>;
};

export default async function PaginaCorte({ params }: PaginaCorteProps) {
  const { id } = await params;
  const identificador = esquemaId.safeParse(id);

  if (!identificador.success) {
    notFound();
  }

  let detalle;
  try {
    detalle = await obtenerEstudiante(identificador.data);
  } catch (error) {
    if (error instanceof ErrorDeNegocio && error.codigo === "ESTUDIANTE_NO_ENCONTRADO") {
      notFound();
    }
    throw error;
  }

  const estudiante = detalle.estudiante;

  return (
    <div className="grid gap-6">
      <div>
        <Link href={`/notas/estudiantes/${estudiante.id}`} className="text-sm font-semibold text-primario underline hover:no-underline">
          Volver al historial
        </Link>
        <h1 className="mt-4 text-3xl font-bold text-texto">Registrar corte</h1>
        <p className="mt-2 text-sm text-texto-suave">Estudiante: {estudiante.nombre}</p>
        <p className="mt-1 text-sm text-texto-suave">
          El examen final pesa el doble en el cálculo del promedio final.
        </p>
      </div>

      {!estudiante.activo ? (
        <Aviso tipo="advertencia" titulo="Estudiante inactivo">
          Este estudiante está inactivo y no se pueden registrar cortes. Regresa al historial para
          revisar la información.
        </Aviso>
      ) : (
        <FormularioCorte estudianteId={estudiante.id} />
      )}
    </div>
  );
}
