import { formatearFecha, formatearNota } from "@/lib/formato";
import type { Corte } from "@/lib/datos/tipos";

export function TendenciaEstudiante({ cortes }: { cortes: Corte[] }) {
  if (cortes.length === 0) return null;

  const cronologicos = [...cortes].reverse();
  const primero = cronologicos[0];
  const ultimo = cronologicos.at(-1);
  if (!primero || !ultimo) return null;

  const cambio = Number((ultimo.promedio - primero.promedio).toFixed(2));
  const resumen =
    cronologicos.length < 2
      ? "Registra otro corte para comparar el rendimiento."
      : cambio > 0
        ? `Subió ${formatearNota(cambio)} desde el primer corte.`
        : cambio < 0
          ? `Bajó ${formatearNota(Math.abs(cambio))} desde el primer corte.`
          : "Se mantiene igual que en el primer corte.";

  return (
    <section aria-labelledby="titulo-tendencia" className="rounded-xl border border-borde bg-superficie p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h2 id="titulo-tendencia" className="text-lg font-bold text-texto">Evolución del promedio</h2>
          <p className="mt-1 text-sm text-texto-suave">{resumen}</p>
        </div>
        <p className="text-sm font-semibold text-primario">{cronologicos.length} cortes</p>
      </div>

      <ol aria-label="Promedio por corte, del más antiguo al más reciente" className="mt-5 grid gap-3">
        {cronologicos.map((corte, indice) => (
          <li key={corte.id} className="grid grid-cols-[minmax(5rem,auto)_1fr_auto] items-center gap-3 text-sm">
            <time dateTime={corte.fecha} className="text-texto-suave">{formatearFecha(corte.fecha)}</time>
            <div
              role="meter"
              aria-label={`Corte ${indice + 1}: promedio ${formatearNota(corte.promedio)} sobre 5`}
              aria-valuemin={0}
              aria-valuemax={5}
              aria-valuenow={corte.promedio}
              className="h-3 overflow-hidden rounded-full bg-fondo"
            >
              <div
                className="h-full rounded-full bg-gradient-to-r from-primario to-aprobo"
                style={{ width: `${Math.min(Math.max(corte.promedio, 0), 5) * 20}%` }}
              />
            </div>
            <span className="min-w-12 text-right font-semibold tabular-nums text-texto">
              {formatearNota(corte.promedio)}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}