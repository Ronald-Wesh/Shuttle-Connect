import { Router } from "express";
import { PERMISSIONS } from "../constants/permissions";
import { vehicleController } from "../controllers/vehicle.controller";
import { authenticate, requirePermission } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { idParamSchema } from "../validators/common.validator";
import {
  createVehicleSchema,
  listVehiclesQuerySchema,
  updateVehicleSchema
} from "../validators/vehicle.validator";

export const vehicleRoutes = Router();

vehicleRoutes.use(authenticate);

vehicleRoutes.get(
  "/",
  requirePermission(PERMISSIONS.VEHICLE_READ),
  validate({ query: listVehiclesQuerySchema }),
  vehicleController.list
);
vehicleRoutes.post(
  "/",
  requirePermission(PERMISSIONS.VEHICLE_CREATE),
  validate({ body: createVehicleSchema }),
  vehicleController.create
);
vehicleRoutes.get(
  "/:id",
  requirePermission(PERMISSIONS.VEHICLE_READ),
  validate({ params: idParamSchema }),
  vehicleController.getById
);
vehicleRoutes.patch(
  "/:id",
  requirePermission(PERMISSIONS.VEHICLE_UPDATE),
  validate({ params: idParamSchema, body: updateVehicleSchema }),
  vehicleController.update
);
vehicleRoutes.delete(
  "/:id",
  requirePermission(PERMISSIONS.VEHICLE_DELETE),
  validate({ params: idParamSchema }),
  vehicleController.delete
);
