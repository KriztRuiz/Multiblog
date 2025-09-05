// backend/src/utils/prisma.ts
import { PrismaClient } from "@prisma/client";

/**
 * Evita múltiples instancias en desarrollo (nodemon/hot-reload).
 */
declare global {
  // eslint-disable-next-line no-var
  var __prisma__: PrismaClient | undefined;
}

const prisma =
  globalThis.__prisma__ ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "production"
        ? ["error"]
        : (["error", "warn"] as const),
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.__prisma__ = prisma;
}

export default prisma;
export { prisma };
