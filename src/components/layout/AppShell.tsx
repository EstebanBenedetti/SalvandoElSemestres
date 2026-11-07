import Link from "next/link";
import { AuthNav } from "@/components/layout/AuthNav";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Container } from "@/components/ui/Container";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <header className="border-b border-borde bg-superficie">
        <Container className="flex h-16 items-center justify-between">
          <Link href="/" className="text-lg font-bold tracking-tight text-texto">
            SalvandoElSemestre
          </Link>
          <nav aria-label="Navegación de la aplicación" className="flex items-center gap-4 text-sm text-texto-suave">
            <AuthNav />
            <Link href="/status" className="hover:text-primario">Estado</Link>
            <ThemeToggle />
          </nav>
        </Container>
      </header>
      <div className="lg:grid lg:grid-cols-[220px_1fr]">
        <aside className="hidden border-r border-borde p-6 lg:block">
          <nav aria-label="Secciones" className="grid gap-3 text-sm text-texto-suave">
            <Link href="/dashboard" className="hover:text-primario">Inicio</Link>
            <Link href="/status" className="hover:text-primario">Estado del sistema</Link>
          </nav>
        </aside>
        <main>{children}</main>
      </div>
    </div>
  );
}
