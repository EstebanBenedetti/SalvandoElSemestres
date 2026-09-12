import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

const variants = {
  primary: "bg-cyan-400 text-slate-950 hover:bg-cyan-300",
  secondary: "bg-white/10 text-white hover:bg-white/20",
  ghost: "text-slate-300 hover:bg-white/10",
  danger: "bg-rose-500 text-white hover:bg-rose-400",
};

export function Button({ variant = "primary", size = "md", loading, children, className = "", ...props }: ButtonProps) {
  const sizes = { sm: "px-3 py-2 text-sm", md: "px-4 py-2.5", lg: "px-5 py-3 text-lg" };
  return <button className={`rounded-xl font-semibold transition ${variants[variant]} ${sizes[size]} ${className}`} disabled={loading || props.disabled} {...props}>{loading ? "Cargando..." : children}</button>;
}
