import type { HTMLAttributes } from "react";

export function Tarjeta({ className = "", ...props }: HTMLAttributes<HTMLElement>) {
  return (
    <section
      className={`rounded-2xl border border-borde bg-superficie shadow-[0_12px_30px_rgba(15,23,42,0.06)] ${className}`}
      {...props}
    />
  );
}
