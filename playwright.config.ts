import { defineConfig, devices } from "@playwright/test";

const BASE_URL = process.env.PW_BASE_URL ?? "http://localhost:4321";
const STORAGE   = "e2e/.auth/storageState.json";

export default defineConfig({
  testDir: "e2e",
  timeout: 90_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: [["html", { open: "never", outputFolder: "playwright-report" }]],
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },

  // Arrancamos backend y frontend. Para backend usamos --prefix y
  // esperamos a una URL conocida (Swagger JSON) para confirmar que ya sirve.
  webServer: [
    {
      command: "npm --prefix backend run dev",
      url: "http://127.0.0.1:5000/api/docs.json", // <- healthcheck backend
      reuseExistingServer: true,
      timeout: 180_000, // algunos TS+nodemon tardan en Windows
    },
    {
      command: process.env.PW_PREVIEW
        ? "astro preview --port 4321 --host"
        : "astro dev --port 4321 --host",
      url: BASE_URL, // <- healthcheck frontend
      reuseExistingServer: true,
      timeout: 120_000,
    },
  ],

  projects: [
    { name: "setup", testMatch: /auth\.setup\.ts$/ },
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], storageState: STORAGE },
      dependencies: ["setup"],
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"], storageState: STORAGE },
      dependencies: ["setup"],
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"], storageState: STORAGE },
      dependencies: ["setup"],
    },
  ],
});
