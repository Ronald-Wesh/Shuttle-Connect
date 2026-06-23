import { z } from "zod";
import { paginationQuerySchema } from "./common.validator";

export const listNotificationsQuerySchema = paginationQuerySchema.extend({
  companyId: z.string().uuid().optional(),
  unreadOnly: z.coerce.boolean().optional()
});
