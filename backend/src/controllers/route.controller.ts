import type { Request, Response } from "express";
import { routeService } from "../services/route.service";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/response";

export class RouteController {
  create = asyncHandler(async (req: Request, res: Response) => {
    const route = await routeService.create(req.body, req.user!);

    return sendSuccess(res, 201, "Route created", route);
  });

  list = asyncHandler(async (req: Request, res: Response) => {
    const result = await routeService.list(req.user!, req.query);

    return sendSuccess(res, 200, "Routes loaded", result.routes, result.meta);
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const route = await routeService.getById(
      req.params.id as string,
      req.user!
    );

    return sendSuccess(res, 200, "Route loaded", route);
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const route = await routeService.update(
      req.params.id as string,
      req.body,
      req.user!
    );

    return sendSuccess(res, 200, "Route updated", route);
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    const route = await routeService.delete(
      req.params.id as string,
      req.user!
    );

    return sendSuccess(res, 200, "Route deleted", route);
  });
}

export const routeController = new RouteController();
