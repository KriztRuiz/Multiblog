import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../utils/db";

const signToken = (id: string, email: string) => {
  const secret = process.env.JWT_SECRET || "dev_secret";
  return jwt.sign({ id, email }, secret, { expiresIn: "2h" });
};

export const register = async (req: Request, res: Response) => {
  const { name, email, password } = req.body as {
    name: string;
    email: string;
    password: string;
  };

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return res.status(409).json({ message: "Email already registered" });

  const hash = await bcrypt.hash(password, 10);
  const u = await prisma.user.create({
    data: { name, email, password: hash },
    select: { id: true, name: true, email: true, createdAt: true },
  });

  const token = signToken(u.id, u.email);
  return res.status(201).json({ user: u, token });
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body as { email: string; password: string };

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ message: "Invalid credentials" });

  const token = signToken(user.id, user.email);
  const safe = { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt };
  return res.json({ user: safe, token });
};
