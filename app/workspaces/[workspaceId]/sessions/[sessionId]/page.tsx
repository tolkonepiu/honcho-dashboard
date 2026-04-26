import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { HonchoErrorState } from "@/components/ui/honcho-error-state";
import { JsonPanel } from "@/components/ui/json-panel";
import { PageHeaderActions } from "@/components/ui/page-header-actions";
import { RelativeTime } from "@/components/ui/relative-time";
import { StatCard } from "@/components/ui/stat-card";
import {
  type DashboardMessage,
  type DashboardPeer,
  type DashboardSession,
  getSession,
  getSessionPeers,
  listMessagesPaginated,
  type PaginatedResult,
} from "@/lib/honcho";
import { isHonchoAppError } from "@/lib/honcho-errors";
import { MessagesSection } from "./messages-section";
import { SessionPeersSection } from "./session-peers-section";

type Props = {
  params: Promise<{ workspaceId: string; sessionId: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { sessionId } = await params;
  return { title: sessionId };
}

export default async function SessionDetailPage({ params }: Props) {
  const { workspaceId, sessionId } = await params;
  const encodedWorkspaceId = encodeURIComponent(workspaceId);
  const encodedSessionId = encodeURIComponent(sessionId);
  const wsBase = `/workspaces/${encodedWorkspaceId}`;

  let session: DashboardSession | null;
  try {
    session = await getSession(workspaceId, sessionId);
  } catch (error) {
    if (isHonchoAppError(error)) {
      return <HonchoErrorState message={error.message} />;
    }

    throw error;
  }

  if (!session) {
    notFound();
  }

  let initialMessages: PaginatedResult<DashboardMessage>;
  let initialPeers: DashboardPeer[];
  try {
    [initialMessages, initialPeers] = await Promise.all([
      listMessagesPaginated(workspaceId, sessionId, {
        page: 1,
        size: 10,
        reverse: true,
      }),
      getSessionPeers(workspaceId, sessionId),
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
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
            {session.id}
          </h1>
          <p className="text-sm text-[var(--text-muted)]">
            Created <RelativeTime value={session.createdAt} />
          </p>
        </div>

        <PageHeaderActions
          refreshLabel="Refresh session"
          deleteAction={{
            entityId: session.id,
            entityLabel: "Session",
            apiPath: `/api/workspaces/${encodedWorkspaceId}/sessions/${encodedSessionId}`,
            redirectTo: `${wsBase}/sessions`,
          }}
        />
      </div>

      <dl className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Workspace" value={workspaceId} href={wsBase} />
        <StatCard
          label="Status"
          value={
            <Badge variant={session.isActive ? "success" : "neutral"}>
              {session.isActive ? "Active" : "Inactive"}
            </Badge>
          }
        />
        <StatCard
          label="Messages"
          value={initialMessages.total.toLocaleString()}
        />
        <StatCard label="Peers" value={initialPeers.length.toLocaleString()} />
      </dl>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <MessagesSection
            workspaceId={workspaceId}
            sessionId={sessionId}
            peerIds={initialPeers.map((peer) => peer.id)}
            initialMessages={initialMessages}
          />
        </div>

        <div className="space-y-6 lg:col-span-1">
          <SessionPeersSection
            workspaceId={workspaceId}
            sessionId={sessionId}
            initialPeers={initialPeers}
          />
          <JsonPanel title="Metadata" value={session.metadata} />
          <JsonPanel title="Configuration" value={session.configuration} />
        </div>
      </div>
    </div>
  );
}
