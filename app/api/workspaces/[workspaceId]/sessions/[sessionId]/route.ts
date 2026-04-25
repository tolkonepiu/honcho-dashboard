import { routeHandler } from "@/lib/api-utils";
import { deleteSession } from "@/lib/honcho";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ workspaceId: string; sessionId: string }>;
};

export const DELETE = routeHandler(
  async (_request: Request, { params }: RouteContext) => {
    const { workspaceId, sessionId } = await params;
    await deleteSession(workspaceId, sessionId);
    return new Response(null, { status: 204 });
  },
);
