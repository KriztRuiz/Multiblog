import { Request, Response } from 'express';
import { comments, posts, users } from '../models/data';
import { Comment } from '../models/Comment';

/**
 * Retrieve all comments or, if nested under a post, retrieve comments for that post.
 */
export const getComments = (req: Request, res: Response) => {
  const { postId } = req.params;
  // When mounted under /posts/:postId/comments, filter by postId
  if (postId) {
    const postComments = comments.filter((c) => c.postId === postId);
    return res.json(postComments);
  }
  return res.json(comments);
};

/**
 * Retrieve a single comment by id.
 */
export const getComment = (req: Request, res: Response) => {
  const comment = comments.find((c) => c.id === req.params.id);
  if (!comment) {
    return res.status(404).json({ message: 'Comment not found' });
  }
  return res.json(comment);
};

/**
 * Create a new comment for a post.
 */
export const createComment = (req: Request, res: Response) => {
  const { postId } = req.params;
  const { userId, content } = req.body;
  if (!postId || !userId || !content) {
    return res.status(400).json({ message: 'postId, userId and content are required' });
  }
  const post = posts.find((p) => p.id === postId);
  const user = users.find((u) => u.id === userId);
  if (!post || !user) {
    return res.status(400).json({ message: 'Invalid postId or userId' });
  }
  const newComment: Comment = {
    id: Date.now().toString(),
    postId,
    userId,
    content,
    createdAt: new Date()
  };
  comments.push(newComment);
  return res.status(201).json(newComment);
};

/**
 * Delete an existing comment.
 */
export const deleteComment = (req: Request, res: Response) => {
  const index = comments.findIndex((c) => c.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: 'Comment not found' });
  }
  comments.splice(index, 1);
  return res.status(204).send();
};