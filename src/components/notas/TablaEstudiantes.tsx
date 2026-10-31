"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { InsigniaResultado } from "@/components/notas/InsigniaResultado";
import { Campo } from "@/components/ui/Campo";
import { Tarjeta } from "@/components/ui/Tarjeta";
import { formatearFecha, formatearNota } from "@/lib/formato";
import type { FilaEstudiante } from "@/lib/datos/tipos";

export function TablaEstudiantes({
  estudiantes,
  busquedaInicial,
}: {
  estudiantes: FilaEstudiante[];
  busquedaInicial: string;
}) {
  const [busqueda, setBusqueda] = useState(busquedaInicial);
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const temporizador = window.setTimeout(() => {
      const parametros = new URLSearchParams(searchParams.toString());
      const valor = busqueda.trim();
      if (valor) parametros.set("busqueda", valor);
      else parametros.delete("busqueda");
      const consulta = parametros.toString();
      const destino = consulta ? `${pathname}?${consulta}` : pathname;
      const actual = `${pathname}${searchParams.size ? `?${searchParams.toString()}` : ""}`;
      if (destino !== actual) router.replace(destino, { scroll: false });
    }, 300);
    return () => window.clearTimeout(temporizador);
  }, [busqueda, pathname, router, searchParams]);

  const columnas = ["Estudiante", "Cortes", "Último promedio", "Fecha del último corte"];

  return (
    <div className="grid gap-4">
      <Campo
        etiqueta="Buscar estudiante"
        type="search"
        placeholder="Escribe un nombre"
        value={busqueda}
        onChange={(evento) => setBusqueda(evento.target.value)}
        autoComplete="off"
      />
      {estudiantes.length === 0 ? (
        <Tarjeta>
          <div className="grid justify-items-center gap-2 px-5 py-12 text-center">
            <h2 className="text-lg font-semibold text-texto">
              {busquedaInicial ? "No se encontraron estudiantes" : "Aún no hay estudiantes"}
            </h2>
            <p className="text-sm text-texto-suave">
              {busquedaInicial
                ? "Prueba con otro nombre o modifica la búsqueda."
                : "Registra el primer estudiante para empezar a llevar su historial."}
            </p>
          </div>
        </Tarjeta>
      ) : (
        <>
          <div className="grid gap-3 sm:hidden">
            {estudiantes.map((estudiante) => (
              <Tarjeta key={estudiante.id} className="p-4">
                <Link
                  href={`/notas/estudiantes/${estudiante.id}`}
                  className="text-base font-semibold text-primario underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-primario"
                >
                  {estudiante.nombre}
                </Link>
                <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <dt className="text-texto-suave">Cortes</dt>
                    <dd className="mt-1 tabular-nums text-texto">{estudiante.totalCortes}</dd>
                  </div>
                  <div>
                    <dt className="text-texto-suave">Último promedio</dt>
                    <dd className="mt-1 flex flex-wrap items-center gap-2 tabular-nums text-texto">
                      {estudiante.ultimoCorte ? (
                        <>
                          {formatearNota(estudiante.ultimoCorte.promedio)}
                          <InsigniaResultado resultado={estudiante.ultimoCorte.resultado} />
                        </>
                      ) : (
                        "Sin cortes"
                      )}
                    </dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="text-texto-suave">Fecha del último corte</dt>
                    <dd className="mt-1 text-texto">
                      {estudiante.ultimoCorte ? formatearFecha(estudiante.ultimoCorte.fecha) : "—"}
                    </dd>
                  </div>
                </dl>
              </Tarjeta>
            ))}
          </div>
          <Tarjeta className="hidden overflow-hidden sm:block">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead className="bg-fondo text-texto-suave">
                  <tr>
                    {columnas.map((columna) => (
                      <th key={columna} scope="col" className="px-4 py-3 font-semibold">
                        {columna}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-borde">
                  {estudiantes.map((estudiante) => (
                    <tr key={estudiante.id} className="hover:bg-fondo/70">
                      <td className="px-4 py-3 font-medium">
                        <Link
                          href={`/notas/estudiantes/${estudiante.id}`}
                          className="text-primario underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-primario"
                        >
                          {estudiante.nombre}
                        </Link>
                      </td>
                      <td className="px-4 py-3 tabular-nums text-texto">{estudiante.totalCortes}</td>
                      <td className="px-4 py-3">
                        {estudiante.ultimoCorte ? (
                          <span className="flex items-center gap-2 tabular-nums text-texto">
                            {formatearNota(estudiante.ultimoCorte.promedio)}
                            <InsigniaResultado resultado={estudiante.ultimoCorte.resultado} />
                          </span>
                        ) : (
                          <span className="text-texto-suave">Sin cortes</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-texto">
                        {estudiante.ultimoCorte ? formatearFecha(estudiante.ultimoCorte.fecha) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Tarjeta>
        </>
      )}
    </div>
  );
}
