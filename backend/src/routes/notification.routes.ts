import { Router } from "express";
import { PERMISSIONS } from "../constants/permissions";
import { notificationController } from "../controllers/notification.controller";
import { authenticate, requirePermission } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { listNotificationsQuerySchema } from "../validators/notification.validator";

export const notificationRoutes = Router();

notificationRoutes.use(
  authenticate,
  requirePermission(PERMISSIONS.NOTIFICATION_READ_COMPANY)
);

notificationRoutes.get(
  "/",
  validate({ query: listNotificationsQuerySchema }),
  notificationController.list
);
