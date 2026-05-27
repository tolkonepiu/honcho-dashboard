import {
  peerCardRequestBodySchema,
  type PeerRouteContext,
  peerRouteParamsSchema,
} from "@/lib/api-schemas";
import { parseApiInput, parseApiJsonBody, routeHandler } from "@/lib/api-utils";
import { getPeerCard, setPeerCard } from "@/lib/honcho";

export const dynamic = "force-dynamic";

export const GET = routeHandler(
  async (_request: Request, { params }: PeerRouteContext) => {
    const { workspaceId, peerId } = parseApiInput(
      await params,
      peerRouteParamsSchema,
      "Route parameters are invalid.",
      "invalid_route_params",
    );
    const card = await getPeerCard(workspaceId, peerId);

    return Response.json(card);
  },
);

export const PUT = routeHandler(
  async (request: Request, { params }: PeerRouteContext) => {
    const { workspaceId, peerId } = parseApiInput(
      await params,
      peerRouteParamsSchema,
      "Route parameters are invalid.",
      "invalid_route_params",
    );
    const { peer_card: peerCard } = await parseApiJsonBody(
      request,
      peerCardRequestBodySchema,
      {
        invalidBodyMessage:
          "Peer card updates require a peer_card field that is null or an array of strings.",
        invalidBodyCode: "invalid_peer_card_body",
      },
    );
    const updatedCard = await setPeerCard(workspaceId, peerId, peerCard);

    return Response.json(updatedCard);
  },
);
