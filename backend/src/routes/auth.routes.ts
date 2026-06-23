import { Router } from "express";
import { PERMISSIONS } from "../constants/permissions";
import { authController } from "../controllers/auth.controller";
import { authenticate, requirePermission } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { signInSchema, signUpSchema } from "../validators/auth.validator";

export const authRoutes = Router();

authRoutes.post("/sign-in", validate({ body: signInSchema }), authController.signIn);
authRoutes.post("/sign-up", validate({ body: signUpSchema }), authController.signUp);
authRoutes.get(
  "/me",
  authenticate,
  requirePermission(PERMISSIONS.AUTH_ME),
  authController.me
);
