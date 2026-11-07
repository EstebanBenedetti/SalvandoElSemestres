import { expect, test } from "@playwright/test";

test("cambia de claro a oscuro y conserva la selección al recargar", async ({ page }) => {
  await page.goto("/login");
  const botonTema = page.getByRole("button", { name: "Cambiar a tema oscuro" });
  await expect(botonTema).toBeVisible();

  const colorSuperficieClaro = await page.evaluate(() =>
    getComputedStyle(document.documentElement).getPropertyValue("--color-superficie").trim(),
  );
  await botonTema.click();

  const botonTemaClaro = page.getByRole("button", { name: "Cambiar a tema claro" });
  await expect(botonTemaClaro).toHaveAttribute("aria-pressed", "true");
  await expect.poll(() => page.locator("html").getAttribute("data-theme")).toBe("dark");
  const colorSuperficieOscuro = await page.evaluate(() =>
    getComputedStyle(document.documentElement).getPropertyValue("--color-superficie").trim(),
  );
  expect(colorSuperficieOscuro).not.toBe(colorSuperficieClaro);

  await page.reload();
  await expect(page.getByRole("button", { name: "Cambiar a tema claro" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
});