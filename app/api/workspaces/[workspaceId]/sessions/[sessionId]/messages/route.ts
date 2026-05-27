import {
  messagesQuerySchema,
  sessionRouteParamsSchema,
  type SessionRouteContext,
} from "@/lib/api-schemas";
import { parseApiInput, parseApiQuery, routeHandler } from "@/lib/api-utils";
import { listMessagesPaginated } from "@/lib/honcho";

export const dynamic = "force-dynamic";

export const GET = routeHandler(
  async (request: Request, { params }: SessionRouteContext) => {
    const { workspaceId, sessionId } = parseApiInput(
      await params,
      sessionRouteParamsSchema,
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
