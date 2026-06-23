import type { Response } from "express";
import { toCamelCaseDeep } from "./case";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  meta?: unknown;
}

export const sendSuccess = <T>(
  res: Response,
  statusCode: number,
  message: string,
  data?: T,
  meta?: unknown
) => {
  const body: ApiResponse<T> = {
    success: true,
    message
  };

  if (data !== undefined) {
    body.data = toCamelCaseDeep(data) as T;
  }

  if (meta !== undefined) {
    body.meta = meta;
  }

  return res.status(statusCode).json(body);
};
