import { expect, test } from "@playwright/test";

test("presenta acceso etiquetado y muestra errores del servidor", async ({ page }) => {
  await page.route("**/api/auth/login", async (route) => {
    await route.fulfill({
      status: 401,
      contentType: "application/json",
      body: JSON.stringify({ success: false, error: "Credenciales de prueba inválidas." }),
    });
  });

  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "Iniciar sesión" })).toBeVisible();
  await page.getByLabel("Correo o usuario").fill("prueba@example.com");
  await page.getByLabel("Contraseña").fill("clave-invalida");
  await page.getByRole("button", { name: "Entrar" }).click();

  await expect(page.getByText("Credenciales de prueba inválidas.")).toBeVisible();
  await expect(page).toHaveURL(/\/login$/);
});

test("protege el módulo de notas para usuarios sin sesión", async ({ page }) => {
  await page.goto("/notas");

  await expect(page).toHaveURL(/\/login\?returnTo=%2Fnotas/);
  await expect(page.getByRole("heading", { name: "Iniciar sesión" })).toBeVisible();
});

test("el acceso cabe en un viewport móvil sin desplazamiento horizontal", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/login");

  const anchos = await page.evaluate(() => ({
    documento: document.documentElement.scrollWidth,
    viewport: document.documentElement.clientWidth,
  }));

  expect(anchos.documento).toBeLessThanOrEqual(anchos.viewport);
  await expect(page.getByLabel("Correo o usuario")).toBeVisible();
  await expect(page.getByLabel("Contraseña")).toBeVisible();
});

test("permite recorrer los controles del acceso con el teclado", async ({ page }) => {
  await page.goto("/login");

  await expect(page.getByRole("link", { name: "Iniciar sesión" })).toBeVisible();
  const correo = page.getByLabel("Correo o usuario");
  let correoEnFoco = false;
  for (let indice = 0; indice < 20; indice += 1) {
    await page.keyboard.press("Tab");
    if (await correo.evaluate((elemento) => document.activeElement === elemento)) {
      correoEnFoco = true;
      break;
    }
  }
  expect(correoEnFoco).toBe(true);
  await expect(correo).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByLabel("Contraseña")).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "¿Olvidaste tu contraseña?" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Entrar" })).toBeFocused();
});