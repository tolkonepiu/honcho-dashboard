import {
  nonEmptyStringField,
  pageQueryField,
  reverseQueryField,
  sizeQueryField,
} from "@/lib/api-schemas";
import { parseApiInput, parseApiQuery, routeHandler } from "@/lib/api-utils";
import { listMessagesPaginated } from "@/lib/honcho";
import { z } from "zod";

export const dynamic = "force-dynamic";

const messagesRouteParamsSchema = z.object({
  workspaceId: nonEmptyStringField,
  sessionId: nonEmptyStringField,
});

const messageFiltersSchema = z
  .object({
    peer_id: nonEmptyStringField,
  })
  .strict();

const messageFiltersQuerySchema = z
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

const messagesQuerySchema = z.object({
  page: pageQueryField,
  size: sizeQueryField,
  reverse: reverseQueryField,
  filters: messageFiltersQuerySchema.optional(),
});

type RouteContext = {
  params: Promise<{ workspaceId: string; sessionId: string }>;
};

export const GET = routeHandler(
  async (request: Request, { params }: RouteContext) => {
    const { workspaceId, sessionId } = parseApiInput(
      await params,
      messagesRouteParamsSchema,
      "Route parameters are invalid.",
      "invalid_route_params",
    );
    const { page, size, reverse, filters } = parseApiQuery(
      request,
      messagesQuerySchema,
    );

    const messages = await listMessagesPaginated(workspaceId, sessionId, {
      page,
      size,
      reverse,
      filters,
    });

    return Response.json(messages);
  },
);
