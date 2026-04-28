import { SessionsSection } from "../sessions-section";
import {
  type DashboardSession,
  type PaginatedResult,
  getWorkspace,
  listSessionsPaginated,
} from "@/lib/honcho";
import { loadHonchoPageData, loadHonchoPageEntity } from "@/lib/page-data";
import type { Metadata } from "next";

type Props = { params: Promise<{ workspaceId: string }> };

export const metadata: Metadata = { title: "Sessions" };

export default async function SessionsPage({ params }: Props) {
  const { workspaceId } = await params;

  const workspaceResult = await loadHonchoPageEntity(() =>
    getWorkspace(workspaceId),
  );
  if (workspaceResult.errorElement) {
    return workspaceResult.errorElement;
  }

  const initialSessionsResult = await loadHonchoPageData<
    PaginatedResult<DashboardSession>
  >(() =>
    listSessionsPaginated(workspaceId, {
      page: 1,
      size: 10,
    }),
  );
  if (initialSessionsResult.errorElement) {
    return initialSessionsResult.errorElement;
  }

  const initialSessions = initialSessionsResult.data;

  return (
    <div className="space-y-6">
      <SessionsSection
        workspaceId={workspaceId}
        initialSessions={initialSessions}
        titleClassName="text-2xl font-semibold tracking-tight text-[var(--text-primary)]"
        showMetadataColumns
      />
    </div>
  );
}
