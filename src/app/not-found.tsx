import Link from "next/link";
import { Container } from "@/components/ui/Container";

export default function NotFound() {
  return <Container className="grid min-h-screen place-items-center text-center"><div><p className="font-mono text-cyan-300">404</p><h1 className="mt-3 font-sans text-4xl font-bold">Página no encontrada</h1><Link className="mt-6 inline-block text-cyan-300 underline" href="/">Volver al inicio</Link></div></Container>;
}
