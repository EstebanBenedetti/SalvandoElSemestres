import Link from "next/link";
import { AccionesReporte } from "@/components/notas/AccionesReporte";
import { formatearNota } from "@/lib/formato";
import { listarNotasReporte } from "@/lib/dataService";

export const dynamic = "force-dynamic";

export default async function PaginaReportes() {
  const registros = await listarNotasReporte();
  const cantidadCortes = registros.filter((registro) => registro.corte !== null).length;

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link href="/notas" className="no-imprimir text-sm font-semibold text-primario underline hover:no-underline">
            Volver a estudiantes
          </Link>
          <h1 className="mt-3 text-3xl font-bold text-texto">Reportes de notas</h1>
          <p className="mt-2 text-sm text-texto-suave">
            {registros.length} estudiantes · {cantidadCortes} cortes registrados
          </p>
        </div>
        <AccionesReporte />
      </div>

      <section aria-label="Detalle de estudiantes y cortes" className="overflow-hidden rounded-xl border border-borde bg-superficie">
        <div className="grid gap-3 p-3 sm:hidden">
          {registros.map(({ estudianteId, estudiante, activo, corte }) => (
            <article key={`${estudianteId}-${corte?.id ?? "sin-cortes"}`} className="rounded-lg border border-borde p-4">
              <h2 className="break-words font-semibold text-texto">{estudiante}</h2>
              <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
                <DatoReporte etiqueta="Estado" valor={activo ? "Activo" : "Inactivo"} />
                <DatoReporte etiqueta="Fecha" valor={corte?.fecha ?? "Sin cortes"} />
                <DatoReporte etiqueta="Parcial 1" valor={corte ? formatearNota(corte.parcial1) : "—"} />
                <DatoReporte etiqueta="Parcial 2" valor={corte ? formatearNota(corte.parcial2) : "—"} />
                <DatoReporte etiqueta="Examen final" valor={corte ? formatearNota(corte.examenFinal) : "—"} />
                <DatoReporte etiqueta="Promedio" valor={corte ? formatearNota(corte.promedio) : "—"} />
                <DatoReporte etiqueta="Resultado" valor={corte?.resultado ?? "—"} />
                <DatoReporte etiqueta="Registrado por" valor={corte?.registradoPor ?? "No disponible"} />
              </dl>
            </article>
          ))}
        </div>

        <div className="hidden overflow-x-auto sm:block">
          <table className="w-full border-collapse text-left text-sm">
            <caption className="sr-only">Detalle de estudiantes, notas y autoría de cada corte</caption>
            <thead className="bg-fondo text-texto-suave">
              <tr>
                {["Estudiante", "Estado", "Fecha", "Parcial 1", "Parcial 2", "Examen final", "Promedio", "Resultado", "Registrado por"].map((titulo) => (
                  <th key={titulo} scope="col" className="whitespace-nowrap px-4 py-3 font-semibold">
                    {titulo}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-borde">
              {registros.map(({ estudianteId, estudiante, activo, corte }) => (
                <tr key={`${estudianteId}-${corte?.id ?? "sin-cortes"}`}>
                  <td className="px-4 py-3 font-medium text-texto">{estudiante}</td>
                  <td className="px-4 py-3 text-texto">{activo ? "Activo" : "Inactivo"}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-texto">{corte?.fecha ?? "Sin cortes"}</td>
                  <td className="px-4 py-3 tabular-nums text-texto">{corte ? formatearNota(corte.parcial1) : "—"}</td>
                  <td className="px-4 py-3 tabular-nums text-texto">{corte ? formatearNota(corte.parcial2) : "—"}</td>
                  <td className="px-4 py-3 tabular-nums text-texto">{corte ? formatearNota(corte.examenFinal) : "—"}</td>
                  <td className="px-4 py-3 font-semibold tabular-nums text-texto">{corte ? formatearNota(corte.promedio) : "—"}</td>
                  <td className="px-4 py-3 text-texto">{corte?.resultado ?? "—"}</td>
                  <td className="max-w-56 truncate px-4 py-3 text-texto">{corte?.registradoPor ?? "No disponible"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function DatoReporte({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-texto-suave">{etiqueta}</dt>
      <dd className="mt-1 break-words text-texto">{valor}</dd>
    </div>
  );
}