import type { Request, Response } from "express";
import { chatService } from "../services/chat.service";
import { asyncHandler } from "../utils/asyncHandler";
import { logger } from "../utils/logger";

export class ChatController {
  handleChat = asyncHandler(async (req: Request, res: Response) => {
    const { message, session_id, company_id } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, message: "Message is required" });
    }

    // Set headers for streaming
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    try {
      await chatService.streamChatResponse(message, session_id, (token) => {
        res.write(`data: ${JSON.stringify({ token })}\n\n`);
      });
      
      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    } catch (error) {
      logger.error(`Chat error: ${error}`);
      res.write(`data: ${JSON.stringify({ error: "An error occurred while processing your request." })}\n\n`);
      res.end();
    }
  });
}

export const chatController = new ChatController();
