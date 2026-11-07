"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Boton } from "@/components/ui/Boton";
import { Aviso } from "@/components/ui/Aviso";

export function NavegacionNotas({ email }: { email: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [cerrandoSesion, setCerrandoSesion] = useState(false);
  const [error, setError] = useState("");
  const estudiantesActivo = pathname === "/notas" || pathname.startsWith("/notas/estudiantes");
  const grupoActivo = pathname === "/notas/grupo";

  async function cerrarSesion() {
    setMenuAbierto(false);
    setCerrandoSesion(true);
    setError("");
    try {
      const respuesta = await fetch("/api/auth/logout", { method: "POST" });
      if (!respuesta.ok) throw new Error("No se pudo cerrar sesión. Inténtalo de nuevo.");
      router.replace("/login");
      router.refresh();
    } catch (errorSesion) {
      setError(errorSesion instanceof Error ? errorSesion.message : "No se pudo cerrar sesión.");
      setCerrandoSesion(false);
    }
  }

  const enlaces = (
    <>
      <Link
        href="/notas"
        aria-current={estudiantesActivo ? "page" : undefined}
        onClick={() => setMenuAbierto(false)}
        className={`rounded-xl px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-white ${
          estudiantesActivo
            ? "bg-white/15 text-white ring-1 ring-inset ring-white/20"
            : "text-white/85 hover:bg-white/10 hover:text-white"
        }`}
      >
        Estudiantes
      </Link>
      <Link
        href="/notas/grupo"
        aria-current={grupoActivo ? "page" : undefined}
        onClick={() => setMenuAbierto(false)}
        className={`rounded-xl px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-white ${
          grupoActivo
            ? "bg-white/15 text-white ring-1 ring-inset ring-white/20"
            : "text-white/85 hover:bg-white/10 hover:text-white"
        }`}
      >
        Grupo
      </Link>
      <div className="flex items-center gap-3 border-t border-white/20 pt-3 sm:border-0 sm:pt-0">
        <span className="max-w-56 truncate rounded-full bg-white/10 px-2.5 py-1 text-xs font-medium text-white/90" title={email}>
          {email}
        </span>
        <Boton
          variante="fantasma"
          cargando={cerrandoSesion}
          textoCargando="Cerrando sesión..."
          onClick={cerrarSesion}
          className="text-white hover:bg-white/15 hover:text-white"
        >
          Cerrar sesión
        </Boton>
      </div>
    </>
  );

  return (
    <header className="border-b border-white/10 bg-[linear-gradient(135deg,#2d5ba8_0%,#1d3d70_100%)] text-white shadow-[0_10px_30px_rgba(29,61,112,0.2)]">
      <div className="mx-auto flex min-h-16 max-w-[1000px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link href="/notas" className="text-xl font-bold tracking-tight focus-visible:outline-2 focus-visible:outline-white">
          NotaFlux
        </Link>
        <nav aria-label="Navegación principal" className="hidden items-center gap-2 sm:flex">
          {enlaces}
        </nav>
        <button
          type="button"
          aria-expanded={menuAbierto}
          aria-controls="menu-notas-movil"
          onClick={() => setMenuAbierto((abierto) => !abierto)}
          className="inline-flex min-h-10 items-center rounded-lg border border-white/40 px-3 text-sm font-semibold text-white transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-white sm:hidden"
        >
          {menuAbierto ? "Cerrar menú" : "Menú"}
        </button>
        {menuAbierto ? (
          <nav
            id="menu-notas-movil"
            aria-label="Navegación móvil"
            className="order-3 flex w-full flex-col gap-2 border-t border-white/20 pt-3 sm:hidden"
          >
            {enlaces}
          </nav>
        ) : null}
      </div>
      {error ? (
        <div className="mx-auto max-w-[1000px] px-4 pb-3 sm:px-6">
          <Aviso tipo="error">{error}</Aviso>
        </div>
      ) : null}
    </header>
  );
}
