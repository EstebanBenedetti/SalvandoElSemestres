import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ChangePasswordForm } from "@/components/auth/ChangePasswordForm";
import { findUserById, verifyToken } from "@/lib/auth/local-auth";
import { Container } from "@/components/ui/Container";

export default async function ChangePasswordPage() {
  const token = (await cookies()).get("auth_token")?.value;
  const payload = token ? verifyToken(token) : null;
  const user = payload ? await findUserById(payload.sub) : null;
  if (!user?.activo) redirect("/login");

  return (
    <Container className="py-12">
      <div className="mx-auto max-w-md border border-white/10 p-6 sm:p-8">
        <p className="font-mono text-sm text-cyan-300">MI CUENTA</p>
        <h1 className="mt-2 font-sans text-3xl font-bold">Cambiar contraseña</h1>
        <p className="mt-3 text-sm text-slate-400">
          Confirma tu contraseña actual y elige una nueva de al menos 8 caracteres.
        </p>
        <ChangePasswordForm />
      </div>
    </Container>
  );
}
