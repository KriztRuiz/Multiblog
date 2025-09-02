import { test, expect } from "@playwright/test";

test("La UI renderiza datos del feed mockeado", async ({ page }) => {
  await page.route("**/api/posts", async route => {
    // Respuesta simulada
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        items: [
          { id: "1", title: "Post mockeado 1" },
          { id: "2", title: "Post mockeado 2" }
        ]
      })
    });
  });

  await page.goto("/");

  // Verifica que la UI use el feed simulado
  await expect(page.getByText("Post mockeado 1")).toBeVisible();
  await expect(page.getByText("Post mockeado 2")).toBeVisible();
});
