import { Request, Response } from "express";
import { prisma } from "../utils/db";

export const getUsers = async (req: Request, res: Response) => {
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });
  return res.json(users);
};

export const getUser = async (req: Request, res: Response) => {
  const u = await prisma.user.findUnique({
    where: { id: req.params.id },
    select: { id: true, name: true, email: true, createdAt: true },
  });
  if (!u) return res.status(404).json({ message: "User not found" });
  return res.json(u);
};

export const updateUser = async (req: Request, res: Response) => {
  const u = await prisma.user.update({
    where: { id: req.params.id },
    data: { name: req.body.name },
    select: { id: true, name: true, email: true, createdAt: true },
  });
  return res.json(u);
};

export const deleteUser = async (req: Request, res: Response) => {
  await prisma.user.delete({ where: { id: req.params.id } });
  return res.status(204).send();
};
