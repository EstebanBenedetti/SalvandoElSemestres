import type { HTMLAttributes, ReactNode } from "react";

type TipoAviso = "info" | "exito" | "advertencia" | "error";

interface AvisoProps extends HTMLAttributes<HTMLDivElement> {
  tipo?: TipoAviso;
  titulo?: string;
  children: ReactNode;
}

const estilos: Record<TipoAviso, string> = {
  info: "border-primario bg-primario-suave text-texto",
  exito: "border-aprobo bg-aprobo-suave text-texto",
  advertencia: "border-amber-700 bg-amber-50 text-texto",
  error: "border-perdio bg-perdio-suave text-texto",
};

const prefijos: Record<TipoAviso, string> = {
  info: "●",
  exito: "✓",
  advertencia: "!",
  error: "×",
};

export function Aviso({ tipo = "info", titulo, children, className = "", ...props }: AvisoProps) {
  return (
    <div
      role={tipo === "error" ? "alert" : "status"}
      aria-live={tipo === "error" ? "assertive" : "polite"}
      className={`rounded-xl border-l-4 p-4 shadow-sm ${estilos[tipo]} ${className}`}
      {...props}
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/35 text-sm font-bold">
          {prefijos[tipo]}
        </span>
        <div className="min-w-0 flex-1">
          {titulo ? <p className="mb-1 font-semibold">{titulo}</p> : null}
          <div className="text-sm leading-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
