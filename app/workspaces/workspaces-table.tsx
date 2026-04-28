"use client";

import { ClickableTableRow } from "@/components/ui/clickable-table-row";
import { JsonCell } from "@/components/ui/json-cell";
import { PaginatedTableShell } from "@/components/ui/paginated-table-shell";
import { RelativeTime } from "@/components/ui/relative-time";
import { usePaginatedTable } from "@/hooks/use-paginated-table";
import Link from "next/link";

type WorkspaceRow = {
  id: string;
  createdAt: string;
  metadata: Record<string, unknown>;
  configuration: Record<string, unknown>;
  peerCount: number;
  sessionCount: number;
};

type PaginatedWorkspaceData = {
  items: WorkspaceRow[];
  page: number;
  pages: number;
  size: number;
  total: number;
};

type WorkspacesTableProps = {
  initialWorkspaces: PaginatedWorkspaceData;
};

export function WorkspacesTable({ initialWorkspaces }: WorkspacesTableProps) {
  const { data, query, pageSize, pagination, isPending, error, refresh } =
    usePaginatedTable<WorkspaceRow, PaginatedWorkspaceData>({
      initialData: initialWorkspaces,
      apiPath: "/api/workspaces",
      entityName: "workspaces",
    });

  return (
    <PaginatedTableShell
      title="Workspaces"
      titleClassName="text-2xl font-semibold tracking-tight text-[var(--text-primary)]"
      total={data.total}
      isPending={isPending}
      onRefresh={refresh}
      refreshLabel="Refresh workspaces"
      emptyTitle="No workspaces"
      emptyDescription="No workspaces have been created yet."
      error={error}
      theadClassName="ui-table-head tracking-wide"
      headerRow={
        <tr>
          <th scope="col" className="px-4 py-3 font-medium sm:px-6">
            Workspace ID
          </th>
          <th scope="col" className="px-4 py-3 font-medium sm:px-6">
            Created At
          </th>
          <th scope="col" className="px-4 py-3 font-medium sm:px-6">
            Sessions
          </th>
          <th scope="col" className="px-4 py-3 font-medium sm:px-6">
            Peers
          </th>
          <th scope="col" className="px-4 py-3 font-medium sm:px-6">
            Metadata
          </th>
          <th scope="col" className="px-4 py-3 font-medium sm:px-6">
            Configuration
          </th>
        </tr>
      }
      bodyRows={data.items.map((workspace) => {
        const href = `/workspaces/${encodeURIComponent(workspace.id)}`;

        return (
          <ClickableTableRow href={href} key={workspace.id} className="group">
            <td className="px-4 py-3 font-medium text-[var(--text-primary)] sm:px-6">
              <Link
                href={href}
                className="inline-flex rounded-sm underline-offset-2 transition-colors group-hover:text-[var(--color-accent)] hover:underline"
              >
                {workspace.id}
              </Link>
            </td>
            <td className="px-4 py-3 text-[var(--text-muted)] sm:px-6">
              <RelativeTime value={workspace.createdAt} />
            </td>
            <td className="px-4 py-3 text-[var(--text-muted)] sm:px-6">
              {workspace.sessionCount}
            </td>
            <td className="px-4 py-3 text-[var(--text-muted)] sm:px-6">
              {workspace.peerCount}
            </td>
            <td className="px-4 py-3 align-top sm:px-6">
              <JsonCell value={workspace.metadata} />
            </td>
            <td className="px-4 py-3 align-top sm:px-6">
              <JsonCell value={workspace.configuration} />
            </td>
          </ClickableTableRow>
        );
      })}
      page={query.page}
      pages={data.pages}
      pageSize={pageSize}
      onFirst={pagination.onFirst}
      onPrevious={pagination.onPrevious}
      onNext={pagination.onNext}
      onLast={pagination.onLast}
    />
  );
}
