"use client";

import { FormEvent, useEffect, useState } from "react";
import { Container } from "@/components/ui/Container";

type UserRole = "admin" | "usuario" | "coordinador";
type ManagedUser = {
  id: string;
  nombre: string;
  email: string;
  rol: UserRole;
  activo: boolean;
  ultimoLogin: string | null;
  createdAt: string;
};

type UserForm = {
  nombre: string;
  email: string;
  password: string;
  rol: UserRole;
  activo: boolean;
};

const emptyForm: UserForm = { nombre: "", email: "", password: "", rol: "usuario", activo: true };
const roleLabels: Record<UserRole, string> = {
  admin: "Administrador",
  coordinador: "Coordinador",
  usuario: "Usuario",
};

export function UserManagement() {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [form, setForm] = useState<UserForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [denied, setDenied] = useState(false);

  async function loadUsers() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/users", { cache: "no-store" });
      const result = await response.json();
      if (response.status === 403) {
        setDenied(true);
        return;
      }
      if (!response.ok || !result.success) throw new Error(result.error ?? "No se pudieron cargar los usuarios.");
      setUsers(result.data);
      setDenied(false);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "No se pudieron cargar los usuarios.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;
    fetch("/api/admin/users", { cache: "no-store" })
      .then(async (response) => ({ response, result: await response.json() }))
      .then(({ response, result }) => {
        if (!active) return;
        if (response.status === 403) {
          setDenied(true);
          return;
        }
        if (!response.ok || !result.success) throw new Error(result.error ?? "No se pudieron cargar los usuarios.");
        setUsers(result.data);
      })
      .catch((loadError: unknown) => {
        if (active) setError(loadError instanceof Error ? loadError.message : "No se pudieron cargar los usuarios.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  function startEditing(user: ManagedUser) {
    setEditingId(user.id);
    setForm({ nombre: user.nombre, email: user.email, password: "", rol: user.rol, activo: user.activo });
    setError("");
    setNotice("");
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");
    const payload = editingId
      ? {
          id: editingId,
          nombre: form.nombre,
          email: form.email,
          rol: form.rol,
          activo: form.activo,
          ...(form.password ? { password: form.password } : {}),
        }
      : { ...form };

    try {
      const response = await fetch("/api/admin/users", {
        method: editingId ? "PATCH" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error ?? "No se pudo guardar el usuario.");
      setNotice(editingId ? "Usuario actualizado." : "Usuario creado.");
      resetForm();
      await loadUsers();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "No se pudo guardar el usuario.");
    } finally {
      setSaving(false);
    }
  }

  const filteredUsers = users.filter((user) => `${user.nombre} ${user.email}`.toLowerCase().includes(query.trim().toLowerCase()));

  if (denied) {
    return <Container className="py-12"><h1 className="font-sans text-3xl font-bold">Gestión de usuarios</h1><p className="mt-4 text-rose-300">Se requiere una cuenta administradora.</p></Container>;
  }

  return (
    <Container className="py-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <p className="font-mono text-sm text-cyan-300">ADMINISTRACIÓN</p>
          <h1 className="mt-2 font-sans text-3xl font-bold">Usuarios</h1>
        </div>
        <p className="text-sm text-slate-400">{users.length} cuentas</p>
      </div>

      <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <section>
          <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
            <h2 className="font-sans text-xl font-semibold">Directorio</h2>
            <label className="grid w-full max-w-sm gap-1.5 text-sm text-slate-300">
              <span>Buscar</span>
              <input value={query} onChange={(event) => setQuery(event.target.value)} className="border border-white/15 bg-slate-950/60 px-3 py-2 text-white outline-none focus:border-cyan-300" placeholder="Nombre o email" />
            </label>
          </div>

          {loading ? <p className="py-8 text-slate-400">Cargando usuarios...</p> : null}
          {!loading && !error && filteredUsers.length === 0 ? <p className="border-y border-white/10 py-8 text-slate-400">No hay usuarios para mostrar.</p> : null}

          {filteredUsers.length > 0 ? (
            <div className="overflow-x-auto border-y border-white/10">
              <table className="w-full min-w-[680px] text-left text-sm">
                <thead className="text-xs uppercase text-slate-500">
                  <tr className="border-b border-white/10">
                    <th className="px-3 py-3 font-medium">Usuario</th>
                    <th className="px-3 py-3 font-medium">Rol</th>
                    <th className="px-3 py-3 font-medium">Estado</th>
                    <th className="px-3 py-3 font-medium">Último acceso</th>
                    <th className="px-3 py-3 text-right font-medium">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b border-white/5 last:border-0">
                      <td className="px-3 py-4"><span className="block font-medium text-white">{user.nombre}</span><span className="mt-1 block text-slate-400">{user.email}</span></td>
                      <td className="px-3 py-4 text-slate-300">{roleLabels[user.rol]}</td>
                      <td className="px-3 py-4"><span className={user.activo ? "text-emerald-300" : "text-slate-500"}>{user.activo ? "Activo" : "Inactivo"}</span></td>
                      <td className="px-3 py-4 text-slate-400">{user.ultimoLogin ? new Date(user.ultimoLogin).toLocaleDateString() : "Nunca"}</td>
                      <td className="px-3 py-4 text-right"><button type="button" onClick={() => startEditing(user)} className="px-2 py-1 text-cyan-300 hover:bg-white/10">Editar</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </section>

        <section className="border-t border-white/10 pt-6 xl:border-l xl:border-t-0 xl:pl-8 xl:pt-0">
          <h2 className="font-sans text-xl font-semibold">{editingId ? "Editar usuario" : "Crear usuario"}</h2>
          <form className="mt-5 grid gap-4" onSubmit={submit}>
            <label className="grid gap-1.5 text-sm text-slate-300">Nombre<input required maxLength={120} value={form.nombre} onChange={(event) => setForm({ ...form, nombre: event.target.value })} className="border border-white/15 bg-slate-950/60 px-3 py-2.5 text-white outline-none focus:border-cyan-300" /></label>
            <label className="grid gap-1.5 text-sm text-slate-300">Email<input required type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="border border-white/15 bg-slate-950/60 px-3 py-2.5 text-white outline-none focus:border-cyan-300" /></label>
            <label className="grid gap-1.5 text-sm text-slate-300">{editingId ? "Nueva contraseña (opcional)" : "Contraseña"}<input required={!editingId} minLength={8} type="password" autoComplete="new-password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} className="border border-white/15 bg-slate-950/60 px-3 py-2.5 text-white outline-none focus:border-cyan-300" /></label>
            <label className="grid gap-1.5 text-sm text-slate-300">Rol<select value={form.rol} onChange={(event) => setForm({ ...form, rol: event.target.value as UserRole })} className="border border-white/15 bg-slate-950 px-3 py-2.5 text-white outline-none focus:border-cyan-300"><option value="usuario">Usuario</option><option value="coordinador">Coordinador</option><option value="admin">Administrador</option></select></label>
            <label className="flex items-center gap-2 text-sm text-slate-300"><input type="checkbox" checked={form.activo} onChange={(event) => setForm({ ...form, activo: event.target.checked })} className="size-4 accent-cyan-400" />Cuenta activa</label>
            {error ? <p role="alert" className="text-sm text-rose-300">{error}</p> : null}
            {notice ? <p role="status" className="text-sm text-emerald-300">{notice}</p> : null}
            <div className="flex flex-wrap gap-2 pt-1">
              <button disabled={saving} className="bg-cyan-400 px-4 py-2.5 font-semibold text-slate-950 hover:bg-cyan-300 disabled:opacity-50">{saving ? "Guardando..." : editingId ? "Guardar cambios" : "Crear usuario"}</button>
              {editingId ? <button type="button" onClick={resetForm} className="px-3 py-2.5 text-slate-300 hover:bg-white/10">Cancelar</button> : null}
            </div>
          </form>
        </section>
      </div>
    </Container>
  );
}