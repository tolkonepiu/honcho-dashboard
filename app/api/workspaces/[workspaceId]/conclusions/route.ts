import {
  conclusionsQuerySchema,
  type WorkspaceRouteContext,
  workspaceRouteParamsSchema,
} from "@/lib/api-schemas";
import { parseApiInput, parseApiQuery, routeHandler } from "@/lib/api-utils";
import { listConclusions } from "@/lib/honcho";

export const dynamic = "force-dynamic";

export const GET = routeHandler(
  async (request: Request, { params }: WorkspaceRouteContext) => {
    const { workspaceId } = parseApiInput(
      await params,
      workspaceRouteParamsSchema,
    );
    const { page, size, reverse, filters } = parseApiQuery(
      request,
      conclusionsQuerySchema,
    );

    const conclusions = await listConclusions(workspaceId, {
      page,
      size,
      reverse,
      filters,
    });

    return Response.json(conclusions);
  },
);
