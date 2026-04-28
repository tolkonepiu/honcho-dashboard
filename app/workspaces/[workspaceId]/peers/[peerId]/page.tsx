import { SessionsSection } from "../../sessions-section";
import { PeerCardSection } from "./peer-card-section";
import { JsonPanel } from "@/components/ui/json-panel";
import { PageHeaderActions } from "@/components/ui/page-header-actions";
import { RelativeTime } from "@/components/ui/relative-time";
import { StatCard } from "@/components/ui/stat-card";
import {
  type DashboardSession,
  getPeer,
  getPeerCard,
  listPeerSessionsPaginated,
  type PaginatedResult,
} from "@/lib/honcho";
import { loadHonchoPageData, loadHonchoPageEntity } from "@/lib/page-data";
import type { Metadata } from "next";

type Props = { params: Promise<{ workspaceId: string; peerId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { peerId } = await params;
  return { title: peerId };
}

export default async function PeerDetailPage({ params }: Props) {
  const { workspaceId, peerId } = await params;
  const peerResult = await loadHonchoPageEntity(() =>
    getPeer(workspaceId, peerId),
  );
  if (peerResult.errorElement) {
    return peerResult.errorElement;
  }

  const peer = peerResult.data;

  const peerDataResult = await loadHonchoPageData<{
    peerCard: string[] | null;
    peerSessions: PaginatedResult<DashboardSession>;
  }>(async () => {
    const [peerCard, peerSessions] = await Promise.all([
      getPeerCard(workspaceId, peerId),
      listPeerSessionsPaginated(workspaceId, peerId, { page: 1, size: 10 }),
    ]);

    return { peerCard, peerSessions };
  });
  if (peerDataResult.errorElement) {
    return peerDataResult.errorElement;
  }

  const { peerCard, peerSessions } = peerDataResult.data;

  const wsBase = `/workspaces/${encodeURIComponent(workspaceId)}`;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
            {peer.id}
          </h1>
          <p className="text-sm text-[var(--text-muted)]">
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
          <JsonPanel title="Metadata" value={peer.metadata} />
          <JsonPanel title="Configuration" value={peer.configuration} />
        </div>
      </div>
    </div>
  );
}
