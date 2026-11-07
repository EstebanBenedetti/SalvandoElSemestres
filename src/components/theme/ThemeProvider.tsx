"use client";

import { createContext, useContext, useEffect, useSyncExternalStore } from "react";

type Theme = "light" | "dark";
interface ThemeContextValue { theme: Theme; toggleTheme: () => void; }
const ThemeContext = createContext<ThemeContextValue | null>(null);
const listeners = new Set<() => void>();
let fallbackTheme: Theme = "light";

function getThemeSnapshot(): Theme {
  if (typeof window === "undefined") return "light";

  try {
    const stored = window.localStorage.getItem("theme");
    return stored === "dark" || stored === "light" ? stored : "light";
  } catch {
    return fallbackTheme;
  }
}

function getServerThemeSnapshot(): Theme {
  return "light";
}

function subscribeToTheme(listener: () => void): () => void {
  listeners.add(listener);
  const onStorage = () => listener();
  window.addEventListener("storage", onStorage);

  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function saveTheme(theme: Theme): void {
  fallbackTheme = theme;
  document.documentElement.dataset.theme = theme;
  try {
    window.localStorage.setItem("theme", theme);
  } catch {
    // El tema visual sigue funcionando aunque el navegador bloquee el almacenamiento.
  }
  listeners.forEach((listener) => listener());
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSyncExternalStore(subscribeToTheme, getThemeSnapshot, getServerThemeSnapshot);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme: () => saveTheme(theme === "dark" ? "light" : "dark"),
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme debe usarse dentro de ThemeProvider");
  return context;
}
