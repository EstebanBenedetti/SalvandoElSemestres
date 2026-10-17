"use client";

import { useTheme } from "./ThemeProvider";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return <button type="button" onClick={toggleTheme} aria-label="Cambiar tema" className="rounded-full border border-white/15 px-3 py-2 text-sm text-slate-200 transition hover:border-cyan-300">{theme === "dark" ? "Claro" : "Oscuro"}</button>;
}
