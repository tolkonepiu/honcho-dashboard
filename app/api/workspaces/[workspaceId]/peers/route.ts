import {
  listQuerySchema,
  type WorkspaceRouteContext,
  workspaceRouteParamsSchema,
} from "@/lib/api-schemas";
import { parseApiInput, parseApiQuery, routeHandler } from "@/lib/api-utils";
import { listPeersPaginated } from "@/lib/honcho";

export const dynamic = "force-dynamic";

export const GET = routeHandler(
  async (request: Request, { params }: WorkspaceRouteContext) => {
    const { workspaceId } = parseApiInput(
      await params,
      workspaceRouteParamsSchema,
      "Route parameters are invalid.",
      "invalid_route_params",
    );
    const { page, reverse, size } = parseApiQuery(request, listQuerySchema);
    const peers = await listPeersPaginated(workspaceId, {
      page,
      reverse,
      size,
    });

    return Response.json(peers);
  },
);
