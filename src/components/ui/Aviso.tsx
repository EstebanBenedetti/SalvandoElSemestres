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

export function Aviso({ tipo = "info", titulo, children, className = "", ...props }: AvisoProps) {
  return (
    <div
      role={tipo === "error" ? "alert" : "status"}
      className={`rounded-lg border-l-4 p-4 ${estilos[tipo]} ${className}`}
      {...props}
    >
      {titulo ? <p className="mb-1 font-semibold">{titulo}</p> : null}
      <div className="text-sm">{children}</div>
    </div>
  );
}
