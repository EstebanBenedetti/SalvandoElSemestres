"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Container } from "@/components/ui/Container";

export function LoginForm({ contrasenaRestablecida = false }: { contrasenaRestablecida?: boolean }) {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: identifier, password }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error ?? "No se pudo iniciar sesión.");
      router.replace("/notas");
      router.refresh();
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "No se pudo iniciar sesión.");
      setLoading(false);
    }
  }

  return (
    <Container className="py-12">
      <div className="mx-auto max-w-md rounded-xl border border-borde bg-superficie p-6 shadow-[0_12px_30px_rgba(15,23,42,0.06)] sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primario">Cuenta</p>
        <h1 className="mt-2 text-3xl font-bold text-texto">Iniciar sesión</h1>
        {contrasenaRestablecida ? (
          <p role="status" className="mt-4 text-sm font-medium text-aprobo">
            Tu contraseña se restableció correctamente. Ya puedes iniciar sesión.
          </p>
        ) : null}
        <form className="mt-7 grid gap-5" onSubmit={submit}>
          <label className="grid gap-1.5 text-sm font-medium text-texto">
            Correo o usuario
            <input
              required
              type="text"
              autoComplete="username"
              value={identifier}
              onChange={(event) => setIdentifier(event.target.value)}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? "error-login" : undefined}
              className="min-h-11 w-full rounded-lg border border-borde bg-superficie px-3 py-2 text-texto outline-none placeholder:text-texto-suave focus-visible:border-primario focus-visible:ring-2 focus-visible:ring-primario/30"
            />
          </label>
          <label className="grid gap-1.5 text-sm font-medium text-texto">
            Contraseña
            <input
              required
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? "error-login" : undefined}
              className="min-h-11 w-full rounded-lg border border-borde bg-superficie px-3 py-2 text-texto outline-none placeholder:text-texto-suave focus-visible:border-primario focus-visible:ring-2 focus-visible:ring-primario/30"
            />
          </label>
          <Link
            href="/recuperar-contrasena"
            className="min-h-11 inline-flex items-center text-sm font-medium text-primario underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primario"
          >
            ¿Olvidaste tu contraseña?
          </Link>
          {error ? <p id="error-login" role="alert" className="text-sm font-medium text-perdio">{error}</p> : null}
          <button
            disabled={loading}
            className="min-h-11 rounded-xl bg-primario px-4 py-2.5 font-semibold text-white shadow-sm transition-colors hover:bg-[#244b8c] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primario disabled:opacity-50"
          >
            {loading ? "Ingresando..." : "Entrar"}
          </button>
        </form>
      </div>
    </Container>
  );
}