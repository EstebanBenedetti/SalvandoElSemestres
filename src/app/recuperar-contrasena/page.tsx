import Link from "next/link";
import { RecuperarContrasenaForm } from "@/components/auth/RecuperarContrasenaForm";
import { Container } from "@/components/ui/Container";

export default function RecuperarContrasenaPage() {
  return (
    <Container className="py-12">
      <div className="mx-auto max-w-md border border-white/10 p-6 sm:p-8">
        <p className="font-mono text-sm text-cyan-300">RECUPERACIÓN DE CUENTA</p>
        <h1 className="mt-2 font-sans text-3xl font-bold">Recuperar contraseña</h1>
        <p className="mt-3 text-sm text-slate-400">
          Ingresa el correo asociado a tu cuenta y te enviaremos un enlace si está registrado.
        </p>
        <RecuperarContrasenaForm />
        <Link href="/login" className="mt-5 inline-block text-sm text-cyan-300 underline">
          Volver al inicio de sesión
        </Link>
      </div>
    </Container>
  );
}
