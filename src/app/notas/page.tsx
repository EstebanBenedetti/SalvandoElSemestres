import Link from "next/link";
import { TablaEstudiantes } from "@/components/notas/TablaEstudiantes";
import { listarEstudiantes } from "@/lib/dataService";

type PaginaNotasProps = {
  searchParams: Promise<{ busqueda?: string }>;
};

export default async function PaginaNotas({ searchParams }: PaginaNotasProps) {
  const parametros = await searchParams;
  const busquedaInicial = parametros.busqueda?.trim() ?? "";
  const estudiantes = await listarEstudiantes({ busqueda: busquedaInicial });

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-primario">NotaFlux</p>
          <h1 className="mt-1 text-3xl font-bold text-texto">Estudiantes</h1>
          <p className="mt-2 text-sm text-texto-suave">
            Consulta los promedios y el historial de cada estudiante.
          </p>
        </div>
        <Link
          href="/notas/estudiantes/nuevo"
          className="inline-flex min-h-10 items-center justify-center rounded-lg bg-primario px-4 py-2 text-sm font-semibold text-white hover:bg-[#244b8c] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primario"
        >
          Registrar estudiante
        </Link>
      </div>
      <TablaEstudiantes
        key={busquedaInicial}
        estudiantes={estudiantes}
        busquedaInicial={busquedaInicial}
      />
    </div>
  );
}
