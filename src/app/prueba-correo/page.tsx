import { notFound } from "next/navigation";
import { connection } from "next/server";
import { CorreoPruebaForm } from "@/components/correo/CorreoPruebaForm";
import { Container } from "@/components/ui/Container";

export default async function PruebaCorreoPage() {
  await connection();
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <Container className="py-12">
      <div className="mx-auto max-w-md border border-white/10 p-6 sm:p-8">
        <p className="font-mono text-sm text-cyan-300">DESARROLLO</p>
        <h1 className="mt-2 font-sans text-3xl font-bold">Prueba de correo</h1>
        <p className="mt-3 text-sm text-slate-400">Envía un mensaje de prueba a tu dirección de correo.</p>
        <CorreoPruebaForm />
      </div>
    </Container>
  );
}
