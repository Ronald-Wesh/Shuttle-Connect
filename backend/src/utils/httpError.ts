export class HttpError extends Error {
  public readonly statusCode: number;
  public readonly details?: unknown;

  constructor(statusCode: number, message: string, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}

export const badRequest = (message: string, details?: unknown) =>
  new HttpError(400, message, details);

export const unauthorized = (message = "Authentication required") =>
  new HttpError(401, message);

export const forbidden = (message = "You do not have permission to do this") =>
  new HttpError(403, message);

export const notFound = (message = "Resource not found") =>
  new HttpError(404, message);

export const conflict = (message: string, details?: unknown) =>
  new HttpError(409, message, details);
