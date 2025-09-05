// e2e/auth.setup.ts
import { test, expect } from "@playwright/test";
import { mkdir, writeFile } from "fs/promises";

/**
 * Env opcionales:
 *  - API_URL            (default: http://127.0.0.1:5000)
 *  - TEST_USER_EMAIL    (default: maestro@example.com)
 *  - TEST_USER_PASSWORD (default: maestro123)
 *  - AUTH_LS_KEY        (default: "token")
 *  - PW_BASE_URL        (fallback si no viene de la config)
 */
const API_URL = process.env.API_URL ?? "http://127.0.0.1:5000"; // 👈 evita ::1 en Windows
const EMAIL = process.env.TEST_USER_EMAIL ?? "maestro@example.com";
const PASSWORD = process.env.TEST_USER_PASSWORD ?? "maestro123";
const AUTH_LS_KEY = process.env.AUTH_LS_KEY ?? "token";

const STORAGE_DIR = "e2e/.auth";
const STORAGE_PATH = `${STORAGE_DIR}/storageState.json`;

test("authenticate and save storageState (API)", async ({ request }, testInfo) => {
  // 1) Login contra el backend
  const resp = await request.post(`${API_URL}/api/auth/login`, {
    data: { email: EMAIL, password: PASSWORD },
    headers: { "content-type": "application/json" },
  });
  expect(resp.ok(), `Login failed: ${resp.status()} ${resp.statusText()}`).toBeTruthy();

  const data = await resp.json();
  const token = data?.token as string | undefined;
  expect(token, "Login response missing 'token'").toBeTruthy();

  // 2) Tomar baseURL del proyecto
  const configBaseURL = testInfo.project?.use?.baseURL as string | undefined;
  const base = configBaseURL ?? process.env.PW_BASE_URL ?? "http://localhost:4321";
  const origin = new URL(base).origin;

  // 3) Guardar storageState.json con el token en localStorage
  const storageState = {
    cookies: [] as any[],
    origins: [{ origin, localStorage: [{ name: AUTH_LS_KEY, value: token! }] }],
  };

  await mkdir(STORAGE_DIR, { recursive: true });
  await writeFile(STORAGE_PATH, JSON.stringify(storageState, null, 2), "utf-8");
});
