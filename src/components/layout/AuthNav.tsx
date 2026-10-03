"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type SessionUser = { rol: string };

export function AuthNav() {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/auth/me", { cache: "no-store" })
      .then((response) => response.ok ? response.json() : null)
      .then((result) => {
        if (active) {
          setUser(result?.data ?? null);
          setChecked(true);
        }
      })
      .catch(() => {
        if (active) setChecked(true);
      });
    return () => {
      active = false;
    };
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  }

  if (!checked) return <span className="inline-block h-5 w-16" aria-hidden="true" />;
  if (!user) return <Link href="/login">Iniciar sesión</Link>;

  return (
    <>
      {user.rol === "admin" ? <Link href="/usuarios">Usuarios</Link> : null}
      <button type="button" onClick={logout} className="hover:text-white">Cerrar sesión</button>
    </>
  );
}