import { routeHandler } from "@/lib/api-utils";
import { getSessionPeers } from "@/lib/honcho";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ workspaceId: string; sessionId: string }>;
};

export const GET = routeHandler(
  async (_request: Request, { params }: RouteContext) => {
    const { workspaceId, sessionId } = await params;
    const peers = await getSessionPeers(workspaceId, sessionId);

    return Response.json({ items: peers });
  },
);
