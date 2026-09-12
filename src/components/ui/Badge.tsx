interface BadgeProps {
  children: React.ReactNode;
  variant?: "info" | "success" | "warning" | "error";
}

const variants = {
  info: "bg-sky-400/15 text-sky-200",
  success: "bg-emerald-400/15 text-emerald-200",
  warning: "bg-amber-400/15 text-amber-200",
  error: "bg-rose-400/15 text-rose-200",
};

export function Badge({ children, variant = "info" }: BadgeProps) {
  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${variants[variant]}`}>{children}</span>;
}
