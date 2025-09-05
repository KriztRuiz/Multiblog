import { Router } from "express";
import {
  getPosts, getPost, createPost, updatePost, deletePost, likePost, unlikePost
} from "../controllers/postsController";
import { validateRequest } from "../middleware/validateRequest";
import { authenticate, authenticateOptional } from "../middleware/authMiddleware";
import {
  createPostValidator, updatePostValidator, likePostValidator, listPostsValidator,
} from "../validators/postsValidators";
import commentsRouter from "./commentsRoutes";

const router = Router();

router.get("/", authenticateOptional, listPostsValidator, validateRequest, getPosts);
router.get("/:id", authenticateOptional, getPost);

router.post("/", authenticate, createPostValidator, validateRequest, createPost);
router.put("/:id", authenticate, updatePostValidator, validateRequest, updatePost);
router.delete("/:id", authenticate, deletePost);

router.post("/:id/like", authenticate, likePostValidator, validateRequest, likePost);
router.delete("/:id/like", authenticate, likePostValidator, validateRequest, unlikePost);

// Subrutas de comentarios
router.use("/:postId/comments", commentsRouter);

export default router;
