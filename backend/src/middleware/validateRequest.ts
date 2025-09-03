import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";

export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  const result = validationResult(req);

  if (!result.isEmpty()) {
    const errors = result.array({ onlyFirstError: true }).map((e) => {
      // e puede ser FieldValidationError (tiene 'path') o AlternativeValidationError (no)
      const field =
        ("path" in e && typeof (e as any).path === "string")
          ? (e as any).path
          : ("param" in e && typeof (e as any).param === "string")
          ? (e as any).param
          : "non_field_error";

      return { field, msg: e.msg };
    });

    return res.status(400).json({ errors });
  }

  return next();
};
