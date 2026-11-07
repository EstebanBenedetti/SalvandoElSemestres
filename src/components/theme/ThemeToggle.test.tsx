import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { ThemeProvider } from "./ThemeProvider";
import { ThemeToggle } from "./ThemeToggle";

describe("ThemeToggle", () => {
  const almacenamiento = new Map<string, string>();

  beforeEach(() => {
    almacenamiento.clear();
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      value: {
        getItem: (clave: string) => almacenamiento.get(clave) ?? null,
        setItem: (clave: string, valor: string) => almacenamiento.set(clave, String(valor)),
        removeItem: (clave: string) => almacenamiento.delete(clave),
        clear: () => almacenamiento.clear(),
        key: (indice: number) => [...almacenamiento.keys()][indice] ?? null,
        get length() {
          return almacenamiento.size;
        },
      } satisfies Storage,
    });
    delete document.documentElement.dataset.theme;
  });

  it("alterna entre claro y oscuro y persiste la selección", async () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>,
    );

    const boton = screen.getByRole("button", { name: "Cambiar a tema oscuro" });
    fireEvent.click(boton);

    await waitFor(() => {
      expect(document.documentElement).toHaveAttribute("data-theme", "dark");
      expect(window.localStorage.getItem("theme")).toBe("dark");
    });
    expect(screen.getByRole("button", { name: "Cambiar a tema claro" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("restaura el tema guardado al volver a cargar", async () => {
    window.localStorage.setItem("theme", "dark");
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>,
    );

    await waitFor(() => {
      expect(document.documentElement).toHaveAttribute("data-theme", "dark");
    });
    expect(screen.getByRole("button", { name: "Cambiar a tema claro" })).toBeInTheDocument();
  });
});