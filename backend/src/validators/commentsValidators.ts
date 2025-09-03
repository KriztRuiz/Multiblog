import { body, param } from "express-validator";

export const createCommentValidator = [
  param("postId").isString().notEmpty(),
  body("userId").isString().notEmpty().withMessage("userId is required"),
  body("content").isString().trim().isLength({ min: 1, max: 1000 }).withMessage("content 1-1000 chars"),
];
