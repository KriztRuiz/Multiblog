import { test, expect } from "@playwright/test";

test("Home carga y muestra el título", async ({ page }) => {
  await page.goto("/"); // usa baseURL del config
  await expect(page).toHaveURL(/localhost:4321\/?$/);

  // Ajusta el texto a algo real de tu Home:
  const heading = page.getByRole("heading", { level: 1 });
  await expect(heading).toBeVisible();
  // Si tienes texto fijo:
  // await expect(heading).toHaveText(/Sabidatos|My Multiblog/i);
});

test("Navegación básica funciona", async ({ page }) => {
  await page.goto("/");
  // Ajusta estos selectores a tu menú real:
  // await page.getByRole("link", { name: /blog|posts/i }).click();
  // await expect(page).toHaveURL(/\/blog/);
});
