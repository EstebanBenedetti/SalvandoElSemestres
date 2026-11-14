import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/LoginForm";
import { getAuthenticatedUser } from "@/lib/auth/local-auth";

export default async function HomePage() {
  const token = (await cookies()).get("auth_token")?.value;
  const user = await getAuthenticatedUser(token);
  if (user) redirect("/notas");

  return <LoginForm />;
}
