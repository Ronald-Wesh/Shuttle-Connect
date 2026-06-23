import { Router } from "express";
import { PERMISSIONS } from "../constants/permissions";
import { bookingController } from "../controllers/booking.controller";
import { authenticate, requirePermission } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { idParamSchema } from "../validators/common.validator";
import {
  cancelBookingSchema,
  createBookingSchema,
  listBookingsQuerySchema
} from "../validators/booking.validator";

export const bookingRoutes = Router();

bookingRoutes.use(authenticate);

bookingRoutes.post(
  "/",
  requirePermission(
    PERMISSIONS.BOOKING_CREATE_COMPANY,
    PERMISSIONS.BOOKING_CREATE_OWN
  ),
  validate({ body: createBookingSchema }),
  bookingController.create
);
bookingRoutes.get(
  "/",
  requirePermission(
    PERMISSIONS.BOOKING_READ_COMPANY,
    PERMISSIONS.BOOKING_READ_OWN
  ),
  validate({ query: listBookingsQuerySchema }),
  bookingController.list
);
bookingRoutes.get(
  "/:id",
  requirePermission(
    PERMISSIONS.BOOKING_READ_COMPANY,
    PERMISSIONS.BOOKING_READ_OWN
  ),
  validate({ params: idParamSchema }),
  bookingController.getById
);
bookingRoutes.patch(
  "/:id/confirm",
  requirePermission(PERMISSIONS.BOOKING_CONFIRM),
  validate({ params: idParamSchema }),
  bookingController.confirm
);
bookingRoutes.patch(
  "/:id/cancel",
  requirePermission(
    PERMISSIONS.BOOKING_CANCEL_COMPANY,
    PERMISSIONS.BOOKING_CANCEL_OWN
  ),
  validate({ params: idParamSchema, body: cancelBookingSchema }),
  bookingController.cancel
);
