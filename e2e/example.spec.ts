import { test, expect } from "@playwright/test";

test("home loads", async ({ page }) => {
  await page.goto("/"); // usa baseURL del config
  await expect(page).toHaveURL(/localhost:4321\/?$/);
  await expect(page).toHaveTitle(/.+/); // cualquier título no vacío
});

// Ejemplo de interacción mínima (ajústalo a tu UI real)
test("navigation works", async ({ page }) => {
  await page.goto("/");
  // Si tienes un enlace al blog, por ejemplo:
  // await page.getByRole("link", { name: /blog/i }).click();
  // await expect(page).toHaveURL(/\/blog/);
});
