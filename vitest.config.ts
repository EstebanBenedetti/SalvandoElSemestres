import path from "node:path";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@data": path.resolve(__dirname, "./data"),
    },
  },
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: "reglas",
          environment: "node",
          include: ["tests/**/*.test.ts"],
        },
      },
      {
        extends: true,
        test: {
          name: "existentes",
          environment: "jsdom",
          globals: true,
          setupFiles: ["./src/test/setup.ts"],
          include: ["src/**/*.{test,spec}.{ts,tsx}"],
        },
      },
    ],
  },
});
