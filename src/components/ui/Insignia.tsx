import type { HTMLAttributes } from "react";

export type TonoInsignia = "neutro" | "aprobo" | "perdio" | "inactivo";

interface InsigniaProps extends HTMLAttributes<HTMLSpanElement> {
  tono?: TonoInsignia;
}

const tonos: Record<TonoInsignia, string> = {
  neutro: "bg-fondo text-texto",
  aprobo: "bg-aprobo-suave text-aprobo",
  perdio: "bg-perdio-suave text-perdio",
  inactivo: "bg-inactivo-suave text-inactivo",
};

export function Insignia({ tono = "neutro", className = "", ...props }: InsigniaProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${tonos[tono]} ${className}`}
      {...props}
    />
  );
}
