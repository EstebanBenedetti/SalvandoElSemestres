import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createUser, findUserById, listUsers, updateUser, verifyToken } from "@/lib/auth/local-auth";

const createSchema = z.object({
  nombre: z.string().trim().min(1).max(120),
  email: z.email(),
  password: z.string().min(8),
  rol: z.enum(["admin", "usuario", "coordinador"]),
  activo: z.boolean(),
});

const updateSchema = z.object({
  id: z.uuid(),
  nombre: z.string().trim().min(1).max(120).optional(),
  email: z.email().optional(),
  password: z.union([z.string().min(8), z.literal("")]).optional(),
  rol: z.enum(["admin", "usuario", "coordinador"]).optional(),
  activo: z.boolean().optional(),
}).refine((data) => Object.entries(data).some(([key, value]) => key !== "id" && value !== undefined && value !== ""), {
  message: "Indica al menos un cambio.",
});

async function isAdmin(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get("auth_token")?.value;
  const payload = token ? verifyToken(token) : null;
  if (!payload) return false;
  const user = await findUserById(payload.sub);
  return Boolean(user?.activo && user.rol === "admin");
}

function denied() {
  return NextResponse.json({ success: false, error: "Se requiere una cuenta administradora." }, { status: 403 });
}

export async function GET(request: NextRequest) {
  try {
    if (!(await isAdmin(request))) return denied();
    return NextResponse.json({ success: true, data: await listUsers() });
  } catch {
    return NextResponse.json({ success: false, error: "No se pudieron cargar los usuarios." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!(await isAdmin(request))) return denied();
    const parsed = createSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ success: false, error: "Revisa los datos del usuario." }, { status: 400 });
    const user = await createUser(parsed.data);
    return NextResponse.json({ success: true, data: user }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo crear el usuario.";
    const status = message.includes("Ya existe") ? 409 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    if (!(await isAdmin(request))) return denied();
    const parsed = updateSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ success: false, error: "Revisa los datos del usuario." }, { status: 400 });
    const { id, ...changes } = parsed.data;
    const user = await updateUser(id, changes);
    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo actualizar el usuario.";
    const status = message.includes("No se encontró") ? 404 : message.includes("Ya existe") ? 409 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}