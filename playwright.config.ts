import { defineConfig, devices } from "@playwright/test";

const AUTH_FILE = "storage/auth-user.json";

export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  // Subimos un poco los tiempos globales por si tu dev/preview tarda en levantar
  timeout: 90_000,
  expect: { timeout: 10_000 },
  retries: process.env.CI ? 2 : 0,
  reporter: [["html", { outputFolder: "playwright-report", open: "never" }]],
  use: {
    baseURL: "http://localhost:4321",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  webServer: {
    command: process.env.PW_PREVIEW ? "npm run preview" : "npm run dev",
    url: "http://localhost:4321",
    reuseExistingServer: true,
    timeout: 120_000,
  },
  projects: [
    { name: "setup", testMatch: "e2e/auth.setup.ts" },
    { name: "chromium", use: { ...devices["Desktop Chrome"], storageState: AUTH_FILE }, dependencies: ["setup"] },
    { name: "firefox",  use: { ...devices["Desktop Firefox"], storageState: AUTH_FILE }, dependencies: ["setup"] },
    { name: "webkit",   use: { ...devices["Desktop Safari"],  storageState: AUTH_FILE }, dependencies: ["setup"] },
  ],
});
