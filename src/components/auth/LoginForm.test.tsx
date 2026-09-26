import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LoginForm } from "./LoginForm";

const { push } = vi.hoisted(() => ({
  push: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

describe("LoginForm", () => {
  beforeEach(() => {
    push.mockClear();
  });

  it("muestra errores debajo de los campos antes de enviar", () => {
    render(<LoginForm />);

    fireEvent.change(screen.getByLabelText("Correo electrónico"), {
      target: { value: "correo-invalido" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Entrar" }));

    expect(
      screen.getByText("Escribe un correo electrónico válido."),
    ).toBeInTheDocument();
    expect(screen.getByText("Escribe tu contraseña.")).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
  });

  it("muestra un error con credenciales incorrectas", async () => {
    render(<LoginForm />);

    fireEvent.change(screen.getByLabelText("Correo electrónico"), {
      target: { value: "alguien@correo.com" },
    });
    fireEvent.change(screen.getByLabelText("Contraseña"), {
      target: { value: "incorrecta" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Entrar" }));

    expect(
      screen.getByRole("button", { name: "Entrando..." }),
    ).toBeDisabled();
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Correo o contraseña incorrectos",
    );
    expect(push).not.toHaveBeenCalled();
  });

  it("redirige a Hola Mundo con las credenciales de demostración", async () => {
    render(<LoginForm />);

    fireEvent.change(screen.getByLabelText("Correo electrónico"), {
      target: { value: "demo@salvandoelsemestre.com" },
    });
    fireEvent.change(screen.getByLabelText("Contraseña"), {
      target: { value: "demo1234" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Entrar" }));

    await waitFor(() => {
      expect(push).toHaveBeenCalledWith("/inicio");
    });
  });
});
