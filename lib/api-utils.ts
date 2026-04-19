import { createHonchoErrorResponse } from "@/lib/honcho-errors";

export function parsePositiveInteger(
  value: string | null | undefined,
  fallback: number,
  max = Number.POSITIVE_INFINITY,
): number {
  if (value == null) return fallback;

  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 1) return fallback;

  return Math.min(parsed, max);
}

export function parseBooleanQuery(value: string | null | undefined): boolean {
  return value === "true";
}

export function parseJsonFilters<T extends Record<string, unknown>>(
  value: string | null | undefined,
): T | undefined {
  if (value == null) return undefined;

  try {
    const parsed: unknown = JSON.parse(value);
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      !Array.isArray(parsed)
    ) {
      return parsed as T;
    }
  } catch {
    // invalid JSON — ignore
  }

  return undefined;
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
