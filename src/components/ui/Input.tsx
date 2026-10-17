import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function Input({ label, error, helperText, className = "", ...props }: InputProps) {
  return <label className="grid gap-2 text-sm text-slate-300"><span>{label}</span><input className={`rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2.5 text-white outline-none transition focus:border-cyan-300 ${className}`} {...props} />{error ? <span className="text-rose-300">{error}</span> : helperText ? <span className="text-slate-500">{helperText}</span> : null}</label>;
}
