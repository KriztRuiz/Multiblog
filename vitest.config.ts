// vitest.config.ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.{test,spec}.ts?(x)"],    // ✅ solo unit tests
    exclude: [
      "node_modules/**",
      "dist/**",
      "e2e/**",                // ✅ NO correr Playwright con Vitest
      "tests/**",
      "tests-examples/**",
      "playwright-report/**",
      "test-results/**",
      "backend/**"             // por si tienes tests de backend separados
    ],
  },
});
