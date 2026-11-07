import { InsigniaResultado } from "@/components/notas/InsigniaResultado";
import { EstadoVacio } from "@/components/ui/EstadoVacio";
import { Tarjeta } from "@/components/ui/Tarjeta";
import { formatearFecha, formatearNota } from "@/lib/formato";
import type { Corte } from "@/lib/datos/tipos";

const columnas = ["Fecha", "Parcial 1", "Parcial 2", "Examen final", "Promedio", "Resultado", "Registrado por"];

export function TablaHistorial({
  cortes,
  estudianteId,
  activo = true,
}: {
  cortes: Corte[];
  estudianteId: string;
  activo?: boolean;
}) {
  if (cortes.length === 0) {
    return (
      <Tarjeta>
        <EstadoVacio
          titulo="Este estudiante aún no tiene cortes"
          descripcion={
            activo
              ? "Registra el primer corte para iniciar su historial académico."
              : "El estudiante está inactivo y no puede recibir nuevos cortes."
          }
          {...(activo
            ? {
                href: `/notas/estudiantes/${estudianteId}/corte`,
                accion: "Registrar corte",
              }
            : {})}
        />
      </Tarjeta>
    );
  }

  return (
    <Tarjeta className="overflow-hidden">
      <div className="grid gap-3 p-3 sm:hidden">
        {cortes.map((corte) => (
          <article key={corte.id} className="rounded-lg border border-borde p-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-semibold text-texto">{formatearFecha(corte.fecha)}</h3>
              <InsigniaResultado resultado={corte.resultado} />
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <DatoCorte etiqueta="Parcial 1" valor={formatearNota(corte.parcial1)} />
              <DatoCorte etiqueta="Parcial 2" valor={formatearNota(corte.parcial2)} />
              <DatoCorte etiqueta="Examen final" valor={formatearNota(corte.examenFinal)} />
              <DatoCorte etiqueta="Promedio" valor={formatearNota(corte.promedio)} destacado />
              <DatoCorte etiqueta="Registrado por" valor={corte.registradoPor ?? "No disponible"} />
            </dl>
          </article>
        ))}
      </div>
      <div className="hidden overflow-x-auto sm:block">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-fondo text-texto-suave">
            <tr>
              {columnas.map((columna) => (
                <th key={columna} scope="col" className="whitespace-nowrap px-4 py-3 font-semibold">
                  {columna}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-borde">
            {cortes.map((corte) => (
              <tr key={corte.id}>
                <td className="whitespace-nowrap px-4 py-3 text-texto">{formatearFecha(corte.fecha)}</td>
                <td className="px-4 py-3 tabular-nums text-texto">{formatearNota(corte.parcial1)}</td>
                <td className="px-4 py-3 tabular-nums text-texto">{formatearNota(corte.parcial2)}</td>
                <td className="px-4 py-3 tabular-nums text-texto">{formatearNota(corte.examenFinal)}</td>
                <td className="px-4 py-3 font-semibold tabular-nums text-texto">
                  {formatearNota(corte.promedio)}
                </td>
                <td className="px-4 py-3">
                  <InsigniaResultado resultado={corte.resultado} />
                </td>
                <td className="max-w-56 truncate px-4 py-3 text-texto">
                  {corte.registradoPor ?? "No disponible"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Tarjeta>
  );
}

function DatoCorte({
  etiqueta,
  valor,
  destacado = false,
}: {
  etiqueta: string;
  valor: string;
  destacado?: boolean;
}) {
  return (
    <div>
      <dt className="text-texto-suave">{etiqueta}</dt>
      <dd className={`mt-1 tabular-nums ${destacado ? "font-bold text-texto" : "text-texto"}`}>
        {valor}
      </dd>
    </div>
  );
}
