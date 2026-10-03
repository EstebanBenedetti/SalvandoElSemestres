import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/LoginForm";
import { findUserById, verifyToken } from "@/lib/auth/local-auth";

export default async function HomePage() {
  const token = (await cookies()).get("auth_token")?.value;
  const payload = token ? verifyToken(token) : null;

  if (payload) {
    const user = await findUserById(payload.sub);
    if (user?.activo) redirect(user.rol === "admin" ? "/usuarios" : "/dashboard");
  }

  return <LoginForm />;
}
