"use client";

import { FormEvent, useState } from "react";

export function RecuperarContrasenaForm() {
  const [email, setEmail] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  async function solicitarEnlace(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setMensaje("");
    setError("");
    setCargando(true);

    try {
      const respuesta = await fetch("/api/auth/recuperar", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
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
            : "No se pudo procesar la solicitud.";
        throw new Error(detalle);
      }

      setMensaje(
        "Si el correo está registrado, recibirás un enlace para restablecer la contraseña.",
      );
    } catch (errorSolicitud) {
      setError(errorSolicitud instanceof Error ? errorSolicitud.message : "No se pudo procesar la solicitud.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <form className="mt-7 grid gap-5" onSubmit={solicitarEnlace}>
      <label className="grid gap-1.5 text-sm text-slate-300">
        Correo electrónico
        <input
          required
          type="email"
          autoComplete="email"
          value={email}
          onChange={(evento) => setEmail(evento.target.value)}
          className="border border-white/15 bg-slate-950/60 px-3 py-2.5 text-white outline-none focus:border-cyan-300"
        />
      </label>
      {error ? <p role="alert" className="text-sm text-rose-300">{error}</p> : null}
      {mensaje ? <p role="status" className="text-sm text-emerald-300">{mensaje}</p> : null}
      <button
        disabled={cargando}
        className="bg-cyan-400 px-4 py-2.5 font-semibold text-slate-950 hover:bg-cyan-300 disabled:opacity-50"
      >
        {cargando ? "Enviando..." : "Enviar enlace"}
      </button>
    </form>
  );
}
