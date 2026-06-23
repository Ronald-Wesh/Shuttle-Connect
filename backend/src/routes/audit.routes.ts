import { Router } from "express";
import { PERMISSIONS } from "../constants/permissions";
import { auditController } from "../controllers/audit.controller";
import { authenticate, requirePermission } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { listAuditLogsQuerySchema } from "../validators/audit.validator";

export const auditRoutes = Router();

auditRoutes.use(authenticate, requirePermission(PERMISSIONS.AUDIT_READ));

auditRoutes.get(
  "/",
  validate({ query: listAuditLogsQuerySchema }),
  auditController.list
);
