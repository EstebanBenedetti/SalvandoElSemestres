import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { NavegacionNotas } from "./NavegacionNotas";

vi.mock("next/navigation", () => ({
  usePathname: () => "/notas/estudiantes/estudiante-123",
  useRouter: () => ({ replace: vi.fn(), refresh: vi.fn() }),
}));

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe("NavegacionNotas", () => {
  it("mantiene activa la sección de estudiantes en páginas de detalle", () => {
    render(
      <ThemeProvider>
        <NavegacionNotas email="docente@correo.com" />
      </ThemeProvider>,
    );

    expect(screen.getByRole("link", { name: "Estudiantes" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "Grupo" })).not.toHaveAttribute(
      "aria-current",
    );
  });
});