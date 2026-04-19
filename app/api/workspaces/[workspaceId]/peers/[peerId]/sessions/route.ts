import { parsePositiveInteger, routeHandler } from "@/lib/api-utils";
import { listPeerSessionsPaginated } from "@/lib/honcho";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ workspaceId: string; peerId: string }>;
};

export const GET = routeHandler(
  async (request: Request, { params }: RouteContext) => {
    const { workspaceId, peerId } = await params;
    const { searchParams } = new URL(request.url);

    const page = parsePositiveInteger(searchParams.get("page"), 1);
    const size = parsePositiveInteger(searchParams.get("size"), 10, 100);
    const sessions = await listPeerSessionsPaginated(workspaceId, peerId, {
      page,
      size,
    });

    return Response.json(sessions);
  },
);
