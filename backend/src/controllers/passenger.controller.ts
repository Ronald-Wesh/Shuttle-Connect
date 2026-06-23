import type { Request, Response } from "express";
import { passengerService } from "../services/passenger.service";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/response";

export class PassengerController {
  create = asyncHandler(async (req: Request, res: Response) => {
    const passenger = await passengerService.create(req.body, req.user!);

    return sendSuccess(res, 201, "Passenger created", passenger);
  });

  list = asyncHandler(async (req: Request, res: Response) => {
    const result = await passengerService.list(req.user!, req.query);

    return sendSuccess(
      res,
      200,
      "Passengers loaded",
      result.passengers,
      result.meta
    );
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const passenger = await passengerService.getById(
      req.params.id as string,
      req.user!
    );

    return sendSuccess(res, 200, "Passenger loaded", passenger);
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const passenger = await passengerService.update(
      req.params.id as string,
      req.body,
      req.user!
    );

    return sendSuccess(res, 200, "Passenger updated", passenger);
  });
}

export const passengerController = new PassengerController();
