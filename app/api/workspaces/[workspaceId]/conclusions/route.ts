import {
  nonEmptyStringField,
  optionalNonEmptyStringField,
  pageQueryField,
  reverseQueryField,
  sizeQueryField,
} from "@/lib/api-schemas";
import { parseApiInput, parseApiQuery, routeHandler } from "@/lib/api-utils";
import { listConclusions } from "@/lib/honcho";
import { z } from "zod";

export const dynamic = "force-dynamic";

const conclusionsRouteParamsSchema = z.object({
  workspaceId: nonEmptyStringField,
});

const conclusionsQuerySchema = z
  .object({
    page: pageQueryField,
    size: sizeQueryField,
    reverse: reverseQueryField,
    observer_id: optionalNonEmptyStringField,
    observed_id: optionalNonEmptyStringField,
    session_id: optionalNonEmptyStringField,
  })
  .transform(({ observer_id, observed_id, session_id, ...pagination }) => ({
    ...pagination,
    filters: {
      ...(observer_id ? { observer_id } : {}),
      ...(observed_id ? { observed_id } : {}),
      ...(session_id ? { session_id } : {}),
    },
  }));

type RouteContext = {
  params: Promise<{ workspaceId: string }>;
};

export const GET = routeHandler(
  async (request: Request, { params }: RouteContext) => {
    const { workspaceId } = parseApiInput(
      await params,
      conclusionsRouteParamsSchema,
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
