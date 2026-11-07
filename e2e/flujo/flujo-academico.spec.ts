import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { Pool } from "pg";
import { expect, test } from "@playwright/test";

test("inicia sesión, crea estudiante, registra corte y exporta el historial", async ({ page }) => {
  const databaseUrl = process.env.E2E_DATABASE_URL;
  if (!databaseUrl) throw new Error("E2E_DATABASE_URL es obligatorio para este flujo.");

  const pool = new Pool({ connectionString: databaseUrl });
  const nombre = `E2E NotaFlux ${randomUUID()}`;
  const emailDocente = "docente.e2e@notaflux.test";

  try {
    await page.goto("/login");
    await page.getByLabel("Correo o usuario").fill(emailDocente);
    await page.getByLabel("Contraseña").fill("e2e-local-password-123");
    await page.getByRole("button", { name: "Entrar" }).click();
    await expect(page).toHaveURL(/\/notas$/);

    await page.getByRole("link", { name: "Registrar estudiante" }).click();
    await page.getByLabel("Nombre del estudiante").fill(nombre);
    await page.getByRole("button", { name: "Guardar estudiante" }).click();
    await expect(page.getByRole("heading", { name: nombre })).toBeVisible();

    await page.getByRole("link", { name: "Registrar corte" }).click();
    await page.getByLabel("Parcial 1").fill("2.00");
    await page.getByLabel("Parcial 2").fill("2.00");
    await page.getByLabel("Examen final").fill("4.00");
    await expect(page.getByText("Promedio: 3,00")).toBeVisible();
    await expect(page.getByText("Aprobó")).toBeVisible();

    await page.getByRole("button", { name: "Guardar corte" }).click();
    await expect(page.getByText("Corte registrado con éxito")).toBeVisible();
    await expect(page.getByText("3,00")).toBeVisible();

    await page.getByRole("link", { name: "Ver historial" }).click();
    await expect(page.getByRole("heading", { name: "Historial de cortes" })).toBeVisible();
    await expect(page.getByText(emailDocente)).toBeVisible();
    await expect(page.getByText("Aprobó")).toBeVisible();

    await page.getByRole("link", { name: "Reportes" }).click();
    await expect(page.getByRole("heading", { name: "Reportes de notas" })).toBeVisible();
    await expect(page.getByText(nombre)).toBeVisible();

    const downloadReady = page.waitForEvent("download");
    await page.getByRole("link", { name: "Descargar CSV" }).click();
    const download = await downloadReady;
    expect(download.suggestedFilename()).toMatch(/^notaflux-notas-.*\.csv$/);
    const downloadPath = await download.path();
    if (!downloadPath) throw new Error("No se pudo acceder al CSV descargado.");
    const csv = await readFile(downloadPath, "utf8");
    expect(csv).toContain(nombre);
    expect(csv).toContain(emailDocente);
    expect(csv).toContain('"3.00"');
  } finally {
    await pool.query(
      "DELETE FROM cortes WHERE estudiante_id IN (SELECT id FROM estudiantes WHERE nombre = $1)",
      [nombre],
    );
    await pool.query("DELETE FROM estudiantes WHERE nombre = $1", [nombre]);
    await pool.end();
  }
});