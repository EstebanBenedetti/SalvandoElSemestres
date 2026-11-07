import { InsigniaResultado } from "@/components/notas/InsigniaResultado";
import { EstadoVacio } from "@/components/ui/EstadoVacio";
import { Tarjeta } from "@/components/ui/Tarjeta";
import { formatearNota } from "@/lib/formato";
import type { ExtremosGrupo } from "@/lib/datos/tipos";
import { UMBRAL_APROBACION } from "@/lib/config/notas";

export function PanelGrupo({ datos }: { datos: ExtremosGrupo }) {
  if (datos.totalEnGrupo === 0 || datos.masAltos.length === 0 || datos.masBajos.length === 0) {
    return (
      <Tarjeta>
        <EstadoVacio
          titulo="Aún no hay cortes registrados"
          descripcion="Cuando exista al menos un corte en el grupo, aquí aparecerán los máximos y mínimos del curso."
        />
      </Tarjeta>
    );
  }

  function renderLista(entrada: Array<{ nombre: string; promedio: number }>) {
    return (
      <ul className="mt-4 space-y-2">
        {entrada.map((elemento) => (
          <li
            key={`${elemento.nombre}-${elemento.promedio}`}
            className="flex items-center justify-between gap-3 rounded-lg border border-borde bg-fondo px-3 py-2"
          >
            <span className="font-medium text-texto">{elemento.nombre}</span>
            <div className="flex items-center gap-2 tabular-nums text-texto">
              {formatearNota(elemento.promedio)}
              <InsigniaResultado
                resultado={elemento.promedio >= UMBRAL_APROBACION ? "Aprobó" : "Perdió"}
              />
            </div>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Tarjeta className="p-5">
        <p className="text-sm font-semibold uppercase tracking-wide text-primario">Máximo del grupo</p>
        {renderLista(datos.masAltos)}
      </Tarjeta>

      <Tarjeta className="p-5">
        <p className="text-sm font-semibold uppercase tracking-wide text-primario">Mínimo del grupo</p>
        {renderLista(datos.masBajos)}
      </Tarjeta>

      <Tarjeta className="p-5">
        <p className="text-sm font-semibold uppercase tracking-wide text-primario">Total en grupo</p>
        <div className="mt-6 flex items-end gap-2">
          <span className="text-4xl font-bold tabular-nums text-texto">{datos.totalEnGrupo}</span>
          <span className="pb-1 text-sm text-texto-suave">estudiantes</span>
        </div>
      </Tarjeta>
    </div>
  );
}
