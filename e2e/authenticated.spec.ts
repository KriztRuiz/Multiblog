import { test, expect } from "./fixtures/auth";

test("dashboard visible para usuario autenticado", async ({ authedPage }) => {
  await authedPage.goto("/dashboard"); // ajusta a tu ruta protegida real
  await expect(authedPage.getByRole("heading", { level: 1 })).toBeVisible();
});
