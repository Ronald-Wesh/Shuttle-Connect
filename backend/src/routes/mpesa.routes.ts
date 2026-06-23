import { Router } from "express";
import { PERMISSIONS } from "../constants/permissions";
import { mpesaController } from "../controllers/mpesa.controller";
import { authenticate, requirePermission } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { initiateMpesaPaymentSchema } from "../validators/mpesa.validator";

export const mpesaRoutes = Router();

mpesaRoutes.post(
  "/pay",
  authenticate,
  requirePermission(
    PERMISSIONS.BOOKING_READ_COMPANY,
    PERMISSIONS.BOOKING_READ_OWN
  ),
  validate({ body: initiateMpesaPaymentSchema }),
  mpesaController.pay
);

mpesaRoutes.post("/callback", mpesaController.callback);
