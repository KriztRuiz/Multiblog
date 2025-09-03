import { Router } from 'express';
import {
  getComments,
  getComment,
  createComment,
  deleteComment
} from '../controllers/commentsController';

// mergeParams picks up postId from parent route (/posts/:postId/comments)
const router = Router({ mergeParams: true });

// Retrieve all comments (or comments for a specific post when nested)
router.get('/', getComments);
// Retrieve a single comment by id
router.get('/:id', getComment);
// Create a new comment under a post
router.post('/', createComment);
// Delete a comment
router.delete('/:id', deleteComment);

export default router;