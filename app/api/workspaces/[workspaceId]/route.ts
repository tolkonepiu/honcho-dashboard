import {
  type WorkspaceRouteContext,
  workspaceRouteParamsSchema,
} from "@/lib/api-schemas";
import { parseApiInput, routeHandler } from "@/lib/api-utils";
import { deleteWorkspace } from "@/lib/honcho";

export const dynamic = "force-dynamic";

export const DELETE = routeHandler(
  async (_request: Request, { params }: WorkspaceRouteContext) => {
    const { workspaceId } = parseApiInput(
      await params,
      workspaceRouteParamsSchema,
    );
    await deleteWorkspace(workspaceId);
    return new Response(null, { status: 204 });
  },
);
