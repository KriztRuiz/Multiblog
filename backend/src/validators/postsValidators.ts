import { body, param } from "express-validator";

export const createPostValidator = [
  body("title").isString().trim().isLength({ min: 1, max: 120 }).withMessage("title 1-120 chars"),
  body("content").isString().trim().isLength({ min: 1, max: 5000 }).withMessage("content 1-5000 chars"),
];

export const updatePostValidator = [
  param("id").isString().notEmpty(),
  body("title").optional().isString().trim().isLength({ min: 1, max: 120 }),
  body("content").optional().isString().trim().isLength({ min: 1, max: 5000 }),
];

export const likePostValidator = [
  param("id").isString().notEmpty(),
];
