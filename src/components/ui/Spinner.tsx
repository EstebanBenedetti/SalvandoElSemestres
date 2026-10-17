interface SpinnerProps { size?: "sm" | "md" | "lg"; }

export function Spinner({ size = "md" }: SpinnerProps) {
  const sizes = { sm: "h-4 w-4", md: "h-6 w-6", lg: "h-10 w-10" };
  return <span aria-label="Cargando" className={`inline-block animate-spin rounded-full border-2 border-white/20 border-t-cyan-300 ${sizes[size]}`} />;
}
