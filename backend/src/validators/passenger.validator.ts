import { z } from "zod";
import { paginationQuerySchema } from "./common.validator";

export const createPassengerSchema = z.object({
  companyId: z.string().uuid().optional(),
  fullName: z.string().min(2).max(120),
  phone: z.string().min(7).max(30),
  email: z.string().email().optional(),
  nationalId: z.string().min(3).max(40).optional()
});

export const updatePassengerSchema = createPassengerSchema.partial();

export const listPassengersQuerySchema = paginationQuerySchema.extend({
  companyId: z.string().uuid().optional(),
  search: z.string().min(1).max(120).optional()
});
