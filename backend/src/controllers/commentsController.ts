import { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../utils/db";

export const getComments = async (req: Request, res: Response) => {
  const postId = req.params.postId;
  const page = Math.max(parseInt(String(req.query.page ?? "1"), 10) || 1, 1);
  const limitRaw = Math.max(parseInt(String(req.query.limit ?? "10"), 10) || 10, 1);
  const limit = Math.min(limitRaw, 50);
  const sort = String(req.query.sort ?? "new");

  const orderBy: Prisma.CommentOrderByWithRelationInput =
    sort === "old" ? { createdAt: "asc" } : { createdAt: "desc" };

  const skip = (page - 1) * limit;

  const [total, data] = await Promise.all([
    prisma.comment.count({ where: { postId } }),
    prisma.comment.findMany({
      where: { postId },
      include: { author: { select: { id: true, name: true } } },
      orderBy,
      skip,
      take: limit,
    }),
  ]);

  const pages = Math.max(Math.ceil(total / limit), 1);

  return res.json({
    meta: {
      page,
      limit,
      total,
      pages,
      hasNext: page < pages,
      hasPrev: page > 1,
      sort,
    },
    data,
  });
};

export const getComment = async (req: Request, res: Response) => {
  const { postId, commentId } = req.params;
  const c = await prisma.comment.findFirst({
    where: { id: commentId, postId },
    include: { author: { select: { id: true, name: true } } },
  });
  if (!c) return res.status(404).json({ message: "Comment not found" });
  return res.json(c);
};

export const createComment = async (req: Request, res: Response) => {
  const userId = req.auth?.id;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  const postId = req.params.postId;
  const { content } = req.body as { content: string };

  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) return res.status(404).json({ message: "Post not found" });

  const c = await prisma.comment.create({
    data: { content, postId, authorId: userId },
  });
  return res.status(201).json(c);
};

export const deleteComment = async (req: Request, res: Response) => {
  const userId = req.auth?.id;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  const { postId, commentId } = req.params;
  const c = await prisma.comment.findFirst({ where: { id: commentId, postId } });
  if (!c) return res.status(404).json({ message: "Comment not found" });

  if (c.authorId !== userId) return res.status(403).json({ message: "Forbidden" });

  await prisma.comment.delete({ where: { id: c.id } });
  return res.status(204).send();
};
