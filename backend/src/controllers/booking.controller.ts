import type { Request, Response } from "express";
import { bookingService } from "../services/booking.service";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/response";

export class BookingController {
  create = asyncHandler(async (req: Request, res: Response) => {
    const booking = await bookingService.create(req.body, req.user!);

    return sendSuccess(res, 201, "Booking created", booking);
  });

  list = asyncHandler(async (req: Request, res: Response) => {
    const result = await bookingService.list(req.user!, req.query);

    return sendSuccess(res, 200, "Bookings loaded", result.bookings, result.meta);
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const booking = await bookingService.getById(
      req.params.id as string,
      req.user!
    );

    return sendSuccess(res, 200, "Booking loaded", booking);
  });

  confirm = asyncHandler(async (req: Request, res: Response) => {
    const booking = await bookingService.confirm(
      req.params.id as string,
      req.user!
    );

    return sendSuccess(res, 200, "Booking confirmed", booking);
  });

  cancel = asyncHandler(async (req: Request, res: Response) => {
    const booking = await bookingService.cancel(
      req.params.id as string,
      req.body,
      req.user!
    );

    return sendSuccess(res, 200, "Booking cancelled", booking);
  });
}

export const bookingController = new BookingController();
