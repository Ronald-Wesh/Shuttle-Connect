import { z } from "zod";

export const idParamSchema = z.object({
  id: z.string().uuid()
});

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional()
});

export const dateTimeString = z
  .string()
  .min(1)
  .refine((value) => !Number.isNaN(Date.parse(value)), {
    message: "Must be a valid ISO date-time string"
  });
