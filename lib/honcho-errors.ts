import {
  AuthenticationError,
  BadRequestError,
  ConflictError,
  ConnectionError,
  HonchoError,
  NotFoundError,
  PermissionDeniedError,
  RateLimitError,
  ServerError,
  TimeoutError,
  UnprocessableEntityError,
} from "@honcho-ai/sdk";

export class HonchoAppError extends Error {
  status: number;
  code: string;

  constructor(message: string, status: number, code: string) {
    super(message);
    this.name = "HonchoAppError";
    this.status = status;
    this.code = code;
  }
}

export function isHonchoAppError(error: unknown): error is HonchoAppError {
  return error instanceof HonchoAppError;
}

export function normalizeHonchoError(
  error: unknown,
  fallbackMessage = "Unable to load data from Honcho.",
): HonchoAppError {
  if (error instanceof HonchoAppError) {
    return error;
  }

  if (error instanceof AuthenticationError) {
    return new HonchoAppError(
      "Honcho authentication failed. The workspace may require an API key, or the configured HONCHO_API_KEY is invalid.",
      401,
      "honcho_authentication_failed",
    );
  }

  if (error instanceof PermissionDeniedError) {
    return new HonchoAppError(
      "The configured Honcho credentials do not have permission for this action.",
      403,
      "honcho_permission_denied",
    );
  }

  if (error instanceof NotFoundError) {
    return new HonchoAppError(
      "The requested Honcho resource could not be found.",
      404,
      "honcho_not_found",
    );
  }

  if (error instanceof RateLimitError) {
    return new HonchoAppError(
      "Honcho rate limit reached. Please try again shortly.",
      429,
      "honcho_rate_limited",
    );
  }

  if (error instanceof TimeoutError || error instanceof ConnectionError) {
    return new HonchoAppError(
      "Honcho is currently unavailable. Please try again in a moment.",
      503,
      "honcho_unavailable",
    );
  }

  if (error instanceof ServerError) {
    return new HonchoAppError(
      "Honcho returned a server error. Please try again later.",
      error.status || 502,
      "honcho_server_error",
    );
  }

  if (error instanceof BadRequestError) {
    return new HonchoAppError(
      error.message || "Honcho rejected this request.",
      400,
      "honcho_bad_request",
    );
  }

  if (error instanceof ConflictError) {
    return new HonchoAppError(
      error.message || "Honcho reported a resource conflict.",
      409,
      "honcho_conflict",
    );
  }

  if (error instanceof UnprocessableEntityError) {
    return new HonchoAppError(
      error.message || "Honcho could not process this request.",
      422,
      "honcho_unprocessable_entity",
    );
  }

  if (error instanceof HonchoError) {
    return new HonchoAppError(
      error.message || fallbackMessage,
      error.status || 500,
      error.code || "honcho_error",
    );
  }

  if (error instanceof Error) {
    return new HonchoAppError(
      error.message || fallbackMessage,
      500,
      "honcho_unknown_error",
    );
  }

  return new HonchoAppError(fallbackMessage, 500, "honcho_unknown_error");
}

export function createHonchoErrorResponse(error: unknown) {
  const normalized = normalizeHonchoError(error);

  return Response.json(
    {
      error: {
        message: normalized.message,
        code: normalized.code,
      },
    },
    { status: normalized.status },
  );
}
