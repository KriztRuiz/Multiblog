import { Router } from "express";
import {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  likePost
} from "../controllers/postsController";
import { validateRequest } from "../middleware/validateRequest";
import {
  createPostValidator,
  updatePostValidator,
  likePostValidator,
} from "../validators/postsValidators";
import { authenticate } from "../middleware/authMiddleware";

const router = Router();

router.get("/", getPosts);
router.get("/:id", getPost);

router.post("/", authenticate, createPostValidator, validateRequest, createPost);
router.put("/:id", authenticate, updatePostValidator, validateRequest, updatePost);
router.delete("/:id", authenticate, deletePost);

router.post("/:id/like", authenticate, likePostValidator, validateRequest, likePost);

export default router;
