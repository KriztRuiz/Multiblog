import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthPayload } from "../types/express";

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) {
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
