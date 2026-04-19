import { parsePositiveInteger, routeHandler } from "@/lib/api-utils";
import { listPeersPaginated } from "@/lib/honcho";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ workspaceId: string }>;
};

export const GET = routeHandler(
  async (request: Request, { params }: RouteContext) => {
    const { workspaceId } = await params;
    const { searchParams } = new URL(request.url);

    const page = parsePositiveInteger(searchParams.get("page"), 1);
    const size = parsePositiveInteger(searchParams.get("size"), 10, 100);
    const peers = await listPeersPaginated(workspaceId, { page, size });

    return Response.json(peers);
  },
);
