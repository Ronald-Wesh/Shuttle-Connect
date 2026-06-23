import type { Request, Response } from "express";
import { authService } from "../services/auth.service";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/response";

export class AuthController {
  signIn = asyncHandler(async (req: Request, res: Response) => {
    const auth = await authService.signIn(req.body);

    return sendSuccess(res, 200, "Signed in successfully", auth);
  });

  signUp = asyncHandler(async (req: Request, res: Response) => {
    const auth = await authService.signUp(req.body);
    const message = auth.session
      ? "Account created and signed in"
      : "Account created. Check your email to confirm your account.";

    return sendSuccess(res, 201, message, auth);
  });

  me = asyncHandler(async (req: Request, res: Response) => {
    const user = await authService.getCurrentUser(req.user!);

    return sendSuccess(res, 200, "Current user loaded", user);
  });
}

export const authController = new AuthController();
