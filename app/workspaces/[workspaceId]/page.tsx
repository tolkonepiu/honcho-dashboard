import { ConclusionsPanel } from "./conclusions-panel";
import { PeersSection } from "./peers-section";
import { SessionsSection } from "./sessions-section";
import {
  loadWorkspaceDetailPageData,
  type WorkspaceDetailSearchParams,
} from "./workspace-detail-page-data";
import { JsonPanel } from "@/components/ui/json-panel";
import { PageHeaderActions } from "@/components/ui/page-header-actions";
import { RelativeTime } from "@/components/ui/relative-time";
import { StatCard } from "@/components/ui/stat-card";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ workspaceId: string }>;
  searchParams: WorkspaceDetailSearchParams;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { workspaceId } = await params;
  return { title: workspaceId };
}

export default async function WorkspaceDetailPage({
  params,
  searchParams,
}: Props) {
  const { workspaceId } = await params;

  const workspacePageDataResult = await loadWorkspaceDetailPageData(
    workspaceId,
    searchParams,
  );
  if (workspacePageDataResult.errorElement) {
    return workspacePageDataResult.errorElement;
  }

  const {
    workspace,
    stats,
    peers,
    sessions,
    initialPeers,
    initialSessions,
    initialConclusions,
    initialQuery,
  } = workspacePageDataResult.data;

  const encodedWorkspaceId = encodeURIComponent(workspaceId);
  const base = `/workspaces/${encodedWorkspaceId}`;

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
            initialQuery={initialQuery}
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
