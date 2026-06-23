import type { Request, Response } from "express";
import { tripService } from "../services/trip.service";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/response";

export class TripController {
  create = asyncHandler(async (req: Request, res: Response) => {
    const trip = await tripService.create(req.body, req.user!);

    return sendSuccess(res, 201, "Trip created", trip);
  });

  list = asyncHandler(async (req: Request, res: Response) => {
    const result = await tripService.list(req.user!, req.query);

    return sendSuccess(res, 200, "Trips loaded", result.trips, result.meta);
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const trip = await tripService.getById(
      req.params.id as string,
      req.user!
    );

    return sendSuccess(res, 200, "Trip loaded", trip);
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const trip = await tripService.update(
      req.params.id as string,
      req.body,
      req.user!
    );

    return sendSuccess(res, 200, "Trip updated", trip);
  });

  cancel = asyncHandler(async (req: Request, res: Response) => {
    const trip = await tripService.cancel(
      req.params.id as string,
      req.user!
    );

    return sendSuccess(res, 200, "Trip cancelled", trip);
  });
}

export const tripController = new TripController();
