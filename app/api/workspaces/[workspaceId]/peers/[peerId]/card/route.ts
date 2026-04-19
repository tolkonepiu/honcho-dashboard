import { routeHandler } from "@/lib/api-utils";
import { getPeerCard } from "@/lib/honcho";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ workspaceId: string; peerId: string }>;
};

export const GET = routeHandler(
  async (_request: Request, { params }: RouteContext) => {
    const { workspaceId, peerId } = await params;
    const card = await getPeerCard(workspaceId, peerId);

    return Response.json(card);
  },
);
