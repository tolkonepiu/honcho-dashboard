import {
  listQuerySchema,
  type WorkspaceRouteContext,
  workspaceRouteParamsSchema,
} from "@/lib/api-schemas";
import { parseApiInput, parseApiQuery, routeHandler } from "@/lib/api-utils";
import { listSessionsPaginated } from "@/lib/honcho";

export const dynamic = "force-dynamic";

export const GET = routeHandler(
  async (request: Request, { params }: WorkspaceRouteContext) => {
    const { workspaceId } = parseApiInput(
      await params,
      workspaceRouteParamsSchema,
    );
    const { page, reverse, size } = parseApiQuery(request, listQuerySchema);
    const sessions = await listSessionsPaginated(workspaceId, {
      page,
      reverse,
      size,
    });

    return Response.json(sessions);
  },
);
