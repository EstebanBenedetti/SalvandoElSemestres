import Link from "next/link";
import { ResumenModulo } from "@/components/notas/ResumenModulo";
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
      <section className="rounded-2xl border border-borde bg-superficie p-5 shadow-[0_12px_30px_rgba(15,23,42,0.04)] sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primario">NotaFlux</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-texto">Estudiantes</h1>
            <p className="mt-2 text-sm text-texto-suave">
              Consulta los promedios y el historial de cada estudiante.
            </p>
          </div>
          <Link
            href="/notas/estudiantes/nuevo"
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-primario px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-900/15 transition-colors hover:bg-[#244b8c] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primario"
          >
            Registrar estudiante
          </Link>
        </div>
      </section>
      <ResumenModulo estudiantes={estudiantes} />
      <TablaEstudiantes
        key={busquedaInicial}
        estudiantes={estudiantes}
        busquedaInicial={busquedaInicial}
      />
    </div>
  );
}
