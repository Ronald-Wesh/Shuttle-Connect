import { Router } from "express";
import { PERMISSIONS } from "../constants/permissions";
import { routeController } from "../controllers/route.controller";
import { authenticate, requirePermission } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { idParamSchema } from "../validators/common.validator";
import {
  createRouteSchema,
  listRoutesQuerySchema,
  updateRouteSchema
} from "../validators/route.validator";

export const routeRoutes = Router();

routeRoutes.use(authenticate);

routeRoutes.get(
  "/",
  requirePermission(PERMISSIONS.ROUTE_READ),
  validate({ query: listRoutesQuerySchema }),
  routeController.list
);
routeRoutes.post(
  "/",
  requirePermission(PERMISSIONS.ROUTE_CREATE),
  validate({ body: createRouteSchema }),
  routeController.create
);
routeRoutes.get(
  "/:id",
  requirePermission(PERMISSIONS.ROUTE_READ),
  validate({ params: idParamSchema }),
  routeController.getById
);
routeRoutes.patch(
  "/:id",
  requirePermission(PERMISSIONS.ROUTE_UPDATE),
  validate({ params: idParamSchema, body: updateRouteSchema }),
  routeController.update
);
routeRoutes.delete(
  "/:id",
  requirePermission(PERMISSIONS.ROUTE_DELETE),
  validate({ params: idParamSchema }),
  routeController.delete
);
