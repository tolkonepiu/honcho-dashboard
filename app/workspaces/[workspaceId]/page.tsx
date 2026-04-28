import { ConclusionsPanel } from "./conclusions-panel";
import { PeersSection } from "./peers-section";
import { SessionsSection } from "./sessions-section";
import { JsonPanel } from "@/components/ui/json-panel";
import { PageHeaderActions } from "@/components/ui/page-header-actions";
import { RelativeTime } from "@/components/ui/relative-time";
import { StatCard } from "@/components/ui/stat-card";
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
import type { Metadata } from "next";
import { z } from "zod";

const workspacePageSearchParamSchema = z.coerce.number().int().min(1).catch(1);

type SearchParams = Promise<{
  page?: string | string[];
  reverse?: string | string[];
  observer_id?: string | string[];
  observed_id?: string | string[];
  session_id?: string | string[];
}>;

type Props = {
  params: Promise<{ workspaceId: string }>;
  searchParams: SearchParams;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { workspaceId } = await params;
  return { title: workspaceId };
}

function getSingleSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function WorkspaceDetailPage({
  params,
  searchParams,
}: Props) {
  const { workspaceId } = await params;
  const resolvedSearchParams = await searchParams;

  const workspaceResult = await loadHonchoPageEntity(() =>
    getWorkspace(workspaceId),
  );
  if (workspaceResult.errorElement) {
    return workspaceResult.errorElement;
  }

  const workspace = workspaceResult.data;

  const page = workspacePageSearchParamSchema.parse(
    getSingleSearchParam(resolvedSearchParams.page),
  );
  const reverseParam = getSingleSearchParam(resolvedSearchParams.reverse);
  const reverse = reverseParam === "true";

  const observerId = getSingleSearchParam(
    resolvedSearchParams.observer_id,
  )?.trim();
  const observedId = getSingleSearchParam(
    resolvedSearchParams.observed_id,
  )?.trim();
  const sessionId = getSingleSearchParam(
    resolvedSearchParams.session_id,
  )?.trim();

  const conclusionFilters = {
    ...(observerId ? { observer_id: observerId } : {}),
    ...(observedId ? { observed_id: observedId } : {}),
    ...(sessionId ? { session_id: sessionId } : {}),
  };

  const encodedWorkspaceId = encodeURIComponent(workspaceId);
  const base = `/workspaces/${encodedWorkspaceId}`;

  const workspaceDataResult = await loadHonchoPageData<{
    stats: WorkspaceStats;
    peers: DashboardPeer[];
    sessions: DashboardSession[];
    initialPeers: PaginatedResult<DashboardPeer>;
    initialSessions: PaginatedResult<DashboardSession>;
    initialConclusions: PaginatedResult<DashboardConclusion>;
  }>(async () => {
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
        page,
        size: 10,
        reverse,
        filters: conclusionFilters,
      }),
    ]);

    return {
      stats,
      peers,
      sessions,
      initialPeers,
      initialSessions,
      initialConclusions,
    };
  });
  if (workspaceDataResult.errorElement) {
    return workspaceDataResult.errorElement;
  }

  const {
    stats,
    peers,
    sessions,
    initialPeers,
    initialSessions,
    initialConclusions,
  } = workspaceDataResult.data;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <h1 className="text-2xl font-semibold tracking-[0.05em] text-[var(--text-primary)] uppercase">
            {workspaceId}
          </h1>
          <p className="text-sm text-[var(--text-muted)]">
            Created <RelativeTime value={workspace.createdAt} />
          </p>
        </div>

        <PageHeaderActions
          refreshLabel="Refresh workspace"
          deleteAction={{
            entityId: workspaceId,
            entityLabel: "Workspace",
            apiPath: `/api/workspaces/${encodedWorkspaceId}`,
            redirectTo: "/workspaces",
          }}
        />
      </div>

      <dl className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Peers"
          value={stats.peerCount.toLocaleString()}
          valueClassName="text-3xl uppercase tracking-[0.04em]"
          href={`${base}/peers`}
        />
        <StatCard
          label="Sessions"
          value={stats.sessionCount.toLocaleString()}
          valueClassName="text-3xl uppercase tracking-[0.04em]"
          href={`${base}/sessions`}
        />
        <StatCard
          label="Conclusions"
          value={stats.conclusionCount.toLocaleString()}
          valueClassName="text-3xl uppercase tracking-[0.04em]"
        />
      </dl>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="min-h-0 lg:col-span-2">
          <ConclusionsPanel
            workspaceId={workspaceId}
            peerIds={peers.map((peer) => peer.id)}
            sessionIds={sessions.map((session) => session.id)}
            initialQuery={{
              page,
              reverse,
              observerId,
              observedId,
              sessionId,
            }}
            initialConclusions={initialConclusions}
          />
        </div>

        <div id="workspace-primary-column" className="space-y-6 lg:col-span-1">
          <PeersSection workspaceId={workspaceId} initialPeers={initialPeers} />
          <SessionsSection
            workspaceId={workspaceId}
            initialSessions={initialSessions}
          />
          <JsonPanel title="Metadata" value={workspace.metadata} />
          <JsonPanel title="Configuration" value={workspace.configuration} />
        </div>
      </div>
    </div>
  );
}
