import { Router } from "express";
import { openApiSpec } from "../docs/openapi";

export const docsRoutes = Router();

docsRoutes.get("/", (_req, res) => {
  res.status(200).json(openApiSpec);
});
