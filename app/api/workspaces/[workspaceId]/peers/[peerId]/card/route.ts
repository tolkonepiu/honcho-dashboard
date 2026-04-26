import { routeHandler } from "@/lib/api-utils";
import { getPeerCard, setPeerCard } from "@/lib/honcho";
import { HonchoAppError } from "@/lib/honcho-errors";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ workspaceId: string; peerId: string }>;
};

function parsePeerCardRequestBody(body: unknown): string[] | null {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    throw new HonchoAppError(
      "Peer card updates require an object body with a peer_card field.",
      400,
      "invalid_peer_card_body",
    );
  }

  const peerCard = (body as { peer_card?: unknown }).peer_card;

  if (peerCard === null) {
    return null;
  }

  if (
    !Array.isArray(peerCard) ||
    !peerCard.every((entry) => typeof entry === "string")
  ) {
    throw new HonchoAppError(
      "peer_card must be null or an array of strings.",
      400,
      "invalid_peer_card_value",
    );
  }

  return peerCard;
}

export const GET = routeHandler(
  async (_request: Request, { params }: RouteContext) => {
    const { workspaceId, peerId } = await params;
    const card = await getPeerCard(workspaceId, peerId);

    return Response.json(card);
  },
);

export const PUT = routeHandler(
  async (request: Request, { params }: RouteContext) => {
    const { workspaceId, peerId } = await params;

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      throw new HonchoAppError(
        "Request body must be valid JSON.",
        400,
        "invalid_json_body",
      );
    }

    const peerCard = parsePeerCardRequestBody(body);
    const updatedCard = await setPeerCard(workspaceId, peerId, peerCard);

    return Response.json(updatedCard);
  },
);
