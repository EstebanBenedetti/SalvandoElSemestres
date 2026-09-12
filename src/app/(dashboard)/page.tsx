import Link from "next/link";
import { getAll } from "@/lib/json-db";
import type { BaseRecord } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";

export default async function DashboardPage() {
  const notes = await getAll<BaseRecord>("note", { limit: 5, sortBy: "updatedAt", sortOrder: "desc" });
  return <Container className="py-12"><div className="mb-8"><p className="font-mono text-sm text-cyan-300">DASHBOARD</p><h1 className="mt-2 font-sans text-4xl font-bold">Tu semestre, en orden</h1><p className="mt-3 text-slate-400">Un espacio para capturar lo importante y seguir avanzando.</p></div><div className="grid gap-4 sm:grid-cols-2"><Card><p className="text-sm text-slate-400">Notas registradas</p><p className="mt-2 text-4xl font-bold">{notes.total}</p></Card><Card><p className="text-sm text-slate-400">Acción rápida</p><Link className="mt-4 inline-block text-cyan-300 underline" href="/status">Revisar estado del sistema</Link></Card></div><section className="mt-10"><h2 className="font-sans text-2xl font-bold">Notas recientes</h2><div className="mt-4 grid gap-3">{notes.data.length ? notes.data.map((note) => <Card key={note.id} className="flex items-center justify-between"><span>{note.id}</span><Badge variant="info">Actualizada</Badge></Card>) : <p className="text-slate-400">Todavía no hay notas.</p>}</div></section></Container>;
}
