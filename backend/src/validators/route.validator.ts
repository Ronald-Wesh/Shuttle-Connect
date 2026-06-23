import { z } from "zod";
import { paginationQuerySchema } from "./common.validator";

export const createRouteSchema = z.object({
  companyId: z.string().uuid().optional(),
  origin: z.string().min(2).max(120),
  destination: z.string().min(2).max(120),
  distanceKm: z.coerce.number().positive().optional(),
  estimatedDurationMinutes: z.coerce.number().int().positive().optional()
});

export const updateRouteSchema = createRouteSchema
  .extend({
    isActive: z.boolean().optional()
  })
  .partial();

export const listRoutesQuerySchema = paginationQuerySchema.extend({
  companyId: z.string().uuid().optional(),
  search: z.string().min(1).max(120).optional(),
  active: z.coerce.boolean().optional()
});
