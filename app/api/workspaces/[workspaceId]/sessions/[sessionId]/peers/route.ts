import {
  sessionRouteParamsSchema,
  type SessionRouteContext,
} from "@/lib/api-schemas";
import { parseApiInput, routeHandler } from "@/lib/api-utils";
import { getSessionPeers } from "@/lib/honcho";

export const dynamic = "force-dynamic";

export const GET = routeHandler(
  async (_request: Request, { params }: SessionRouteContext) => {
    const { workspaceId, sessionId } = parseApiInput(
      await params,
      sessionRouteParamsSchema,
    );
    const peers = await getSessionPeers(workspaceId, sessionId);

    return Response.json({ items: peers });
  },
);
