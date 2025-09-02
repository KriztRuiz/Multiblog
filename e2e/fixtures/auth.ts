import { test as base, expect, Page } from "@playwright/test";

type Fixtures = { authedPage: Page };

export const test = base.extend<Fixtures>({
  authedPage: async ({ browser }, use) => {
    const context = await browser.newContext({ storageState: "storage/auth-user.json" });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },
});

export { expect };
