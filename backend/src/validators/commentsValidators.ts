import { body, param, query } from "express-validator";

export const listCommentsValidator = [
  param("postId").isString().notEmpty(),
  query("page").optional().isInt({ min: 1 }).toInt(),
  query("limit").optional().isInt({ min: 1, max: 50 }).toInt(),
  query("sort").optional().isIn(["new", "old"]),
];

export const createCommentValidator = [
  param("postId").isString().notEmpty(),
  body("content")
    .isString()
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage("content 1-1000 chars"),
];

export const deleteCommentValidator = [
  param("postId").isString().notEmpty(),
  param("commentId").isString().notEmpty(),
];
