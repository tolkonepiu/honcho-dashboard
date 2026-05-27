import { PeersSection } from "../peers-section";
import type { DashboardPeer, PaginatedResult } from "@/lib/dashboard-types";
import { getWorkspace, listPeersPaginated } from "@/lib/honcho";
import { loadHonchoPageData, loadHonchoPageEntity } from "@/lib/page-data";
import type { Metadata } from "next";

type Props = { params: Promise<{ workspaceId: string }> };

export const metadata: Metadata = { title: "Peers" };

export default async function PeersPage({ params }: Props) {
  const { workspaceId } = await params;

  const workspaceResult = await loadHonchoPageEntity(() =>
    getWorkspace(workspaceId),
  );
  if (workspaceResult.errorElement) {
    return workspaceResult.errorElement;
  }

  const initialPeersResult = await loadHonchoPageData<
    PaginatedResult<DashboardPeer>
  >(() => listPeersPaginated(workspaceId));
  if (initialPeersResult.errorElement) {
    return initialPeersResult.errorElement;
  }

  const initialPeers = initialPeersResult.data;

  return (
    <div className="space-y-6">
      <PeersSection
        workspaceId={workspaceId}
        initialPeers={initialPeers}
        titleClassName="text-2xl font-semibold tracking-tight text-[var(--text-primary)]"
        showMetadataColumns
      />
    </div>
  );
}
