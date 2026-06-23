import { z } from "zod";
import { paginationQuerySchema } from "./common.validator";

export const listAuditLogsQuerySchema = paginationQuerySchema.extend({
  companyId: z.string().uuid().optional(),
  action: z.string().min(2).max(120).optional(),
  entityType: z.string().min(2).max(80).optional(),
  actorId: z.string().uuid().optional()
});
