import { z } from "zod";
import { BOOKING_STATUS } from "../constants/bookingStatus";
import { paginationQuerySchema } from "./common.validator";

const bookingStatusSchema = z.enum([
  BOOKING_STATUS.PENDING,
  BOOKING_STATUS.CONFIRMED,
  BOOKING_STATUS.CANCELLED,
  BOOKING_STATUS.EXPIRED
]);

export const createBookingSchema = z.object({
  tripId: z.string().uuid(),
  passengerId: z.string().uuid().optional(),
  passenger: z
    .object({
      fullName: z.string().min(2).max(120),
      phone: z.string().min(7).max(30),
      email: z.string().email().optional(),
      nationalId: z.string().min(3).max(40).optional()
    })
    .optional(),
  seatCount: z.coerce.number().int().positive().max(20)
}).refine((value) => Boolean(value.passengerId) !== Boolean(value.passenger), {
  message: "Provide either passengerId or passenger, but not both",
  path: ["passengerId"]
});

export const cancelBookingSchema = z.object({
  reason: z.string().min(2).max(300).optional()
});

export const listBookingsQuerySchema = paginationQuerySchema.extend({
  companyId: z.string().uuid().optional(),
  passengerId: z.string().uuid().optional(),
  tripId: z.string().uuid().optional(),
  status: bookingStatusSchema.optional()
});
