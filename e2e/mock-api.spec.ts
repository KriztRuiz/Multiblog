// e2e/mock-api.spec.ts
import { test, expect } from "@playwright/test";

test("La UI consume /api/posts mockeado (sin depender del DOM)", async ({ page }) => {
  // 1) Mock del endpoint
  await page.route("**/api/posts", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        meta: { page: 1, limit: 10, total: 2 },
        data: [
          { id: "m1", title: "Post mockeado 1" },
          { id: "m2", title: "Post mockeado 2" },
        ],
      }),
    });
  });

  // 2) Carga el Home (solo para tener el origen de la app)
  await page.goto("/");

  // 3) Desde el contexto de la página, hace fetch al endpoint y valida el JSON
  const json = await page.evaluate(async () => {
    const res = await fetch("/api/posts");
    return res.json();
  });

  expect(Array.isArray(json.data)).toBeTruthy();
  expect(json.data.length).toBe(2);
  expect(json.data.map((p: any) => p.title)).toContain("Post mockeado 1");
  expect(json.data.map((p: any) => p.title)).toContain("Post mockeado 2");
});
