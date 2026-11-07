"use client";

import { useTheme } from "./ThemeProvider";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const siguienteTema = theme === "dark" ? "claro" : "oscuro";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Cambiar a tema ${siguienteTema}`}
      aria-pressed={theme === "dark"}
      className={`inline-flex min-h-10 items-center justify-center rounded-lg border border-borde bg-superficie px-3 text-sm font-semibold text-texto transition-colors hover:bg-fondo focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primario ${className}`}
    >
      {theme === "dark" ? "Claro" : "Oscuro"}
    </button>
  );
}
