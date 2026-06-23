import { z } from "zod";
import { VEHICLE_STATUS } from "../constants/vehicleStatus";
import { paginationQuerySchema } from "./common.validator";

const vehicleStatusSchema = z.enum([
  VEHICLE_STATUS.ACTIVE,
  VEHICLE_STATUS.MAINTENANCE,
  VEHICLE_STATUS.INACTIVE
]);

export const createVehicleSchema = z.object({
  companyId: z.string().uuid().optional(),
  name: z.string().min(2).max(120),
  plateNumber: z.string().min(3).max(30),
  model: z.string().min(2).max(120).optional(),
  seatCapacity: z.coerce.number().int().positive().max(100),
  status: vehicleStatusSchema.optional()
});

export const updateVehicleSchema = createVehicleSchema
  .omit({ companyId: true })
  .partial();

export const listVehiclesQuerySchema = paginationQuerySchema.extend({
  companyId: z.string().uuid().optional(),
  search: z.string().min(1).max(120).optional(),
  status: vehicleStatusSchema.optional()
});
