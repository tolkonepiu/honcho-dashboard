import {
  listQuerySchema,
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
    const { page, reverse, size } = parseApiQuery(request, listQuerySchema);
    const sessions = await listPeerSessionsPaginated(workspaceId, peerId, {
      page,
      reverse,
      size,
    });

    return Response.json(sessions);
  },
);
