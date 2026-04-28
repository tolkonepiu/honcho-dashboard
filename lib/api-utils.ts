import { createHonchoErrorResponse, HonchoAppError } from "@/lib/honcho-errors";
import { z, type ZodType } from "zod";

function formatValidationIssues(error: z.ZodError) {
  return error.issues
    .map((issue) => {
      const path = issue.path.length > 0 ? issue.path.join(".") : "request";
      return `${path}: ${issue.message}`;
    })
    .join("; ");
}

function parseWithSchema<T>(
  schema: ZodType<T>,
  input: unknown,
  errorMessage: string,
  errorCode: string,
): T {
  const result = schema.safeParse(input);

  if (!result.success) {
    const details = formatValidationIssues(result.error);
    throw new HonchoAppError(
      details ? `${errorMessage} ${details}` : errorMessage,
      400,
      errorCode,
    );
  }

  return result.data;
}

export function parseApiInput<T>(
  input: unknown,
  schema: ZodType<T>,
  errorMessage = "Request input is invalid.",
  errorCode = "invalid_request_input",
): T {
  return parseWithSchema(schema, input, errorMessage, errorCode);
}

export function parseApiQuery<T>(
  request: Request,
  schema: ZodType<T>,
  errorMessage = "Request query parameters are invalid.",
  errorCode = "invalid_query_params",
): T {
  const { searchParams } = new URL(request.url);

  return parseApiInput(
    Object.fromEntries(searchParams.entries()),
    schema,
    errorMessage,
    errorCode,
  );
}

export async function parseApiJsonBody<T>(
  request: Request,
  schema: ZodType<T>,
  options?: {
    invalidJsonMessage?: string;
    invalidJsonCode?: string;
    invalidBodyMessage?: string;
    invalidBodyCode?: string;
  },
): Promise<T> {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    throw new HonchoAppError(
      options?.invalidJsonMessage ?? "Request body must be valid JSON.",
      400,
      options?.invalidJsonCode ?? "invalid_json_body",
    );
  }

  return parseApiInput(
    body,
    schema,
    options?.invalidBodyMessage ?? "Request body is invalid.",
    options?.invalidBodyCode ?? "invalid_request_body",
  );
}

export function routeHandler<Args extends unknown[]>(
  handler: (...args: Args) => Promise<Response>,
): (...args: Args) => Promise<Response> {
  return async (...args: Args) => {
    try {
      return await handler(...args);
    } catch (error) {
      return createHonchoErrorResponse(error);
    }
  };
}
