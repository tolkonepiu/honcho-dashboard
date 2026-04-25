import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { HonchoErrorState } from "@/components/ui/honcho-error-state";
import { PageHeaderActions } from "@/components/ui/page-header-actions";
import { RelativeTime } from "@/components/ui/relative-time";
import {
  type DashboardPeer,
  type DashboardSession,
  type PaginatedResult,
  getPeer,
  getPeerCard,
  listPeerSessionsPaginated,
} from "@/lib/honcho";
import { isHonchoAppError } from "@/lib/honcho-errors";
import { SessionsSection } from "../../sessions-section";
import { PeerCardSection } from "./peer-card-section";

type Props = { params: Promise<{ workspaceId: string; peerId: string }> };

type StatCardProps = {
  label: string;
  value: ReactNode;
  className?: string;
  href?: string;
};

function StatCard({ label, value, className, href }: StatCardProps) {
  const classes = `rounded-xl border border-ctp-surface0 bg-ctp-mantle p-4 shadow-sm${
    href
      ? " transition-colors hover:border-ctp-surface1 hover:bg-ctp-surface0/40"
      : ""
  }${className ? ` ${className}` : ""}`;

  const content = (
    <>
      <dt className="text-xs font-medium uppercase tracking-wide text-ctp-subtext0">
        {label}
      </dt>
      <dd className="mt-2 text-xl font-semibold tracking-tight text-ctp-text">
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
  const { peerId } = await params;
  return { title: peerId };
}

export default async function PeerDetailPage({ params }: Props) {
  const { workspaceId, peerId } = await params;
  let peer: DashboardPeer | null;
  try {
    peer = await getPeer(workspaceId, peerId);
  } catch (error) {
    if (isHonchoAppError(error)) {
      return <HonchoErrorState message={error.message} />;
    }

    throw error;
  }

  if (!peer) {
    notFound();
  }

  let peerCard: string[] | null;
  let peerSessions: PaginatedResult<DashboardSession>;
  try {
    [peerCard, peerSessions] = await Promise.all([
      getPeerCard(workspaceId, peerId),
      listPeerSessionsPaginated(workspaceId, peerId, { page: 1, size: 10 }),
    ]);
  } catch (error) {
    if (isHonchoAppError(error)) {
      return <HonchoErrorState message={error.message} />;
    }

    throw error;
  }

  const wsBase = `/workspaces/${encodeURIComponent(workspaceId)}`;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-ctp-text">
            {peer.id}
          </h1>
          <p className="text-sm text-ctp-subtext0">
            Created <RelativeTime value={peer.createdAt} />
          </p>
        </div>

        <PageHeaderActions refreshLabel="Refresh peer" />
      </div>

      <dl className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Workspace" value={workspaceId} href={wsBase} />
        <StatCard
          label="Sessions"
          value={peerSessions.total.toLocaleString()}
        />
        <StatCard
          label="Card Entries"
          value={(peerCard?.length ?? 0).toLocaleString()}
        />
        {peer.metadata && Object.keys(peer.metadata).length > 0 ? (
          <StatCard
            label="Metadata"
            className="sm:col-span-2 xl:col-span-3"
            value={
              <span className="block whitespace-pre-wrap font-mono text-xs font-normal leading-5 text-ctp-subtext1">
                {JSON.stringify(peer.metadata, null, 2)}
              </span>
            }
          />
        ) : null}
      </dl>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <PeerCardSection
            workspaceId={workspaceId}
            peerId={peerId}
            initialCard={peerCard}
          />
        </div>

        <div className="space-y-6 lg:col-span-1">
          <SessionsSection
            workspaceId={workspaceId}
            initialSessions={peerSessions}
            sessionsApiPath={`/api/workspaces/${encodeURIComponent(workspaceId)}/peers/${encodeURIComponent(peerId)}/sessions`}
            sessionsBasePath={`${wsBase}/sessions`}
            title="Sessions"
            emptyStateTitle="No sessions"
            emptyStateDescription="This peer has no sessions yet."
          />
        </div>
      </div>
    </div>
  );
}
