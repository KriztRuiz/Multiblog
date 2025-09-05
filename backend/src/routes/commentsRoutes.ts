import { Router } from "express";
import {
  getComments,
  getComment,
  createComment,
  deleteComment,
} from "../controllers/commentsController";
import { validateRequest } from "../middleware/validateRequest";
import {
  listCommentsValidator,
  createCommentValidator,
  deleteCommentValidator,
} from "../validators/commentsValidators";
import { authenticate } from "../middleware/authMiddleware";

const router = Router({ mergeParams: true });

// Listar (público)
router.get("/", listCommentsValidator, validateRequest, getComments);

// Detalle (público)
router.get("/:commentId", getComment);

// Crear (REQUERIDO: token)
router.post("/", authenticate, createCommentValidator, validateRequest, createComment);

// Borrar (REQUERIDO: token, y debe ser autor)
router.delete("/:commentId", authenticate, deleteCommentValidator, validateRequest, deleteComment);

export default router;
