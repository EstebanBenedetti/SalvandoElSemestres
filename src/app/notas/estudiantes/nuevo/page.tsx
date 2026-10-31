import Link from "next/link";
import { FormularioEstudiante } from "@/components/notas/FormularioEstudiante";
import { Tarjeta } from "@/components/ui/Tarjeta";

export default function NuevoEstudiantePage() {
  return (
    <div className="mx-auto grid max-w-2xl gap-5">
      <div>
        <Link href="/notas" className="text-sm font-semibold text-primario underline hover:no-underline">
          Volver a estudiantes
        </Link>
        <h1 className="mt-4 text-3xl font-bold text-texto">Registrar estudiante</h1>
        <p className="mt-2 text-sm text-texto-suave">
          Escribe el nombre para crear su historial académico.
        </p>
      </div>
      <Tarjeta className="p-5 sm:p-6">
        <FormularioEstudiante />
      </Tarjeta>
    </div>
  );
}
