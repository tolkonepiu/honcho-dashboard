import { routeHandler } from "@/lib/api-utils";
import { deleteConclusion } from "@/lib/honcho";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ workspaceId: string; conclusionId: string }>;
};

export const DELETE = routeHandler(
  async (_request: Request, { params }: RouteContext) => {
    const { workspaceId, conclusionId } = await params;
    await deleteConclusion(workspaceId, conclusionId);
    return new Response(null, { status: 204 });
  },
);
