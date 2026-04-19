import {
  parseBooleanQuery,
  parseJsonFilters,
  parsePositiveInteger,
  routeHandler,
} from "@/lib/api-utils";
import type { MessageFilters } from "@/lib/honcho";
import { listMessagesPaginated } from "@/lib/honcho";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ workspaceId: string; sessionId: string }>;
};

export const GET = routeHandler(
  async (request: Request, { params }: RouteContext) => {
    const { workspaceId, sessionId } = await params;
    const { searchParams } = new URL(request.url);

    const page = parsePositiveInteger(searchParams.get("page"), 1);
    const size = parsePositiveInteger(searchParams.get("size"), 10, 100);
    const reverse = parseBooleanQuery(searchParams.get("reverse"));
    const filters = parseJsonFilters<MessageFilters>(
      searchParams.get("filters"),
    );

    const messages = await listMessagesPaginated(workspaceId, sessionId, {
      page,
      size,
      reverse,
      filters,
    });

    return Response.json(messages);
  },
);
