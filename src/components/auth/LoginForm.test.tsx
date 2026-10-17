import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LoginForm } from "./LoginForm";

const { push, refresh, replace } = vi.hoisted(() => ({
  push: vi.fn(),
  refresh: vi.fn(),
  replace: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, refresh, replace }),
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

describe("LoginForm", () => {
  beforeEach(() => {
    push.mockClear();
    refresh.mockClear();
    replace.mockClear();
    vi.stubGlobal("fetch", vi.fn());
  });

  it("inicia sesión y redirige al panel según el rol", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: { user: { rol: "alumno" } } }),
    } as Response);

    render(<LoginForm />);
    fireEvent.change(screen.getByLabelText("Correo o usuario"), {
      target: { value: "estudiante@correo.com" },
    });
    fireEvent.change(screen.getByLabelText("Contraseña"), {
      target: { value: "contrasena-segura" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Entrar" }));

    expect(await screen.findByRole("button", { name: "Ingresando..." })).toBeDisabled();
    expect(fetch).toHaveBeenCalledWith(
      "/api/auth/login",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          email: "estudiante@correo.com",
          password: "contrasena-segura",
        }),
      }),
    );
    expect(replace).toHaveBeenCalledWith("/dashboard");
    expect(refresh).toHaveBeenCalled();
  });

  it("muestra el error devuelto por la API", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      json: async () => ({
        success: false,
        error: "Correo o contraseña incorrectos",
      }),
    } as Response);

    render(<LoginForm />);
    fireEvent.change(screen.getByLabelText("Correo o usuario"), {
      target: { value: "alguien@correo.com" },
    });
    fireEvent.change(screen.getByLabelText("Contraseña"), {
      target: { value: "incorrecta" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Entrar" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Correo o contraseña incorrectos",
    );
  });

  it("muestra la confirmación cuando viene del restablecimiento", () => {
    render(<LoginForm contrasenaRestablecida />);

    expect(screen.getByRole("status")).toHaveTextContent(
      "Tu contraseña se restableció correctamente. Ya puedes iniciar sesión.",
    );
  });
});
