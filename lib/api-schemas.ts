import { z } from "zod";

export const nonEmptyStringField = z.string().trim().min(1);

export const optionalNonEmptyStringField = nonEmptyStringField.optional();

export const pageQueryField = z.coerce.number().int().min(1).default(1);

export const sizeQueryField = z.coerce
  .number()
  .int()
  .min(1)
  .max(100)
  .default(5);

export const reverseQueryField = z.stringbool().default(false);

export const paginationQuerySchema = z.object({
  page: pageQueryField,
  size: sizeQueryField,
});

export const listQuerySchema = paginationQuerySchema.extend({
  reverse: reverseQueryField,
});

export const workspaceRouteParamsSchema = z.object({
  workspaceId: nonEmptyStringField,
});

export const peerRouteParamsSchema = workspaceRouteParamsSchema.extend({
  peerId: nonEmptyStringField,
});

export const sessionRouteParamsSchema = workspaceRouteParamsSchema.extend({
  sessionId: nonEmptyStringField,
});

export const conclusionRouteParamsSchema = workspaceRouteParamsSchema.extend({
  conclusionId: nonEmptyStringField,
});

export const peerSessionsRouteParamsSchema = peerRouteParamsSchema;

const messageFiltersSchema = z
  .object({
    peer_id: nonEmptyStringField,
  })
  .strict();

export const messageFiltersQuerySchema = z
  .string()
  .transform((value, context) => {
    try {
      return JSON.parse(value) as unknown;
    } catch {
      context.addIssue({
        code: "custom",
        message: "must be valid JSON",
      });
      return z.NEVER;
    }
  })
  .pipe(messageFiltersSchema);

export const messagesQuerySchema = listQuerySchema.extend({
  filters: messageFiltersQuerySchema.optional(),
});

export const conclusionsQuerySchema = listQuerySchema
  .extend({
    observer_id: optionalNonEmptyStringField,
    observed_id: optionalNonEmptyStringField,
    session_id: optionalNonEmptyStringField,
  })
  .transform(({ observer_id, observed_id, session_id, ...pagination }) => ({
    ...pagination,
    filters: {
      ...(observer_id ? { observer_id } : {}),
      ...(observed_id ? { observed_id } : {}),
      ...(session_id ? { session_id } : {}),
    },
  }));

export const peerCardRequestBodySchema = z
  .object({
    peer_card: z.array(nonEmptyStringField).nullable(),
  })
  .strict();

export type WorkspaceRouteContext = {
  params: Promise<{ workspaceId: string }>;
};

export type PeerRouteContext = {
  params: Promise<{ workspaceId: string; peerId: string }>;
};

export type SessionRouteContext = {
  params: Promise<{ workspaceId: string; sessionId: string }>;
};

export type ConclusionRouteContext = {
  params: Promise<{ workspaceId: string; conclusionId: string }>;
};
