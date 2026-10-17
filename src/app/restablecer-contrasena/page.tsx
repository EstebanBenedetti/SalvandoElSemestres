import Link from "next/link";
import { RestablecerContrasenaForm } from "@/components/auth/RestablecerContrasenaForm";
import { Container } from "@/components/ui/Container";

type RestablecerContrasenaPageProps = {
  searchParams: Promise<{ token?: string | string[] }>;
};

export default async function RestablecerContrasenaPage({ searchParams }: RestablecerContrasenaPageProps) {
  const parametros = await searchParams;
  const token = typeof parametros.token === "string" ? parametros.token : null;

  return (
    <Container className="py-12">
      <div className="mx-auto max-w-md border border-white/10 p-6 sm:p-8">
        <p className="font-mono text-sm text-cyan-300">RECUPERACIÓN DE CUENTA</p>
        <h1 className="mt-2 font-sans text-3xl font-bold">Nueva contraseña</h1>
        {token ? (
          <>
            <p className="mt-3 text-sm text-slate-400">Elige una contraseña nueva de al menos 8 caracteres.</p>
            <RestablecerContrasenaForm token={token} />
          </>
        ) : (
          <div className="mt-5 grid gap-4">
            <p role="alert" className="text-sm text-rose-300">El enlace no es válido o ya venció.</p>
            <Link href="/recuperar-contrasena" className="text-sm text-cyan-300 underline">
              Solicitar un enlace nuevo
            </Link>
          </div>
        )}
      </div>
    </Container>
  );
}
