import { z } from "zod";
import { TRIP_STATUS } from "../constants/tripStatus";
import { dateTimeString, paginationQuerySchema } from "./common.validator";

const tripStatusSchema = z.enum([
  TRIP_STATUS.SCHEDULED,
  TRIP_STATUS.BOARDING,
  TRIP_STATUS.DEPARTED,
  TRIP_STATUS.COMPLETED,
  TRIP_STATUS.CANCELLED
]);

export const createTripSchema = z
  .object({
    companyId: z.string().uuid().optional(),
    routeId: z.string().uuid(),
    vehicleId: z.string().uuid(),
    vehicleName: z.string().min(1).max(100).optional(),
    vehicleRegistration: z.string().min(1).max(30).optional(),
    departureTime: dateTimeString,
    arrivalTime: dateTimeString.optional(),
    fareAmount: z.coerce.number().positive(),
    totalSeats: z.coerce.number().int().positive().max(100).optional(),
    availableSeats: z.coerce.number().int().positive().max(100).optional()
  })
  .refine(
    (value) => value.totalSeats === undefined || value.availableSeats === undefined,
    {
      message: "Provide either totalSeats or availableSeats, but not both",
      path: ["availableSeats"]
    }
  );

export const updateTripSchema = z
  .object({
    routeId: z.string().uuid().optional(),
    vehicleId: z.string().uuid().optional(),
    vehicleName: z.string().min(1).max(100).optional(),
    vehicleRegistration: z.string().min(1).max(30).optional(),
    departureTime: dateTimeString.optional(),
    arrivalTime: dateTimeString.optional(),
    fareAmount: z.coerce.number().positive().optional(),
    totalSeats: z.coerce.number().int().positive().max(100).optional(),
    availableSeats: z.coerce.number().int().positive().max(100).optional(),
    status: tripStatusSchema.optional()
  })
  .refine(
    (value) => value.totalSeats === undefined || value.availableSeats === undefined,
    {
      message: "Provide either totalSeats or availableSeats, but not both",
      path: ["availableSeats"]
    }
  );

export const listTripsQuerySchema = paginationQuerySchema.extend({
  companyId: z.string().uuid().optional(),
  vehicleId: z.string().uuid().optional(),
  origin: z.string().min(1).max(120).optional(),
  destination: z.string().min(1).max(120).optional(),
  departureDate: z.string().min(4).max(20).optional(),
  status: tripStatusSchema.optional()
});
