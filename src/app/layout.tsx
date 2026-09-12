import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/ThemeProvider";

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_APP_NAME ?? "SalvandoElSemestre",
  description: "Sistema fullstack TypeScript con JSON Database Layer",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body><ThemeProvider>{children}</ThemeProvider></body>
    </html>
  );
}
