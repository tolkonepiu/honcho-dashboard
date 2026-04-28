import { z } from "zod";

export const nonEmptyStringField = z.string().trim().min(1);

export const optionalNonEmptyStringField = nonEmptyStringField.optional();

export const pageQueryField = z.coerce.number().int().min(1).default(1);

export const sizeQueryField = z.coerce
  .number()
  .int()
  .min(1)
  .max(100)
  .default(10);

export const reverseQueryField = z.stringbool().default(false);

export const paginationQuerySchema = z.object({
  page: pageQueryField,
  size: sizeQueryField,
});

export const workspaceRouteParamsSchema = z.object({
  workspaceId: nonEmptyStringField,
});

export type WorkspaceRouteContext = {
  params: Promise<{ workspaceId: string }>;
};
