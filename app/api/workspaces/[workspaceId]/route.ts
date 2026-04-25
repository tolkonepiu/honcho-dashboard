import { routeHandler } from "@/lib/api-utils";
import { deleteWorkspace } from "@/lib/honcho";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ workspaceId: string }>;
};

export const DELETE = routeHandler(
  async (_request: Request, { params }: RouteContext) => {
    const { workspaceId } = await params;
    await deleteWorkspace(workspaceId);
    return new Response(null, { status: 204 });
  },
);
