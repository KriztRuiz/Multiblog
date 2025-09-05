// backend/src/routes/healthRoutes.ts
import { Router } from "express";
import prisma from "../utils/prisma";

const router = Router();

// Liveness
router.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", time: new Date().toISOString() });
});

// Readiness (DB)
router.get("/ready", async (_req, res) => {
  try {
    // SQLite: una consulta trivial
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ status: "ready" });
  } catch (err) {
    res.status(500).json({ status: "error", error: (err as Error).message });
  }
});

export default router;
