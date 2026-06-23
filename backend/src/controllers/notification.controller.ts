import type { Request, Response } from "express";
import { notificationService } from "../services/notification.service";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/response";
import { logger } from "../utils/logger";

export class NotificationController {
  list = asyncHandler(async (req: Request, res: Response) => {
    const result = await notificationService.list(req.user!, req.query);

    return sendSuccess(
      res,
      200,
      "Notifications loaded",
      result.notifications,
      result.meta
    );
  });

  handleDeliveryReport = asyncHandler(async (req: Request, res: Response) => {
    const { phoneNumber, status, requestId } = req.body;
    logger.info(`SMS Delivery Report: ${phoneNumber} - ${status} - ${requestId}`);
    
    // Here you could update your notifications table status if needed
    
    return res.status(200).send("OK");
  });
}

export const notificationController = new NotificationController();
