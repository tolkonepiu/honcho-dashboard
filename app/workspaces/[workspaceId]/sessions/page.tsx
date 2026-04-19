import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HonchoErrorState } from "@/components/ui/honcho-error-state";
import {
  type DashboardSession,
  type DashboardWorkspace,
  type PaginatedResult,
  getWorkspace,
  listSessionsPaginated,
} from "@/lib/honcho";
import { isHonchoAppError } from "@/lib/honcho-errors";
import { SessionsSection } from "../sessions-section";

type Props = { params: Promise<{ workspaceId: string }> };

export const metadata: Metadata = { title: "Sessions" };

export default async function SessionsPage({ params }: Props) {
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

  let initialSessions: PaginatedResult<DashboardSession>;
  try {
    initialSessions = await listSessionsPaginated(workspaceId, {
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
        Sessions
      </h1>

      <SessionsSection
        workspaceId={workspaceId}
        initialSessions={initialSessions}
        showMetadataColumn
      />
    </div>
  );
}
