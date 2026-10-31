import type { HTMLAttributes } from "react";

export function Tarjeta({ className = "", ...props }: HTMLAttributes<HTMLElement>) {
  return (
    <section
      className={`rounded-lg border border-borde bg-superficie shadow-sm ${className}`}
      {...props}
    />
  );
}
