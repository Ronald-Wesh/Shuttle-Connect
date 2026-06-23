import { HttpError } from "../utils/httpError";

interface SupabaseLikeError {
  message: string;
  details?: string | null;
  hint?: string | null;
  code?: string;
}

export const throwDatabaseError = (
  error: SupabaseLikeError | null,
  fallbackMessage = "Database operation failed"
) => {
  if (!error) {
    return;
  }

  const statusCode = error.code === "23505" ? 409 : 400;

  throw new HttpError(statusCode, error.message || fallbackMessage, {
    details: error.details,
    hint: error.hint,
    code: error.code
  });
};
