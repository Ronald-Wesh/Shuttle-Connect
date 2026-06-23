import { Router } from "express";
import { ussdController } from "../controllers/ussd.controller";
import { asyncHandler } from "../utils/asyncHandler";

export const ussdRoutes = Router();

ussdRoutes.post("/", asyncHandler(ussdController.handleRequest.bind(ussdController)));
