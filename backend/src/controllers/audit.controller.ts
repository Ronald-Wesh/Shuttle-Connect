import type { Request, Response } from "express";
import { auditService } from "../services/audit.service";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/response";

export class AuditController {
  list = asyncHandler(async (req: Request, res: Response) => {
    const result = await auditService.list(req.user!, req.query);

    return sendSuccess(
      res,
      200,
      "Audit logs loaded",
      result.auditLogs,
      result.meta
    );
  });
}

export const auditController = new AuditController();
