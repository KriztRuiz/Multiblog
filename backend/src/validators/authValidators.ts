import { body } from "express-validator";

export const registerValidator = [
  body("name").trim().notEmpty().withMessage("name is required").isLength({ max: 80 }),
  body("email").trim().isEmail().withMessage("valid email required").normalizeEmail(),
  body("password")
    .isString()
    .isLength({ min: 6, max: 64 })
    .withMessage("password must be 6-64 chars"),
];

export const loginValidator = [
  body("email").trim().isEmail().withMessage("valid email required").normalizeEmail(),
  body("password").isString().notEmpty().withMessage("password is required"),
];
