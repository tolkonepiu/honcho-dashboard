import {
  type SessionRouteContext,
  sessionRouteParamsSchema,
} from "@/lib/api-schemas";
import { parseApiInput, routeHandler } from "@/lib/api-utils";
import { deleteSession } from "@/lib/honcho";

export const dynamic = "force-dynamic";

export const DELETE = routeHandler(
  async (_request: Request, { params }: SessionRouteContext) => {
    const { workspaceId, sessionId } = parseApiInput(
      await params,
      sessionRouteParamsSchema,
    );
    await deleteSession(workspaceId, sessionId);
    return new Response(null, { status: 204 });
  },
);
