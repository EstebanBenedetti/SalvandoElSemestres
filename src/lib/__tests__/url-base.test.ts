import { afterEach, describe, expect, it, vi } from "vitest";
import { obtenerUrlBase } from "@/lib/urlBase";

describe("URL base de recuperación", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("prioriza APP_URL", () => {
    vi.stubEnv("APP_URL", "https://app.example.com/");
    vi.stubEnv("VERCEL_ENV", "production");
    vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "production.example.com");

    expect(obtenerUrlBase()).toBe("https://app.example.com");
  });

  it("usa el dominio de producción de Vercel en producción", () => {
    vi.stubEnv("APP_URL", "");
    vi.stubEnv("VERCEL_ENV", "production");
    vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "production.example.com");
    vi.stubEnv("VERCEL_URL", "deployment.example.com");

    expect(obtenerUrlBase()).toBe("https://production.example.com");
  });

  it("usa VERCEL_URL para otras implementaciones de Vercel", () => {
    vi.stubEnv("APP_URL", "");
    vi.stubEnv("VERCEL_ENV", "preview");
    vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "production.example.com");
    vi.stubEnv("VERCEL_URL", "preview.example.com");

    expect(obtenerUrlBase()).toBe("https://preview.example.com");
  });

  it("usa localhost como último recurso", () => {
    vi.stubEnv("APP_URL", "");
    vi.stubEnv("VERCEL_ENV", "");
    vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "");
    vi.stubEnv("VERCEL_URL", "");

    expect(obtenerUrlBase()).toBe("http://localhost:3000");
  });
});
