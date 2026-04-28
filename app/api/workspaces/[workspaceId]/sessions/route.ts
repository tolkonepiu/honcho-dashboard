import {
  paginationQuerySchema,
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
    const { page, size } = parseApiQuery(request, paginationQuerySchema);
    const sessions = await listSessionsPaginated(workspaceId, { page, size });

    return Response.json(sessions);
  },
);
