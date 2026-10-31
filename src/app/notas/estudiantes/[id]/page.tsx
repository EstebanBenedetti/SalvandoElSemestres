import Link from "next/link";
import { notFound } from "next/navigation";
import { DesactivarEstudiante } from "@/components/notas/DesactivarEstudiante";
import { TablaHistorial } from "@/components/notas/TablaHistorial";
import { Insignia } from "@/components/ui/Insignia";
import { obtenerEstudiante } from "@/lib/dataService";
import { formatearFecha } from "@/lib/formato";
import { ErrorDeNegocio } from "@/lib/reglas/errores";
import { esquemaId } from "@/lib/validacion/esquemas";

type PaginaHistorialProps = {
  params: Promise<{ id: string }>;
};

export default async function PaginaHistorial({ params }: PaginaHistorialProps) {
  const { id } = await params;
  const identificador = esquemaId.safeParse(id);
  if (!identificador.success) notFound();

  let detalle;
  try {
    detalle = await obtenerEstudiante(identificador.data);
  } catch (error) {
    if (error instanceof ErrorDeNegocio && error.codigo === "ESTUDIANTE_NO_ENCONTRADO") {
      notFound();
    }
    throw error;
  }

  const { estudiante, cortes } = detalle;

  return (
    <div className="grid gap-6">
      <div>
        <Link href="/notas" className="text-sm font-semibold text-primario underline hover:no-underline">
          Volver a estudiantes
        </Link>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-bold text-texto">{estudiante.nombre}</h1>
          {!estudiante.activo ? <Insignia tono="inactivo">Inactivo</Insignia> : null}
        </div>
        <p className="mt-2 text-sm text-texto-suave">
          Registrado el {formatearFecha(estudiante.fechaRegistro)} · {estudiante.totalCortes}{" "}
          {estudiante.totalCortes === 1 ? "corte" : "cortes"}
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        {estudiante.activo ? (
          <Link
            href={`/notas/estudiantes/${estudiante.id}/corte`}
            className="inline-flex min-h-10 items-center justify-center rounded-lg border border-transparent bg-primario px-4 py-2 text-sm font-semibold text-white hover:bg-[#244b8c] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primario"
          >
            Registrar corte
          </Link>
        ) : null}
        {estudiante.activo ? <DesactivarEstudiante estudianteId={estudiante.id} /> : null}
      </div>
      <section className="grid gap-3">
        <div>
          <h2 className="text-xl font-bold text-texto">Historial de cortes</h2>
          <p className="mt-1 text-sm text-texto-suave">Del más reciente al más antiguo.</p>
        </div>
        <TablaHistorial cortes={cortes} estudianteId={estudiante.id} activo={estudiante.activo} />
      </section>
    </div>
  );
}
