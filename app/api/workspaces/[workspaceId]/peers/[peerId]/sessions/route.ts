import {
  nonEmptyStringField,
  pageQueryField,
  sizeQueryField,
} from "@/lib/api-schemas";
import { parseApiInput, parseApiQuery, routeHandler } from "@/lib/api-utils";
import { listPeerSessionsPaginated } from "@/lib/honcho";
import { z } from "zod";

export const dynamic = "force-dynamic";

const peerSessionsRouteParamsSchema = z.object({
  workspaceId: nonEmptyStringField,
  peerId: nonEmptyStringField,
});

const peerSessionsQuerySchema = z.object({
  page: pageQueryField,
  size: sizeQueryField,
});

type RouteContext = {
  params: Promise<{ workspaceId: string; peerId: string }>;
};

export const GET = routeHandler(
  async (request: Request, { params }: RouteContext) => {
    const { workspaceId, peerId } = parseApiInput(
      await params,
      peerSessionsRouteParamsSchema,
    );
    const { page, size } = parseApiQuery(request, peerSessionsQuerySchema);
    const sessions = await listPeerSessionsPaginated(workspaceId, peerId, {
      page,
      size,
    });

    return Response.json(sessions);
  },
);
