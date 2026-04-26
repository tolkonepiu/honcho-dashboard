"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { ClickableTableRow } from "@/components/ui/clickable-table-row";
import { DataSection } from "@/components/ui/data-section";
import { JsonCell } from "@/components/ui/json-cell";
import { RelativeTime } from "@/components/ui/relative-time";
import { TablePager } from "@/components/ui/table-controls";
import { usePaginatedFetch } from "@/hooks/use-paginated-fetch";
import { usePagination } from "@/hooks/use-pagination";

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
  const [query, setQuery] = useState({ page: initialWorkspaces.page });
  const [workspaces, setWorkspaces] = useState(initialWorkspaces);
  const pageSize = workspaces.size || 10;
  const pagination = usePagination(setQuery, workspaces.pages);

  const buildWorkspacesUrl = useCallback(
    (refreshNonce: number) => {
      const params = new URLSearchParams();
      params.set("page", String(query.page));
      params.set("size", String(pageSize));
      if (refreshNonce > 0) {
        params.set("refresh", String(refreshNonce));
      }

      return `/api/workspaces?${params.toString()}`;
    },
    [pageSize, query],
  );

  const {
    isPending,
    error,
    refresh: refreshWorkspaces,
  } = usePaginatedFetch<PaginatedWorkspaceData>({
    entityName: "workspaces",
    buildUrl: buildWorkspacesUrl,
    setData: setWorkspaces,
  });

  return (
    <DataSection
      title="Workspaces"
      titleClassName="text-2xl font-semibold tracking-tight text-ctp-text"
      total={workspaces.total}
      isPending={isPending}
      onRefresh={refreshWorkspaces}
      refreshLabel="Refresh workspaces"
      emptyTitle="No workspaces"
      emptyDescription="No workspaces have been created yet."
      error={error}
    >
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-ctp-crust/90 text-xs uppercase tracking-wide text-ctp-subtext0">
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
          </thead>
          <tbody className="divide-y divide-ctp-surface0">
            {workspaces.items.map((workspace) => {
              const href = `/workspaces/${encodeURIComponent(workspace.id)}`;

              return (
                <ClickableTableRow
                  href={href}
                  key={workspace.id}
                  className="group"
                >
                  <td className="px-4 py-3 font-medium text-ctp-text sm:px-6">
                    <Link
                      href={href}
                      className="inline-flex rounded-sm underline-offset-2 transition-colors group-hover:text-ctp-lavender hover:underline"
                    >
                      {workspace.id}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-ctp-subtext0 sm:px-6">
                    <RelativeTime value={workspace.createdAt} />
                  </td>
                  <td className="px-4 py-3 text-ctp-subtext0 sm:px-6">
                    {workspace.sessionCount}
                  </td>
                  <td className="px-4 py-3 text-ctp-subtext0 sm:px-6">
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
          </tbody>
        </table>
      </div>

      <TablePager
        page={query.page}
        pages={workspaces.pages}
        size={pageSize}
        total={workspaces.total}
        isPending={isPending}
        onFirst={pagination.onFirst}
        onPrevious={pagination.onPrevious}
        onNext={pagination.onNext}
        onLast={pagination.onLast}
      />
    </DataSection>
  );
}
