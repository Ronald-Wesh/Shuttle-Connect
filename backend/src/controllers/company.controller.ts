import type { Request, Response } from "express";
import { companyService } from "../services/company.service";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/response";

export class CompanyController {
  create = asyncHandler(async (req: Request, res: Response) => {
    const company = await companyService.create(req.body, req.user!);

    return sendSuccess(res, 201, "Company created", company);
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const company = await companyService.getById(
      req.params.id as string,
      req.user!
    );

    return sendSuccess(res, 200, "Company loaded", company);
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const company = await companyService.update(
      req.params.id as string,
      req.body,
      req.user!
    );

    return sendSuccess(res, 200, "Company updated", company);
  });
}

export const companyController = new CompanyController();
