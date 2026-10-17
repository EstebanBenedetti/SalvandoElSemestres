"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function RestablecerContrasenaForm({ token }: { token: string }) {
  const router = useRouter();
  const [contrasena, setContrasena] = useState("");
  const [confirmacion, setConfirmacion] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  async function restablecer(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setError("");
    if (contrasena !== confirmacion) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setCargando(true);
    try {
      const respuesta = await fetch("/api/auth/restablecer", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token, contrasena, confirmacion }),
      });
      const resultado: unknown = await respuesta.json();
      if (
        typeof resultado !== "object" ||
        resultado === null ||
        !("success" in resultado) ||
        resultado.success !== true
      ) {
        const detalle =
          typeof resultado === "object" &&
          resultado !== null &&
          "error" in resultado &&
          typeof resultado.error === "string"
            ? resultado.error
            : "No se pudo restablecer la contraseña.";
        throw new Error(detalle);
      }

      router.replace("/login?restablecida=1");
      router.refresh();
    } catch (errorRestablecer) {
      setError(errorRestablecer instanceof Error ? errorRestablecer.message : "No se pudo restablecer la contraseña.");
      setCargando(false);
    }
  }

  return (
    <form className="mt-7 grid gap-5" onSubmit={restablecer}>
      <label className="grid gap-1.5 text-sm text-slate-300">
        Nueva contraseña
        <input
          required
          minLength={8}
          type="password"
          autoComplete="new-password"
          value={contrasena}
          onChange={(evento) => setContrasena(evento.target.value)}
          className="border border-white/15 bg-slate-950/60 px-3 py-2.5 text-white outline-none focus:border-cyan-300"
        />
      </label>
      <label className="grid gap-1.5 text-sm text-slate-300">
        Confirmar nueva contraseña
        <input
          required
          minLength={8}
          type="password"
          autoComplete="new-password"
          value={confirmacion}
          onChange={(evento) => setConfirmacion(evento.target.value)}
          className="border border-white/15 bg-slate-950/60 px-3 py-2.5 text-white outline-none focus:border-cyan-300"
        />
      </label>
      {error ? <p role="alert" className="text-sm text-rose-300">{error}</p> : null}
      <button
        disabled={cargando}
        className="bg-cyan-400 px-4 py-2.5 font-semibold text-slate-950 hover:bg-cyan-300 disabled:opacity-50"
      >
        {cargando ? "Guardando..." : "Guardar contraseña"}
      </button>
      <Link href="/recuperar-contrasena" className="text-center text-sm text-cyan-300 underline">
        Solicitar otro enlace
      </Link>
    </form>
  );
}
