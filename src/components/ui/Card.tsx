import type { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}

export function Card({ hoverable, className = "", ...props }: CardProps) {
  return <div className={`border border-white/10 bg-white/[0.06] p-5 shadow-xl shadow-slate-950/20 ${hoverable ? "transition hover:-translate-y-1 hover:border-cyan-300/40" : ""} ${className}`} {...props} />;
}
