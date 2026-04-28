import { paginationQuerySchema } from "@/lib/api-schemas";
import { parseApiQuery, routeHandler } from "@/lib/api-utils";
import { listWorkspaceTableRowsPaginated } from "@/lib/honcho";

export const dynamic = "force-dynamic";

export const GET = routeHandler(async (request: Request) => {
  const { page, size } = parseApiQuery(request, paginationQuerySchema);
  const workspaces = await listWorkspaceTableRowsPaginated({ page, size });

  return Response.json(workspaces);
});
