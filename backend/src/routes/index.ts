import { Router } from 'express';
import authRoutes from './authRoutes';
import usersRoutes from './usersRoutes';
import postsRoutes from './postsRoutes';
import commentsRoutes from './commentsRoutes';

// Aggregate all sub-routes for the API
const router = Router();

// Authentication routes (login/register)
router.use('/auth', authRoutes);
// User management routes
router.use('/users', usersRoutes);
// Blog post routes
router.use('/posts', postsRoutes);
// Comments are nested under posts, mergeParams in commentsRoutes picks up :postId
router.use('/posts/:postId/comments', commentsRoutes);

export default router;