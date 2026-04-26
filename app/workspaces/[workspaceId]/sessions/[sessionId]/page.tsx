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

type StatCardProps = {
  label: string;
  value: ReactNode;
  className?: string;
  href?: string;
};

type JsonPanelProps = {
  title: string;
  value: Record<string, unknown>;
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
      <dd className="mt-2 text-xl font-semibold text-ctp-text">{value}</dd>
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

function JsonPanel({ title, value }: JsonPanelProps) {
  if (Object.keys(value).length === 0) {
    return null;
  }

  return (
    <section className="space-y-3">
      <h2 className="text-xs font-semibold uppercase tracking-[0.06em] text-ctp-subtext0">
        {title}
      </h2>

      <div className="overflow-hidden border-2 border-[var(--pixel-border)] bg-ctp-mantle shadow-[var(--pixel-shadow-md)]">
        <pre className="overflow-x-auto whitespace-pre-wrap break-words p-4 font-mono text-xs leading-5 text-ctp-subtext1 sm:px-6">
          {JSON.stringify(value, null, 2)}
        </pre>
      </div>
    </section>
  );
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
          value={
            <span
              className={`inline-flex whitespace-nowrap border px-2 py-0.5 text-xs font-semibold uppercase tracking-[0.04em] shadow-[var(--pixel-shadow-sm)] ${
                session.isActive
                  ? "border-ctp-green/70 bg-ctp-green/20 text-ctp-green"
                  : "border-[var(--pixel-border)] bg-ctp-crust text-ctp-subtext0"
              }`}
            >
              {session.isActive ? "Active" : "Inactive"}
            </span>
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
