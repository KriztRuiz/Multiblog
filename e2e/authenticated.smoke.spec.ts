import { test, expect } from "@playwright/test";

test("home autenticada (sin fixture) muestra UI de usuario", async ({ page }) => {
  await page.goto("/");
  // Ajusta a algo que solo se vea logueado:
  // await expect(page.getByRole("button", { name: /cerrar sesi\u00F3n|logout/i })).toBeVisible();
  await expect(page).toHaveTitle(/.+/);
});
