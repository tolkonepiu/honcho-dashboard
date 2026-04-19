import {
  parseBooleanQuery,
  parsePositiveInteger,
  routeHandler,
} from "@/lib/api-utils";
import { listConclusions } from "@/lib/honcho";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ workspaceId: string }>;
};

export const GET = routeHandler(
  async (request: Request, { params }: RouteContext) => {
    const { workspaceId } = await params;
    const { searchParams } = new URL(request.url);

    const page = parsePositiveInteger(searchParams.get("page"), 1);
    const size = 10;
    const reverse = parseBooleanQuery(searchParams.get("reverse"));

    const observerId = searchParams.get("observer_id")?.trim() || undefined;
    const observedId = searchParams.get("observed_id")?.trim() || undefined;
    const sessionId = searchParams.get("session_id")?.trim() || undefined;

    const conclusionFilters = {
      ...(observerId ? { observer_id: observerId } : {}),
      ...(observedId ? { observed_id: observedId } : {}),
      ...(sessionId ? { session_id: sessionId } : {}),
    };

    const conclusions = await listConclusions(workspaceId, {
      page,
      size,
      reverse,
      filters: conclusionFilters,
    });

    return Response.json(conclusions);
  },
);
