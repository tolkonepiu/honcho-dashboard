import {
  type DashboardConclusion,
  type DashboardPeer,
  type DashboardSession,
  getWorkspace,
  getWorkspaceStats,
  listConclusions,
  listPeers,
  listPeersPaginated,
  listSessions,
  listSessionsPaginated,
  type PaginatedResult,
  type WorkspaceStats,
} from "@/lib/honcho";
import { loadHonchoPageData, loadHonchoPageEntity } from "@/lib/page-data";
import { z } from "zod";

const workspacePageSearchParamSchema = z.coerce.number().int().min(1).catch(1);

type WorkspaceDetailSearchParams = Promise<{
  page?: string | string[];
  reverse?: string | string[];
  observer_id?: string | string[];
  observed_id?: string | string[];
  session_id?: string | string[];
}>;

type WorkspaceConclusionQuery = {
  page: number;
  reverse: boolean;
  observerId?: string;
  observedId?: string;
  sessionId?: string;
};

type WorkspaceDetailPageData = {
  workspace: Awaited<ReturnType<typeof getWorkspace>> extends infer T | null
    ? T
    : never;
  stats: WorkspaceStats;
  peers: DashboardPeer[];
  sessions: DashboardSession[];
  initialPeers: PaginatedResult<DashboardPeer>;
  initialSessions: PaginatedResult<DashboardSession>;
  initialConclusions: PaginatedResult<DashboardConclusion>;
  initialQuery: WorkspaceConclusionQuery;
};

function getSingleSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function parseWorkspaceConclusionQuery(
  searchParams: Awaited<WorkspaceDetailSearchParams>,
): WorkspaceConclusionQuery {
  const page = workspacePageSearchParamSchema.parse(
    getSingleSearchParam(searchParams.page),
  );
  const reverse = getSingleSearchParam(searchParams.reverse) === "true";

  return {
    page,
    reverse,
    observerId: getSingleSearchParam(searchParams.observer_id)?.trim(),
    observedId: getSingleSearchParam(searchParams.observed_id)?.trim(),
    sessionId: getSingleSearchParam(searchParams.session_id)?.trim(),
  };
}

function buildConclusionFilters(query: WorkspaceConclusionQuery) {
  return {
    ...(query.observerId ? { observer_id: query.observerId } : {}),
    ...(query.observedId ? { observed_id: query.observedId } : {}),
    ...(query.sessionId ? { session_id: query.sessionId } : {}),
  };
}

export async function loadWorkspaceDetailPageData(
  workspaceId: string,
  searchParams: WorkspaceDetailSearchParams,
) {
  const resolvedSearchParams = await searchParams;
  const initialQuery = parseWorkspaceConclusionQuery(resolvedSearchParams);

  const workspaceResult = await loadHonchoPageEntity(() =>
    getWorkspace(workspaceId),
  );
  if (workspaceResult.errorElement) {
    return workspaceResult;
  }

  const filters = buildConclusionFilters(initialQuery);

  const workspaceDataResult = await loadHonchoPageData<WorkspaceDetailPageData>(
    async () => {
      const [
        stats,
        peers,
        sessions,
        initialPeers,
        initialSessions,
        initialConclusions,
      ] = await Promise.all([
        getWorkspaceStats(workspaceId),
        listPeers(workspaceId),
        listSessions(workspaceId),
        listPeersPaginated(workspaceId, { page: 1, size: 10 }),
        listSessionsPaginated(workspaceId, { page: 1, size: 10 }),
        listConclusions(workspaceId, {
          page: initialQuery.page,
          size: 10,
          reverse: initialQuery.reverse,
          filters,
        }),
      ]);

      return {
        workspace: workspaceResult.data,
        stats,
        peers,
        sessions,
        initialPeers,
        initialSessions,
        initialConclusions,
        initialQuery,
      };
    },
  );

  return workspaceDataResult;
}

export type { WorkspaceDetailPageData, WorkspaceDetailSearchParams };
