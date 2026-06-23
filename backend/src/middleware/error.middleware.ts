import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { env } from "../config/env";
import { HttpError } from "../utils/httpError";
import { logger } from "../utils/logger";

export const errorMiddleware: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      message: "Validation failed",
      details: err.flatten()
    });
    return;
  }

  if (err instanceof HttpError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      details: err.details
    });
    return;
  }

  logger.error("Unhandled API error", {
    message: err instanceof Error ? err.message : String(err)
  });

  res.status(500).json({
    success: false,
    message: "Internal server error",
    details: env.NODE_ENV === "production" ? undefined : err
  });
};
