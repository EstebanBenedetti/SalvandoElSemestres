import { Tarjeta } from "@/components/ui/Tarjeta";
import { formatearNota } from "@/lib/formato";
import type { FilaEstudiante } from "@/lib/datos/tipos";

export function ResumenModulo({ estudiantes }: { estudiantes: FilaEstudiante[] }) {
  const estudiantesConCorte = estudiantes.filter((estudiante) => estudiante.ultimoCorte);

  const total = estudiantes.length;
  const aprobados = estudiantesConCorte.filter(
    (estudiante) => estudiante.ultimoCorte?.resultado === "Aprobó",
  ).length;
  const perdieron = estudiantesConCorte.filter(
    (estudiante) => estudiante.ultimoCorte?.resultado === "Perdió",
  ).length;

  const promedioGeneral = estudiantesConCorte.length
    ? estudiantesConCorte.reduce(
        (acumulado, estudiante) => acumulado + (estudiante.ultimoCorte?.promedio ?? 0),
        0,
      ) / estudiantesConCorte.length
    : 0;

  const rendimiento = estudiantesConCorte.length
    ? (aprobados / estudiantesConCorte.length) * 100
    : 0;

  const mejor = estudiantesConCorte.reduce<FilaEstudiante | null>((mejorActual, estudiante) => {
    const promedioActual = estudiante.ultimoCorte?.promedio ?? Number.NEGATIVE_INFINITY;
    const mejorPromedio = mejorActual?.ultimoCorte?.promedio ?? Number.NEGATIVE_INFINITY;
    if (promedioActual > mejorPromedio) return estudiante;
    return mejorActual;
  }, null);

  const peor = estudiantesConCorte.reduce<FilaEstudiante | null>((peorActual, estudiante) => {
    const promedioActual = estudiante.ultimoCorte?.promedio ?? Number.POSITIVE_INFINITY;
    const peorPromedio = peorActual?.ultimoCorte?.promedio ?? Number.POSITIVE_INFINITY;
    if (promedioActual < peorPromedio) return estudiante;
    return peorActual;
  }, null);

  const resumen = [
    { titulo: "Total", valor: String(total) },
    { titulo: "Aprobados", valor: String(aprobados) },
    { titulo: "Perdieron", valor: String(perdieron) },
    { titulo: "Promedio general", valor: formatearNota(promedioGeneral) },
  ];

  return (
    <section className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primario">Resumen del módulo</p>
        <span className="rounded-full border border-primario/20 bg-primario-suave px-3 py-1 text-xs font-semibold text-primario">
          Estado del grupo
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {resumen.map((item) => (
          <Tarjeta key={item.titulo} className="p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-texto-suave">{item.titulo}</p>
            <div className="mt-3 text-2xl font-bold tracking-tight text-texto">{item.valor}</div>
          </Tarjeta>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.25fr_1fr_1fr]">
        <Tarjeta className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-texto-suave">Rendimiento</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-texto">
                {estudiantesConCorte.length ? `${Math.round(rendimiento)}%` : "0%"}
              </h2>
            </div>
            <span className="rounded-full bg-aprobo-suave px-3 py-1 text-xs font-semibold text-aprobo">
              {estudiantesConCorte.length ? "En curso" : "Sin datos"}
            </span>
          </div>
          <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-fondo">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primario to-aprobo"
              style={{ width: `${Math.min(rendimiento, 100)}%` }}
            />
          </div>
          <p className="mt-3 text-sm text-texto-suave">
            {estudiantesConCorte.length
              ? `${aprobados} de ${estudiantesConCorte.length} estudiantes con corte están aprobados.`
              : "Todavía no hay cortes registrados para calcular la tasa de aprobación."}
          </p>
        </Tarjeta>

        <Tarjeta className="p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-texto-suave">Mejor promedio</p>
              <div className="mt-2 text-xl font-bold text-texto">
                {mejor?.ultimoCorte ? mejor.nombre : "Sin datos"}
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-texto-suave">Nota</p>
              <div className="mt-2 text-lg font-semibold tabular-nums text-primario">
                {mejor?.ultimoCorte ? formatearNota(mejor.ultimoCorte.promedio) : "—"}
              </div>
            </div>
          </div>
        </Tarjeta>

        <Tarjeta className="p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-texto-suave">Peor promedio</p>
              <div className="mt-2 text-xl font-bold text-texto">
                {peor?.ultimoCorte ? peor.nombre : "Sin datos"}
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-texto-suave">Nota</p>
              <div className="mt-2 text-lg font-semibold tabular-nums text-perdio">
                {peor?.ultimoCorte ? formatearNota(peor.ultimoCorte.promedio) : "—"}
              </div>
            </div>
          </div>
        </Tarjeta>
      </div>
    </section>
  );
}
