import { Router } from "express";
import { PERMISSIONS } from "../constants/permissions";
import { passengerController } from "../controllers/passenger.controller";
import { authenticate, requirePermission } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { idParamSchema } from "../validators/common.validator";
import {
  createPassengerSchema,
  listPassengersQuerySchema,
  updatePassengerSchema
} from "../validators/passenger.validator";

export const passengerRoutes = Router();

passengerRoutes.use(authenticate);

passengerRoutes.get(
  "/",
  requirePermission(PERMISSIONS.PASSENGER_READ),
  validate({ query: listPassengersQuerySchema }),
  passengerController.list
);
passengerRoutes.post(
  "/",
  requirePermission(PERMISSIONS.PASSENGER_CREATE),
  validate({ body: createPassengerSchema }),
  passengerController.create
);
passengerRoutes.get(
  "/:id",
  requirePermission(PERMISSIONS.PASSENGER_READ),
  validate({ params: idParamSchema }),
  passengerController.getById
);
passengerRoutes.patch(
  "/:id",
  requirePermission(PERMISSIONS.PASSENGER_UPDATE),
  validate({ params: idParamSchema, body: updatePassengerSchema }),
  passengerController.update
);
