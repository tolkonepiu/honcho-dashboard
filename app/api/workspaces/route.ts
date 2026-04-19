import { parsePositiveInteger, routeHandler } from "@/lib/api-utils";
import { listWorkspaceTableRowsPaginated } from "@/lib/honcho";

export const dynamic = "force-dynamic";

export const GET = routeHandler(async (request: Request) => {
  const { searchParams } = new URL(request.url);

  const page = parsePositiveInteger(searchParams.get("page"), 1);
  const size = parsePositiveInteger(searchParams.get("size"), 10, 100);
  const workspaces = await listWorkspaceTableRowsPaginated({ page, size });

  return Response.json(workspaces);
});
