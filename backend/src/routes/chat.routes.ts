import { Router } from "express";
import { chatController } from "../controllers/chat.controller";

export const chatRoutes = Router();

chatRoutes.post("/", chatController.handleChat.bind(chatController));
