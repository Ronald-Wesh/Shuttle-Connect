import { z } from "zod";

const optionalEmail = z.string().email().optional();
const optionalPhone = z.string().min(7).max(30).optional();

export const createCompanySchema = z.object({
  name: z.string().min(2).max(120),
  registrationNumber: z.string().min(2).max(80).optional(),
  phone: optionalPhone,
  email: optionalEmail
});

export const updateCompanySchema = createCompanySchema
  .extend({
    isActive: z.boolean().optional()
  })
  .partial();
