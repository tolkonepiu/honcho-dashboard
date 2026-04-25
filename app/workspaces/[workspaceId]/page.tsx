import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { HonchoErrorState } from "@/components/ui/honcho-error-state";
import { PageHeaderActions } from "@/components/ui/page-header-actions";
import { RelativeTime } from "@/components/ui/relative-time";
import { parsePositiveInteger } from "@/lib/api-utils";
import {
  type DashboardConclusion,
  type DashboardPeer,
  type DashboardSession,
  type DashboardWorkspace,
  type PaginatedResult,
  type WorkspaceStats,
  getWorkspace,
  getWorkspaceStats,
  listConclusions,
  listPeers,
  listPeersPaginated,
  listSessions,
  listSessionsPaginated,
} from "@/lib/honcho";
import { isHonchoAppError } from "@/lib/honcho-errors";
import { ConclusionsPanel } from "./conclusions-panel";
import { PeersSection } from "./peers-section";
import { SessionsSection } from "./sessions-section";

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

type StatCardProps = {
  label: string;
  value: number;
  href?: string;
};

function StatCard({ label, value, href }: StatCardProps) {
  const content = (
    <>
      <dt className="text-xs font-medium uppercase tracking-wide text-ctp-subtext0">
        {label}
      </dt>
      <dd className="mt-2 text-3xl font-semibold tracking-tight text-ctp-text">
        {value.toLocaleString()}
      </dd>
    </>
  );

  const classes =
    "rounded-xl border border-ctp-surface0 bg-ctp-mantle p-4 shadow-sm transition-colors";

  if (href) {
    return (
      <Link
        href={href}
        className={`${classes} hover:border-ctp-surface1 hover:bg-ctp-surface0/40`}
      >
        {content}
      </Link>
    );
  }

  return <div className={classes}>{content}</div>;
}

export default async function WorkspaceDetailPage({
  params,
  searchParams,
}: Props) {
  const { workspaceId } = await params;
  const resolvedSearchParams = await searchParams;

  let workspace: DashboardWorkspace | null;
  try {
    workspace = await getWorkspace(workspaceId);
  } catch (error) {
    if (isHonchoAppError(error)) {
      return <HonchoErrorState message={error.message} />;
    }

    throw error;
  }

  if (!workspace) {
    notFound();
  }

  const page = parsePositiveInteger(
    getSingleSearchParam(resolvedSearchParams.page),
    1,
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

  let stats: WorkspaceStats;
  let peers: DashboardPeer[];
  let sessions: DashboardSession[];
  let initialPeers: PaginatedResult<DashboardPeer>;
  let initialSessions: PaginatedResult<DashboardSession>;
  let initialConclusions: PaginatedResult<DashboardConclusion>;

  try {
    [
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
  } catch (error) {
    if (isHonchoAppError(error)) {
      return <HonchoErrorState message={error.message} />;
    }

    throw error;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-ctp-text">
            {workspaceId}
          </h1>
          <p className="text-sm text-ctp-subtext0">
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
          value={stats.peerCount}
          href={`${base}/peers`}
        />
        <StatCard
          label="Sessions"
          value={stats.sessionCount}
          href={`${base}/sessions`}
        />
        <StatCard label="Conclusions" value={stats.conclusionCount} />
      </dl>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="min-h-0 xl:col-span-2">
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

        <div id="workspace-primary-column" className="space-y-6 xl:col-span-1">
          <PeersSection workspaceId={workspaceId} initialPeers={initialPeers} />
          <SessionsSection
            workspaceId={workspaceId}
            initialSessions={initialSessions}
          />
        </div>
      </div>
    </div>
  );
}
