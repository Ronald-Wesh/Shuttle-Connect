import type { NextFunction, Request, Response } from "express";
import type { ZodTypeAny } from "zod";
import { badRequest } from "../utils/httpError";
import { toCamelCaseDeep } from "../utils/case";

interface RequestSchemas {
  body?: ZodTypeAny;
  params?: ZodTypeAny;
  query?: ZodTypeAny;
}

const parsePart = (schema: ZodTypeAny, value: unknown, part: string) => {
  const parsed = schema.safeParse(value);

  if (!parsed.success) {
    throw badRequest(`${part} validation failed`, parsed.error.flatten());
  }

  return parsed.data;
};

export const validate =
  (schemas: RequestSchemas) =>
  (req: Request, _res: Response, next: NextFunction) => {
    if (schemas.body) {
      const bodyValue = req.body ?? {};
      const transformedBody = toCamelCaseDeep(bodyValue) as unknown;
      req.body = parsePart(schemas.body, transformedBody, "Body");
    }

    if (schemas.params) {
      const parsedParams = parsePart(schemas.params, req.params, "Params") as Record<string, unknown>;
      const transformedParams = toCamelCaseDeep(parsedParams) as Record<string, unknown>;
      Object.assign(req.params, transformedParams);
    }

    if (schemas.query) {
      const parsedQuery = parsePart(schemas.query, req.query, "Query") as Record<string, unknown>;
      const transformedQuery = toCamelCaseDeep(parsedQuery) as Record<string, unknown>;
      Object.entries(transformedQuery).forEach(([key, value]) => {
        (req.query as Record<string, unknown>)[key] = value;
      });
    }

    next();
  };
