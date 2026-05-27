import {
  paginationQuerySchema,
  peerSessionsRouteParamsSchema,
  type PeerRouteContext,
} from "@/lib/api-schemas";
import { parseApiInput, parseApiQuery, routeHandler } from "@/lib/api-utils";
import { listPeerSessionsPaginated } from "@/lib/honcho";

export const dynamic = "force-dynamic";

export const GET = routeHandler(
  async (request: Request, { params }: PeerRouteContext) => {
    const { workspaceId, peerId } = parseApiInput(
      await params,
      peerSessionsRouteParamsSchema,
    );
    const { page, size } = parseApiQuery(request, paginationQuerySchema);
    const sessions = await listPeerSessionsPaginated(workspaceId, peerId, {
      page,
      size,
    });

    return Response.json(sessions);
  },
);
