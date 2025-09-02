import { test, expect } from "@playwright/test";
import { AxeBuilder } from "@axe-core/playwright";

test("Home no tiene violaciones críticas de a11y", async ({ page }) => {
  await page.goto("/");
  const results = await new AxeBuilder({ page })
    // Puedes filtrar reglas o tags, p.ej. .withTags(["wcag2a","wcag2aa"])
    .analyze();

  // Falla si hay violaciones
  const violations = results.violations || [];
  // Opcional: filtra severidades si quieres
  const critical = violations.filter(v => ["serious", "critical"].includes(v.impact || ""));
  expect(critical, JSON.stringify(violations, null, 2)).toHaveLength(0);
});
