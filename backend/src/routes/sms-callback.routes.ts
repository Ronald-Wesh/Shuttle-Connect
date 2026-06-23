import { Router } from "express";
import { notificationController } from "../controllers/notification.controller";

export const smsCallbackRoutes = Router();

// This route is public because Africa's Talking needs to call it
// Changed from /delivery-report to / to support simple /sms endpoint
smsCallbackRoutes.post("/", notificationController.handleDeliveryReport);
