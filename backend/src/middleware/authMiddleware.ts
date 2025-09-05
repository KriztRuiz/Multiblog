import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthPayload } from "../types/express";

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");
  if (!/^bearer$/i.test(scheme || "") || !token) {
    return res.status(401).json({ message: "Missing or malformed Authorization header" });
  }
  try {
    const secret = process.env.JWT_SECRET || "dev_secret";
    const payload = jwt.verify(token, secret) as AuthPayload;
    req.auth = payload;
    return next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

// No falla si no hay token: solo lo decodifica si viene bien formado
export const authenticateOptional = (req: Request, _res: Response, next: NextFunction) => {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");
  if (!/^bearer$/i.test(scheme || "") || !token) return next();
  try {
    const secret = process.env.JWT_SECRET || "dev_secret";
    req.auth = jwt.verify(token, secret) as AuthPayload;
  } catch {
    // ignoramos tokens inválidos en modo opcional
  }
  return next();
};
