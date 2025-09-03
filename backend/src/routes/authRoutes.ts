import { Router } from "express";
import { login, register } from "../controllers/authController";
import { validateRequest } from "../middleware/validateRequest";
import { registerValidator, loginValidator } from "../validators/authValidators";

const router = Router();

router.post("/register", registerValidator, validateRequest, register);
router.post("/login", loginValidator, validateRequest, login);

export default router;
