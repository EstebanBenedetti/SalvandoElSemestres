import { redirect } from "next/navigation";
import { NavegacionNotas } from "@/components/notas/NavegacionNotas";
import { obtenerSesion } from "@/lib/dataService";

export default async function LayoutNotas({ children }: { children: React.ReactNode }) {
  const sesion = await obtenerSesion();
  if (!sesion) redirect("/login");

  return (
    <div className="min-h-screen bg-fondo text-texto">
      <NavegacionNotas email={sesion.email} />
      <main className="mx-auto w-full max-w-[1000px] px-4 py-8 sm:px-6 sm:py-10">
        {children}
      </main>
    </div>
  );
}
