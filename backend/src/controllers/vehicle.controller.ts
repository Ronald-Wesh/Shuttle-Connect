import type { Request, Response } from "express";
import { vehicleService } from "../services/vehicle.service";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/response";

export class VehicleController {
  create = asyncHandler(async (req: Request, res: Response) => {
    const vehicle = await vehicleService.create(req.body, req.user!);

    return sendSuccess(res, 201, "Vehicle created", vehicle);
  });

  list = asyncHandler(async (req: Request, res: Response) => {
    const result = await vehicleService.list(req.user!, req.query);

    return sendSuccess(
      res,
      200,
      "Vehicles loaded",
      result.vehicles,
      result.meta
    );
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const vehicle = await vehicleService.getById(
      req.params.id as string,
      req.user!
    );

    return sendSuccess(res, 200, "Vehicle loaded", vehicle);
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const vehicle = await vehicleService.update(
      req.params.id as string,
      req.body,
      req.user!
    );

    return sendSuccess(res, 200, "Vehicle updated", vehicle);
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    const vehicle = await vehicleService.delete(
      req.params.id as string,
      req.user!
    );

    return sendSuccess(res, 200, "Vehicle deleted", vehicle);
  });
}

export const vehicleController = new VehicleController();
