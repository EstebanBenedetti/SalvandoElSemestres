import { LoginForm } from "@/components/auth/LoginForm";

type LoginPageProps = {
  searchParams: Promise<{ restablecida?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const parametros = await searchParams;
  return <LoginForm contrasenaRestablecida={parametros.restablecida === "1"} />;
}