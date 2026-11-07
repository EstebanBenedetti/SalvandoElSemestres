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
        aria-current={pathname === "/notas" ? "page" : undefined}
        onClick={() => setMenuAbierto(false)}
        className="rounded px-3 py-2 text-sm font-semibold text-white hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-white"
      >
        Estudiantes
      </Link>
      <Link
        href="/notas/grupo"
        aria-current={pathname === "/notas/grupo" ? "page" : undefined}
        onClick={() => setMenuAbierto(false)}
        className="rounded px-3 py-2 text-sm font-semibold text-white hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-white"
      >
        Grupo
      </Link>
      <div className="flex items-center gap-3 border-t border-white/20 pt-3 sm:border-0 sm:pt-0">
        <span className="max-w-56 truncate text-sm text-white/85" title={email}>
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
    <header className="bg-primario text-white shadow-sm">
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
          className="inline-flex min-h-10 items-center rounded-lg border border-white/40 px-3 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-white sm:hidden"
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
