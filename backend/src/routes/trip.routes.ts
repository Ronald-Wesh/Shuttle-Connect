import { Router } from "express";
import { PERMISSIONS } from "../constants/permissions";
import { tripController } from "../controllers/trip.controller";
import { authenticate, requirePermission } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { idParamSchema } from "../validators/common.validator";
import {
  createTripSchema,
  listTripsQuerySchema,
  updateTripSchema
} from "../validators/trip.validator";

export const tripRoutes = Router();

tripRoutes.use(authenticate);

tripRoutes.get(
  "/",
  requirePermission(PERMISSIONS.TRIP_READ),
  validate({ query: listTripsQuerySchema }),
  tripController.list
);
tripRoutes.post(
  "/",
  requirePermission(PERMISSIONS.TRIP_CREATE),
  validate({ body: createTripSchema }),
  tripController.create
);
tripRoutes.get(
  "/:id",
  requirePermission(PERMISSIONS.TRIP_READ),
  validate({ params: idParamSchema }),
  tripController.getById
);
tripRoutes.patch(
  "/:id",
  requirePermission(PERMISSIONS.TRIP_UPDATE),
  validate({ params: idParamSchema, body: updateTripSchema }),
  tripController.update
);
tripRoutes.patch(
  "/:id/cancel",
  requirePermission(PERMISSIONS.TRIP_CANCEL),
  validate({ params: idParamSchema }),
  tripController.cancel
);
