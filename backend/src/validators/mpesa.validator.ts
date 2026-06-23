import { z } from "zod";

export const initiateMpesaPaymentSchema = z.object({
  bookingId: z.string().uuid()
});
