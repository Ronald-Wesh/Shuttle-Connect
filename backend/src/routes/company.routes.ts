import { Router } from "express";
import { PERMISSIONS } from "../constants/permissions";
import { companyController } from "../controllers/company.controller";
import { authenticate, requirePermission } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { idParamSchema } from "../validators/common.validator";
import {
  createCompanySchema,
  updateCompanySchema
} from "../validators/company.validator";

export const companyRoutes = Router();

companyRoutes.use(authenticate);

companyRoutes.post(
  "/",
  requirePermission(PERMISSIONS.COMPANY_CREATE),
  validate({ body: createCompanySchema }),
  companyController.create
);
companyRoutes.get(
  "/:id",
  requirePermission(PERMISSIONS.COMPANY_READ),
  validate({ params: idParamSchema }),
  companyController.getById
);
companyRoutes.patch(
  "/:id",
  requirePermission(PERMISSIONS.COMPANY_UPDATE),
  validate({ params: idParamSchema, body: updateCompanySchema }),
  companyController.update
);
