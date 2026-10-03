"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Container } from "@/components/ui/Container";

export function LoginForm() {
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
      router.replace(result.data.user.rol === "admin" ? "/usuarios" : "/dashboard");
      router.refresh();
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "No se pudo iniciar sesión.");
      setLoading(false);
    }
  }

  return (
    <Container className="py-12">
      <div className="mx-auto max-w-md border border-white/10 p-6 sm:p-8">
        <p className="font-mono text-sm text-cyan-300">CUENTA</p>
        <h1 className="mt-2 font-sans text-3xl font-bold">Iniciar sesión</h1>
        <form className="mt-7 grid gap-5" onSubmit={submit}>
          <label className="grid gap-1.5 text-sm text-slate-300">Correo o usuario<input required type="text" autoComplete="username" value={identifier} onChange={(event) => setIdentifier(event.target.value)} className="border border-white/15 bg-slate-950/60 px-3 py-2.5 text-white outline-none focus:border-cyan-300" /></label>
          <label className="grid gap-1.5 text-sm text-slate-300">Contraseña<input required type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} className="border border-white/15 bg-slate-950/60 px-3 py-2.5 text-white outline-none focus:border-cyan-300" /></label>
          {error ? <p role="alert" className="text-sm text-rose-300">{error}</p> : null}
          <button disabled={loading} className="bg-cyan-400 px-4 py-2.5 font-semibold text-slate-950 hover:bg-cyan-300 disabled:opacity-50">{loading ? "Ingresando..." : "Entrar"}</button>
        </form>
      </div>
    </Container>
  );
}