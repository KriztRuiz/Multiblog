import { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../utils/db";

// GET /api/posts?... (paginación/búsqueda/filtros/orden)
// Si viene token (authenticateOptional), añadimos likedByMe
export const getPosts = async (req: Request, res: Response) => {
  const page = Math.max(parseInt(String(req.query.page ?? "1"), 10) || 1, 1);
  const limitRaw = Math.max(parseInt(String(req.query.limit ?? "10"), 10) || 10, 1);
  const limit = Math.min(limitRaw, 50);
  const q = String(req.query.q ?? "").trim();
  const sort = String(req.query.sort ?? "new");

  const authorId = typeof req.query.authorId === "string" && req.query.authorId.trim()
    ? req.query.authorId.trim()
    : undefined;

  const minLikes = typeof req.query.minLikes !== "undefined"
    ? Math.max(parseInt(String(req.query.minLikes), 10) || 0, 0)
    : undefined;

  const dateFrom = (req.query.dateFrom as any) as Date | undefined;
  const dateTo   = (req.query.dateTo   as any) as Date | undefined;

  const textWhere: Prisma.PostWhereInput | undefined = q
    ? {
        OR: [
          { title:   { contains: q } },
          { content: { contains: q } },
          { author:  { is: { name:  { contains: q } } } },
          { author:  { is: { email: { contains: q } } } },
        ],
      }
    : undefined;

  const createdAtFilter =
    dateFrom || dateTo
      ? {
          createdAt: {
            ...(dateFrom ? { gte: dateFrom } : {}),
            ...(dateTo ? { lte: dateTo } : {}),
          },
        }
      : undefined;

  const likesFilter  = typeof minLikes === "number" ? { likes: { gte: minLikes } } : undefined;
  const authorFilter = authorId ? { authorId } : undefined;

  const where: Prisma.PostWhereInput = {
    ...(textWhere || {}),
    ...(createdAtFilter || {}),
    ...(likesFilter || {}),
    ...(authorFilter || {}),
  };

  let orderBy: Prisma.PostOrderByWithRelationInput;
  if (sort === "likes") orderBy = { likes: "desc" };
  else if (sort === "old") orderBy = { createdAt: "asc" };
  else orderBy = { createdAt: "desc" };

  const skip = (page - 1) * limit;

  const [total, raw] = await Promise.all([
    prisma.post.count({ where }),
    prisma.post.findMany({
      where,
      include: { author: { select: { id: true, name: true, email: true } } },
      orderBy,
      skip,
      take: limit,
    }),
  ]);

  const userId = req.auth?.id;
  let data: any[] = raw;

  // Si hay usuario, marcamos likedByMe para los posts de esta página
  if (userId && raw.length) {
    const ids = raw.map(p => p.id);
    const liked = await prisma.like.findMany({
      where: { userId, postId: { in: ids } },
      select: { postId: true },
    });
    const likedSet = new Set(liked.map(l => l.postId));
    data = raw.map(p => ({ ...p, likedByMe: likedSet.has(p.id) }));
  }

  const pages = Math.max(Math.ceil(total / limit), 1);
  return res.json({
    meta: { page, limit, total, pages, hasNext: page < pages, hasPrev: page > 1, sort, q: q || undefined, authorId, minLikes, dateFrom, dateTo },
    data,
  });
};

// GET /api/posts/:id  (si viene token, añade likedByMe)
export const getPost = async (req: Request, res: Response) => {
  const p = await prisma.post.findUnique({
    where: { id: req.params.id },
    include: { author: { select: { id: true, name: true } } },
  });
  if (!p) return res.status(404).json({ message: "Post not found" });

  const userId = req.auth?.id;
  if (!userId) return res.json(p);

  const exists = await prisma.like.findUnique({
    where: { userId_postId: { userId, postId: p.id } },
    select: { postId: true },
  });

  return res.json({ ...p, likedByMe: Boolean(exists) });
};

// POST /api/posts  (requiere auth)
export const createPost = async (req: Request, res: Response) => {
  const userId = req.auth?.id;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  const { title, content } = req.body as { title: string; content: string };
  const p = await prisma.post.create({ data: { title, content, authorId: userId } });
  return res.status(201).json(p);
};

// PUT /api/posts/:id  (autor solamente)
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

// DELETE /api/posts/:id  (autor solamente)
export const deletePost = async (req: Request, res: Response) => {
  const post = await prisma.post.findUnique({ where: { id: req.params.id } });
  if (!post) return res.status(404).json({ message: "Post not found" });
  if (post.authorId !== req.auth?.id) return res.status(403).json({ message: "Forbidden" });
  await prisma.post.delete({ where: { id: post.id } });
  return res.status(204).send();
};

// POST /api/posts/:id/like  (requiere auth; evita duplicados)
export const likePost = async (req: Request, res: Response) => {
  const userId = req.auth?.id;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  const postId = req.params.id;
  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) return res.status(404).json({ message: "Post not found" });

  try {
    const result = await prisma.$transaction(async (tx) => {
      const exists = await tx.like.findUnique({ where: { userId_postId: { userId, postId } } });
      if (exists) throw new Error("ALREADY_LIKED");

      await tx.like.create({ data: { userId, postId } });
      const count = await tx.like.count({ where: { postId } });
      return tx.post.update({ where: { id: postId }, data: { likes: count } });
    });
    return res.json(result);
  } catch (e: any) {
    if (e.message === "ALREADY_LIKED") return res.status(409).json({ message: "Already liked" });
    return res.status(500).json({ message: "Like failed" });
  }
};

// DELETE /api/posts/:id/like  (requiere auth; devuelve 409 si no estaba likeado)
export const unlikePost = async (req: Request, res: Response) => {
  const userId = req.auth?.id;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  const postId = req.params.id;
  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) return res.status(404).json({ message: "Post not found" });

  try {
    const result = await prisma.$transaction(async (tx) => {
      const exists = await tx.like.findUnique({ where: { userId_postId: { userId, postId } } });
      if (!exists) throw new Error("NOT_LIKED");

      await tx.like.delete({ where: { userId_postId: { userId, postId } } });
      const count = await tx.like.count({ where: { postId } });
      return tx.post.update({ where: { id: postId }, data: { likes: count } });
    });
    return res.json(result);
  } catch (e: any) {
    if (e.message === "NOT_LIKED") return res.status(409).json({ message: "Not liked" });
    return res.status(500).json({ message: "Unlike failed" });
  }
};
