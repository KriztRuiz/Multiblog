import { test, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const AUTH_DIR = "storage";
const AUTH_FILE = path.join(AUTH_DIR, "auth-user.json");

// Permite personalizar credenciales y ruta de login vía env
const EMAIL = process.env.TEST_USER_EMAIL ?? "admin@example.com";
const PASSWORD = process.env.TEST_USER_PASSWORD ?? "CambiaEsto123";
const LOGIN_URL_ENV = process.env.AUTH_LOGIN_URL ?? ""; // p.ej. "/login"
const SKIP_AUTH = process.env.SKIP_AUTH_SETUP === "1";  // para desactivar login si aún no existe

test.setTimeout(90_000);

test("authenticate and save storageState (resilient)", async ({ page, baseURL }) => {
  if (!fs.existsSync(AUTH_DIR)) fs.mkdirSync(AUTH_DIR, { recursive: true });

  // Si el usuario decide saltar login, guarda storage vacío y termina
  if (SKIP_AUTH) {
    await page.context().storageState({ path: AUTH_FILE });
    return;
  }

  // Candidatos de ruta de login; el ENV va primero si lo das
  const loginPaths = [
    LOGIN_URL_ENV,
    "/login",
    "/auth/login",
    "/ingresar",
    "/acceso",
    "/signin",
    "/admin/login",
    "/panel/login",
    "/"
  ].filter(Boolean);

  // Navega hasta encontrar un formulario plausible
  let foundForm = false;
  for (const p of loginPaths) {
    const resp = await page.goto(`${baseURL}${p}`);
    // Si la navegación no fue OK o la página no contiene inputs que parezcan login, seguimos probando
    try {
      // ¿Hay algún input de correo/usuario visible?
      const hasEmail = await tryFill(page, [
        () => page.getByLabel(/email|correo/i),
        () => page.getByPlaceholder(/email|correo/i),
        () => page.locator('input[type="email"]'),
        () => page.locator('input[name*="mail" i]'),
        () => page.locator('input[name*="user" i]'),
        () => page.locator('input[id*="mail" i]'),
      ], EMAIL, { dryRun: true });

      const hasPassword = await tryFill(page, [
        () => page.getByLabel(/password|contrase/i),
        () => page.getByPlaceholder(/password|contrase/i),
        () => page.locator('input[type="password"]'),
        () => page.locator('input[name*="pass" i]'),
        () => page.locator('input[id*="pass" i]'),
      ], PASSWORD, { dryRun: true });

      if (resp?.ok() && hasEmail && hasPassword) {
        foundForm = true;
        break;
      }
    } catch {
      // intenta siguiente ruta
    }
  }

  if (!foundForm) {
    console.warn("[auth.setup] No se encontró formulario de login; guardando storage vacío.");
    await page.context().storageState({ path: AUTH_FILE });
    return;
  }

  // Rellena email/usuario
  await tryFill(page, [
    () => page.getByLabel(/email|correo/i),
    () => page.getByPlaceholder(/email|correo/i),
    () => page.locator('input[type="email"]'),
    () => page.locator('input[name*="mail" i]'),
    () => page.locator('input[name*="user" i]'),
    () => page.locator('input[id*="mail" i]'),
  ], EMAIL);

  // Rellena contraseña
  await tryFill(page, [
    () => page.getByLabel(/password|contrase/i),
    () => page.getByPlaceholder(/password|contrase/i),
    () => page.locator('input[type="password"]'),
    () => page.locator('input[name*="pass" i]'),
    () => page.locator('input[id*="pass" i]'),
  ], PASSWORD);

  // Click en botón de enviar
  const submitters = [
    () => page.getByRole("button", { name: /iniciar sesi\u00F3n|login|entrar|acceder/i }),
    () => page.locator('button[type="submit"]'),
    () => page.locator('input[type="submit"]'),
    () => page.getByRole("button") // último recurso
  ];

  let clicked = false;
  for (const mk of submitters) {
    const btn = mk();
    try {
      await btn.first().waitFor({ state: "visible", timeout: 2000 });
      await btn.first().click({ timeout: 2000 });
      clicked = true;
      break;
    } catch { /* sigue probando */ }
  }

  // Espera una redirección o algo de UI típica post-login (ajusta a tu app)
  if (clicked) {
    // Ejemplos: /dashboard, /panel, home
    await page.waitForLoadState("networkidle", { timeout: 10_000 }).catch(() => {});
  }

  // Guarda el estado (cookies + localStorage)
  await page.context().storageState({ path: AUTH_FILE });
});

/**
 * Intenta llenar el primer locator visible de una lista.
 * Si dryRun=true, solo verifica disponibilidad sin llenar.
 */
async function tryFill(
  page: import("@playwright/test").Page,
  makers: Array<() => import("@playwright/test").Locator>,
  value: string,
  opts: { dryRun?: boolean } = {}
): Promise<boolean> {
  for (const mk of makers) {
    const loc = mk().first();
    try {
      await loc.waitFor({ state: "visible", timeout: 1500 });
      if (!opts.dryRun) await loc.fill(value, { timeout: 1500 });
      return true;
    } catch { /* intenta siguiente */ }
  }
  return false;
}
