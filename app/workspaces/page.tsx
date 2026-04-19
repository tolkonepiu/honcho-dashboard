import type { Metadata } from "next";
import {
  type DashboardWorkspaceTableRow,
  type PaginatedResult,
  listWorkspaceTableRowsPaginated,
} from "@/lib/honcho";
import { isHonchoAppError } from "@/lib/honcho-errors";
import { HonchoErrorState } from "@/components/ui/honcho-error-state";
import { WorkspacesTable } from "./workspaces-table";

export const metadata: Metadata = { title: "Workspaces" };

export default async function WorkspacesPage() {
  let initialWorkspaces: PaginatedResult<DashboardWorkspaceTableRow>;

  try {
    initialWorkspaces = await listWorkspaceTableRowsPaginated({
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
        Workspaces
      </h1>

      <WorkspacesTable initialWorkspaces={initialWorkspaces} />
    </div>
  );
}
