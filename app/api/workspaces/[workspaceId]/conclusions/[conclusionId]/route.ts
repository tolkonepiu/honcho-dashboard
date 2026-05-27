import {
  conclusionRouteParamsSchema,
  type ConclusionRouteContext,
} from "@/lib/api-schemas";
import { parseApiInput, routeHandler } from "@/lib/api-utils";
import { deleteConclusion } from "@/lib/honcho";

export const dynamic = "force-dynamic";

export const DELETE = routeHandler(
  async (_request: Request, { params }: ConclusionRouteContext) => {
    const { workspaceId, conclusionId } = parseApiInput(
      await params,
      conclusionRouteParamsSchema,
    );
    await deleteConclusion(workspaceId, conclusionId);
    return new Response(null, { status: 204 });
  },
);
