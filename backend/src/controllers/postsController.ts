import { Request, Response } from "express";
import { prisma } from "../utils/db";

export const getPosts = async (req: Request, res: Response) => {
  const ps = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    include: { author: { select: { id: true, name: true, email: true } } },
  });
  return res.json(ps);
};

export const getPost = async (req: Request, res: Response) => {
  const p = await prisma.post.findUnique({
    where: { id: req.params.id },
    include: { author: { select: { id: true, name: true } } },
  });
  if (!p) return res.status(404).json({ message: "Post not found" });
  return res.json(p);
};

export const createPost = async (req: Request, res: Response) => {
  const userId = req.auth?.id;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  const { title, content } = req.body as { title: string; content: string };
  const p = await prisma.post.create({
    data: { title, content, authorId: userId },
  });
  return res.status(201).json(p);
};

export const updatePost = async (req: Request, res: Response) => {
  const post = await prisma.post.findUnique({ where: { id: req.params.id } });
  if (!post) return res.status(404).json({ message: "Post not found" });
  if (post.authorId !== req.auth?.id) return res.status(403).json({ message: "Forbidden" });

  const { title, content } = req.body as { title?: string; content?: string };
  const updated = await prisma.post.update({
    where: { id: post.id },
    data: { title, content, updatedAt: new Date() },
  });
  return res.json(updated);
};

export const deletePost = async (req: Request, res: Response) => {
  const post = await prisma.post.findUnique({ where: { id: req.params.id } });
  if (!post) return res.status(404).json({ message: "Post not found" });
  if (post.authorId !== req.auth?.id) return res.status(403).json({ message: "Forbidden" });

  await prisma.post.delete({ where: { id: post.id } });
  return res.status(204).send();
};

export const likePost = async (req: Request, res: Response) => {
  const userId = req.auth?.id;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  const postId = req.params.id;
  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) return res.status(404).json({ message: "Post not found" });

  try {
    const result = await prisma.$transaction(async (tx) => {
      const exists = await tx.like.findUnique({ where: { userId_postId: { userId, postId } } });
      if (exists) {
        throw new Error("ALREADY_LIKED");
      }
      await tx.like.create({ data: { userId, postId } });
      const count = await tx.like.count({ where: { postId } });
      const updated = await tx.post.update({
        where: { id: postId },
        data: { likes: count },
      });
      return updated;
    });
    return res.json(result);
  } catch (e: any) {
    if (e.message === "ALREADY_LIKED") {
      return res.status(409).json({ message: "Already liked" });
    }
    return res.status(500).json({ message: "Like failed" });
  }
};
