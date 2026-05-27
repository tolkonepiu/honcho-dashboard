import { listQuerySchema } from "@/lib/api-schemas";
import { parseApiQuery, routeHandler } from "@/lib/api-utils";
import { listWorkspaceTableRowsPaginated } from "@/lib/honcho";

export const dynamic = "force-dynamic";

export const GET = routeHandler(async (request: Request) => {
  const { page, reverse, size } = parseApiQuery(request, listQuerySchema);
  const workspaces = await listWorkspaceTableRowsPaginated({
    page,
    reverse,
    size,
  });

  return Response.json(workspaces);
});
