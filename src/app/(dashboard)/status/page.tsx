"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { Spinner } from "@/components/ui/Spinner";

interface Health { status: "ok" | "error"; timestamp: string; environment: string; version: string; uptime: number; }

export default function StatusPage() {
  const [health, setHealth] = useState<Health | null>(null);
  useEffect(() => { fetch("/api/health").then((response) => response.json() as Promise<Health>).then(setHealth); }, []);
  return <Container className="py-12"><div className="mb-8"><p className="font-mono text-sm text-cyan-300">MONITOR</p><h1 className="mt-2 font-sans text-4xl font-bold">Estado del sistema</h1></div>{health ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><Card><p className="text-sm text-slate-400">Estado</p><Badge variant={health.status === "ok" ? "success" : "error"}>{health.status}</Badge></Card><Card><p className="text-sm text-slate-400">Versión</p><p className="mt-2 text-2xl font-semibold">{health.version}</p></Card><Card><p className="text-sm text-slate-400">Entorno</p><p className="mt-2 text-2xl font-semibold">{health.environment}</p></Card><Card><p className="text-sm text-slate-400">Uptime</p><p className="mt-2 text-2xl font-semibold">{Math.floor(health.uptime)}s</p></Card></div> : <Spinner size="lg" />}</Container>;
}
