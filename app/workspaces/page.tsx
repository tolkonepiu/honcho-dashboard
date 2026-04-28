import { WorkspacesTable } from "./workspaces-table";
import {
  type DashboardWorkspaceTableRow,
  type PaginatedResult,
  listWorkspaceTableRowsPaginated,
} from "@/lib/honcho";
import { loadHonchoPageData } from "@/lib/page-data";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Workspaces" };

export default async function WorkspacesPage() {
  const initialWorkspacesResult = await loadHonchoPageData<
    PaginatedResult<DashboardWorkspaceTableRow>
  >(() =>
    listWorkspaceTableRowsPaginated({
      page: 1,
      size: 10,
    }),
  );

  if (initialWorkspacesResult.errorElement) {
    return initialWorkspacesResult.errorElement;
  }

  const initialWorkspaces = initialWorkspacesResult.data;

  return (
    <div className="space-y-6">
      <WorkspacesTable initialWorkspaces={initialWorkspaces} />
    </div>
  );
}
