import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { HonchoErrorState } from "@/components/ui/honcho-error-state";
import { PageHeaderActions } from "@/components/ui/page-header-actions";
import { RelativeTime } from "@/components/ui/relative-time";
import {
  type DashboardMessage,
  type DashboardPeer,
  type DashboardSession,
  type PaginatedResult,
  getSession,
  getSessionPeers,
  listMessagesPaginated,
} from "@/lib/honcho";
import { isHonchoAppError } from "@/lib/honcho-errors";
import { MessagesSection } from "./messages-section";
import { SessionPeersSection } from "./session-peers-section";

type Props = {
  params: Promise<{ workspaceId: string; sessionId: string }>;
};

type StatCardProps = {
  label: string;
  value: ReactNode;
  className?: string;
  href?: string;
};

function StatCard({ label, value, className, href }: StatCardProps) {
  const classes = `border-2 border-[var(--pixel-border)] bg-ctp-mantle p-4 shadow-[var(--pixel-shadow-md)]${
    href
      ? " transition-[background-color,border-color,transform] hover:-translate-y-px hover:border-ctp-lavender hover:bg-ctp-surface0"
      : ""
  }${className ? ` ${className}` : ""}`;

  const content = (
    <>
      <dt className="text-xs font-semibold uppercase tracking-[0.06em] text-ctp-subtext0">
        {label}
      </dt>
      <dd className="mt-2 text-xl font-semibold text-ctp-text">
        {value}
      </dd>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    );
  }

  return <div className={classes}>{content}</div>;
}

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
          <h1 className="text-2xl font-semibold tracking-tight text-ctp-text">
            {session.id}
          </h1>
          <p className="text-sm text-ctp-subtext0">
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
          value={session.isActive ? "Active" : "Inactive"}
        />
        <StatCard
          label="Messages"
          value={initialMessages.total.toLocaleString()}
        />
        <StatCard label="Peers" value={initialPeers.length.toLocaleString()} />
        {session.metadata && Object.keys(session.metadata).length > 0 ? (
          <StatCard
            label="Metadata"
            className="sm:col-span-2 xl:col-span-4"
            value={
              <span className="block whitespace-pre-wrap font-mono text-xs font-normal leading-5 text-ctp-subtext1">
                {JSON.stringify(session.metadata, null, 2)}
              </span>
            }
          />
        ) : null}
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
        </div>
      </div>
    </div>
  );
}
