import Link from "next/link";
import { AuthNav } from "@/components/layout/AuthNav";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Container } from "@/components/ui/Container";

export function AppShell({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]"><header className="border-b border-white/10"><Container className="flex h-16 items-center justify-between"><Link href="/" className="font-sans text-lg font-bold tracking-tight">SalvandoElSemestre</Link><nav className="flex items-center gap-4 text-sm text-slate-300"><AuthNav /><Link href="/status">Estado</Link><ThemeToggle /></nav></Container></header><div className="lg:grid lg:grid-cols-[220px_1fr]"><aside className="hidden border-r border-white/10 p-6 lg:block"><nav className="grid gap-3 text-sm text-slate-400"><Link href="/">Inicio</Link><Link href="/status">Estado del sistema</Link></nav></aside><main>{children}</main></div></div>;
}
