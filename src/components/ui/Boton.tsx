import type { ButtonHTMLAttributes } from "react";

type VarianteBoton = "primario" | "secundario" | "peligro" | "fantasma";

interface BotonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: VarianteBoton;
  cargando?: boolean;
  textoCargando?: string;
}

const variantes: Record<VarianteBoton, string> = {
  primario: "border-transparent bg-primario text-white shadow-sm shadow-blue-900/15 hover:bg-[#244b8c]",
  secundario: "border-borde bg-superficie text-texto shadow-sm hover:bg-fondo",
  peligro: "border-transparent bg-perdio text-white shadow-sm shadow-red-900/15 hover:bg-[#982828]",
  fantasma: "border-transparent bg-transparent text-primario hover:bg-primario-suave hover:text-primario",
};

export function Boton({
  variante = "primario",
  cargando = false,
  textoCargando = "Guardando...",
  disabled,
  className = "",
  children,
  type = "button",
  ...props
}: BotonProps) {
  return (
    <button
      type={type}
      disabled={disabled || cargando}
      aria-busy={cargando || undefined}
      className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primario disabled:cursor-not-allowed disabled:opacity-60 ${variantes[variante]} ${className}`}
      {...props}
    >
      {cargando ? textoCargando : children}
    </button>
  );
}
