import { defineConfig, devices } from "@playwright/test";

const baseURL = "http://127.0.0.1:3101";
const databaseUrl = process.env.E2E_DATABASE_URL;

if (!databaseUrl) {
  throw new Error("Define E2E_DATABASE_URL para ejecutar el flujo con una base aislada.");
}

if (!/(e2e|test)/i.test(new URL(databaseUrl).pathname)) {
  throw new Error("E2E_DATABASE_URL debe apuntar a una base cuyo nombre incluya e2e o test.");
}

export default defineConfig({
  testDir: "./e2e/flujo",
  fullyParallel: false,
  workers: 1,
  reporter: process.env.CI ? "github" : "list",
  use: {
    ...devices["Desktop Chrome"],
    baseURL,
    trace: "retain-on-failure",
  },
  webServer: {
    command: "node scripts/e2e-server.mjs",
    url: `${baseURL}/login`,
    reuseExistingServer: false,
    timeout: 120_000,
    env: {
      E2E_DATABASE_URL: databaseUrl,
      POSTGRES_URL_NON_POOLING: databaseUrl,
      SUPABASE_URL: "http://127.0.0.1:54321",
      SUPABASE_SERVICE_ROLE_KEY: "e2e-only-service-role-key",
      SUPABASE_JWT_SECRET: "e2e-only-jwt-secret-not-for-production",
    },
  },
});