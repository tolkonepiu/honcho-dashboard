"use client";

import { ClickableTableRow } from "@/components/ui/clickable-table-row";
import { JsonCell } from "@/components/ui/json-cell";
import { PaginatedTableShell } from "@/components/ui/paginated-table-shell";
import { RelativeTime } from "@/components/ui/relative-time";
import { usePaginatedTable } from "@/hooks/use-paginated-table";
import Link from "next/link";

type PeerRow = {
  id: string;
  createdAt: string;
  metadata: Record<string, unknown>;
  configuration: Record<string, unknown>;
};

type PeersSectionProps = {
  workspaceId: string;
  initialPeers: PaginatedPeersData;
  peersApiPath?: string;
  peersBasePath?: string;
  title?: string;
  titleClassName?: string;
  emptyStateTitle?: string;
  emptyStateDescription?: string;
  showMetadataColumns?: boolean;
};

type PaginatedPeersData = {
  items: PeerRow[];
  page: number;
  pages: number;
  size: number;
  total: number;
};

export function PeersSection({
  workspaceId,
  initialPeers,
  peersApiPath,
  peersBasePath,
  title,
  titleClassName,
  emptyStateTitle,
  emptyStateDescription,
  showMetadataColumns,
}: PeersSectionProps) {
  const base =
    peersBasePath ?? `/workspaces/${encodeURIComponent(workspaceId)}/peers`;
  const resolvedPeersApiPath =
    peersApiPath ?? `/api/workspaces/${encodeURIComponent(workspaceId)}/peers`;
  const sectionTitle = title ?? "Peers";
  const resolvedEmptyStateTitle = emptyStateTitle ?? "No peers";
  const resolvedEmptyStateDescription =
    emptyStateDescription ?? "This workspace has no peers yet.";
  const { data, query, pageSize, pagination, isPending, error, refresh } =
    usePaginatedTable<PeerRow, PaginatedPeersData>({
      initialData: initialPeers,
      apiPath: resolvedPeersApiPath,
      entityName: "peers",
    });

  return (
    <PaginatedTableShell
      title={sectionTitle}
      titleClassName={titleClassName}
      total={data.total}
      isPending={isPending}
      onRefresh={refresh}
      refreshLabel="Refresh peers"
      emptyTitle={resolvedEmptyStateTitle}
      emptyDescription={resolvedEmptyStateDescription}
      error={error}
      theadClassName="ui-table-head tracking-wide"
      headerRow={
        <tr>
          <th scope="col" className="px-4 py-3 font-medium sm:px-6">
            Peer ID
          </th>
          <th scope="col" className="px-4 py-3 font-medium sm:px-6">
            Created At
          </th>
          {showMetadataColumns ? (
            <>
              <th scope="col" className="px-4 py-3 font-medium sm:px-6">
                Metadata
              </th>
              <th scope="col" className="px-4 py-3 font-medium sm:px-6">
                Configuration
              </th>
            </>
          ) : null}
        </tr>
      }
      bodyRows={data.items.map((peer) => {
        const href = `${base}/${encodeURIComponent(peer.id)}`;

        return (
          <ClickableTableRow href={href} key={peer.id} className="group">
            <td className="px-4 py-3 font-medium text-[var(--text-primary)] sm:px-6">
              <Link
                href={href}
                className="inline-flex rounded-sm underline-offset-2 transition-colors group-hover:text-[var(--color-accent)] hover:underline"
              >
                {peer.id}
              </Link>
            </td>
            <td className="px-4 py-3 text-[var(--text-muted)] sm:px-6">
              <RelativeTime value={peer.createdAt} />
            </td>
            {showMetadataColumns ? (
              <>
                <td className="px-4 py-3 align-top sm:px-6">
                  <JsonCell value={peer.metadata} />
                </td>
                <td className="px-4 py-3 align-top sm:px-6">
                  <JsonCell value={peer.configuration} />
                </td>
              </>
            ) : null}
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
