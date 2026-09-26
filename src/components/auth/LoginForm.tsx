"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

type FieldErrors = {
  email?: string;
  password?: string;
};

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [authError, setAuthError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors: FieldErrors = {};
    const normalizedEmail = email.trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      nextErrors.email = "Escribe un correo electrónico válido.";
    }

    if (!password.trim()) {
      nextErrors.password = "Escribe tu contraseña.";
    }

    setErrors(nextErrors);
    setAuthError("");

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      await new Promise((resolve) => window.setTimeout(resolve, 500));
      // TODO: conectar con la API real

      if (
        normalizedEmail.toLowerCase() === "demo@salvandoelsemestre.com" &&
        password === "demo1234"
      ) {
        router.push("/");
        return;
      }

      setAuthError("Correo o contraseña incorrectos");
    } finally {
      setIsSubmitting(false);
    }
  }

  function clearErrors(field: keyof FieldErrors) {
    setErrors((currentErrors) => {
      const nextErrors = { ...currentErrors };
      delete nextErrors[field];
      return nextErrors;
    });
    setAuthError("");
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#07111f] px-4 py-10 text-slate-100 sm:px-6">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_15%_15%,rgba(59,130,246,0.2),transparent_38%),radial-gradient(ellipse_at_85%_85%,rgba(6,182,212,0.16),transparent_38%)]"
      />

      <div className="relative z-10 w-full max-w-md">
        <header className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex size-14 items-center justify-center rounded-2xl border border-cyan-200/20 bg-cyan-100/10 text-cyan-200 shadow-lg shadow-cyan-950/30">
            <svg
              aria-hidden="true"
              className="size-7"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                d="m3 9 9-5 9 5-9 5-9-5Z"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.7"
              />
              <path
                d="M7 11.2v4.1c2.8 2.2 7.2 2.2 10 0v-4.1M21 9v6"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.7"
              />
            </svg>
          </div>
          <p className="font-sans text-sm font-semibold tracking-[0.18em] text-cyan-200 uppercase">
            Salvando el semestre
          </p>
          <h1 className="mt-3 font-sans text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Qué bueno verte
          </h1>
          <p className="mt-3 max-w-xs font-sans text-sm leading-6 text-slate-400 sm:text-base">
            Inicia sesión y sigue llevando tus notas bajo control.
          </p>
        </header>

        <section className="rounded-3xl border border-white/10 bg-slate-900/75 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-8">
          <form className="space-y-5" noValidate onSubmit={handleSubmit}>
            <div>
              <label
                className="mb-2 block font-sans text-sm font-medium text-slate-200"
                htmlFor="email"
              >
                Correo electrónico
              </label>
              <input
                autoComplete="email"
                className="w-full min-w-0 rounded-xl border border-slate-700 bg-[#0b1728] px-4 py-3 font-sans text-base text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/10"
                id="email"
                name="email"
                onChange={(event) => {
                  setEmail(event.target.value);
                  clearErrors("email");
                }}
                aria-describedby={errors.email ? "email-error" : undefined}
                aria-invalid={Boolean(errors.email)}
                placeholder="tu@correo.com"
                type="email"
                value={email}
              />
              {errors.email && (
                <p className="mt-2 font-sans text-sm text-rose-300" id="email-error">
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <label
                  className="font-sans text-sm font-medium text-slate-200"
                  htmlFor="password"
                >
                  Contraseña
                </label>
                <a
                  className="font-sans text-xs font-medium text-cyan-300 transition hover:text-cyan-200 sm:text-sm"
                  href="#"
                  onClick={(event) => event.preventDefault()}
                >
                  Olvidé mi contraseña
                </a>
              </div>
              <input
                autoComplete="current-password"
                className="w-full min-w-0 rounded-xl border border-slate-700 bg-[#0b1728] px-4 py-3 font-sans text-base text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/10"
                id="password"
                name="password"
                onChange={(event) => {
                  setPassword(event.target.value);
                  clearErrors("password");
                }}
                aria-describedby={errors.password ? "password-error" : undefined}
                aria-invalid={Boolean(errors.password)}
                placeholder="Tu contraseña"
                type="password"
                value={password}
              />
              {errors.password && (
                <p
                  className="mt-2 font-sans text-sm text-rose-300"
                  id="password-error"
                >
                  {errors.password}
                </p>
              )}
            </div>

            {authError && (
              <p
                className="rounded-xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 font-sans text-sm text-rose-200"
                role="alert"
              >
                {authError}
              </p>
            )}

            <button
              className="w-full rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 px-4 py-3.5 font-sans text-sm font-bold text-slate-950 shadow-lg shadow-cyan-950/30 transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 disabled:cursor-wait disabled:opacity-70"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <p className="mt-6 text-center font-sans text-xs leading-5 text-slate-500">
            Un paso más cerca de salvar el semestre.
          </p>
        </section>
      </div>
    </main>
  );
}
