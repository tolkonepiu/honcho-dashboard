import { nonEmptyStringField } from "@/lib/api-schemas";
import { parseApiInput, parseApiJsonBody, routeHandler } from "@/lib/api-utils";
import { getPeerCard, setPeerCard } from "@/lib/honcho";
import { z } from "zod";

export const dynamic = "force-dynamic";

const peerCardRouteParamsSchema = z.object({
  workspaceId: nonEmptyStringField,
  peerId: nonEmptyStringField,
});

const peerCardRequestBodySchema = z
  .object({
    peer_card: z.array(nonEmptyStringField).nullable(),
  })
  .strict();

type RouteContext = {
  params: Promise<{ workspaceId: string; peerId: string }>;
};

export const GET = routeHandler(
  async (_request: Request, { params }: RouteContext) => {
    const { workspaceId, peerId } = parseApiInput(
      await params,
      peerCardRouteParamsSchema,
      "Route parameters are invalid.",
      "invalid_route_params",
    );
    const card = await getPeerCard(workspaceId, peerId);

    return Response.json(card);
  },
);

export const PUT = routeHandler(
  async (request: Request, { params }: RouteContext) => {
    const { workspaceId, peerId } = parseApiInput(
      await params,
      peerCardRouteParamsSchema,
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
