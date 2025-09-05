import { body, param, query } from "express-validator";

export const listPostsValidator = [
  query("page").optional().isInt({ min: 1 }).toInt(),
  query("limit").optional().isInt({ min: 1, max: 50 }).toInt(),
  query("q").optional().isString().trim().isLength({ max: 200 }),
  query("sort").optional().isIn(["new", "old", "likes"]),
  // Filtros avanzados
  query("authorId").optional().isString().trim().isLength({ min: 1 }),
  query("minLikes").optional().isInt({ min: 0 }).toInt(),
  query("dateFrom").optional().isISO8601().toDate(),
  query("dateTo").optional().isISO8601().toDate(),
  query("onlyMine").optional().isBoolean().toBoolean(),
];

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
