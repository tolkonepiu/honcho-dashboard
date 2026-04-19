import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HonchoErrorState } from "@/components/ui/honcho-error-state";
import {
  type DashboardPeer,
  type DashboardWorkspace,
  type PaginatedResult,
  getWorkspace,
  listPeersPaginated,
} from "@/lib/honcho";
import { isHonchoAppError } from "@/lib/honcho-errors";
import { PeersSection } from "../peers-section";

type Props = { params: Promise<{ workspaceId: string }> };

export const metadata: Metadata = { title: "Peers" };

export default async function PeersPage({ params }: Props) {
  const { workspaceId } = await params;

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

  let initialPeers: PaginatedResult<DashboardPeer>;
  try {
    initialPeers = await listPeersPaginated(workspaceId, {
      page: 1,
      size: 10,
    });
  } catch (error) {
    if (isHonchoAppError(error)) {
      return <HonchoErrorState message={error.message} />;
    }

    throw error;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight text-ctp-text">
        Peers
      </h1>

      <PeersSection
        workspaceId={workspaceId}
        initialPeers={initialPeers}
        showMetadataColumns
      />
    </div>
  );
}
