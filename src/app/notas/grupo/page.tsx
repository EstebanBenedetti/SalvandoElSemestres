import Link from "next/link";
import { PanelGrupo } from "@/components/notas/PanelGrupo";
import { obtenerExtremosGrupo } from "@/lib/dataService";

export default async function PaginaGrupo() {
  const datos = await obtenerExtremosGrupo();

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/notas" className="text-sm font-semibold text-primario underline hover:no-underline">
            Volver a estudiantes
          </Link>
          <h1 className="mt-3 text-3xl font-bold text-texto">Grupo</h1>
          <p className="mt-2 text-sm text-texto-suave">
            Promedio más alto y más bajo según el último corte de cada estudiante activo.
          </p>
        </div>
      </div>

      <PanelGrupo datos={datos} />
    </div>
  );
}
