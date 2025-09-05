// backend/src/app.ts
import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import morgan from "morgan";

import apiRouter from "./routes";
import healthRoutes from "./routes/healthRoutes";
import { errorHandler } from "./middleware/errorHandler";

const app = express();

// Confianza en proxy si vas a estar detrás de Nginx/Heroku/etc.
app.set("trust proxy", 1);

// Seguridad y compresión
app.use(helmet());
app.use(compression());

// Logs legibles en dev
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// CORS configurable
app.use(
  cors({
    origin: (process.env.CORS_ORIGIN ?? "http://localhost:4321")
      .split(",")
      .map((s) => s.trim()),
    credentials: true,
  })
);

// Body parsers
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// Rate limits (global suave) + más estricto para /auth
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api", globalLimiter);

const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
});
app.use("/api/auth", authLimiter);

// Health & readiness
app.use("/api", healthRoutes);

// Resto del API
app.use("/api", apiRouter);

// Handler de errores al final
app.use(errorHandler);

export default app;
