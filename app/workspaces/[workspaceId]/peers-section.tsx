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
  const [query, setQuery] = useState({ page: initialPeers.page });
  const [peers, setPeers] = useState(initialPeers);

  const base =
    peersBasePath ?? `/workspaces/${encodeURIComponent(workspaceId)}/peers`;
  const resolvedPeersApiPath =
    peersApiPath ?? `/api/workspaces/${encodeURIComponent(workspaceId)}/peers`;
  const sectionTitle = title ?? "Peers";
  const resolvedEmptyStateTitle = emptyStateTitle ?? "No peers";
  const resolvedEmptyStateDescription =
    emptyStateDescription ?? "This workspace has no peers yet.";
  const pageSize = peers.size || 10;
  const pagination = usePagination(setQuery, peers.pages);

  const buildPeersUrl = useCallback(
    (refreshNonce: number) => {
      const params = new URLSearchParams();
      params.set("page", String(query.page));
      params.set("size", String(pageSize));
      if (refreshNonce > 0) {
        params.set("refresh", String(refreshNonce));
      }

      return `${resolvedPeersApiPath}?${params.toString()}`;
    },
    [pageSize, query, resolvedPeersApiPath],
  );

  const {
    isPending,
    error,
    refresh: refreshPeers,
  } = usePaginatedFetch<PaginatedPeersData>({
    entityName: "peers",
    buildUrl: buildPeersUrl,
    setData: setPeers,
  });

  return (
    <DataSection
      title={sectionTitle}
      titleClassName={titleClassName}
      total={peers.total}
      isPending={isPending}
      onRefresh={refreshPeers}
      refreshLabel="Refresh peers"
      emptyTitle={resolvedEmptyStateTitle}
      emptyDescription={resolvedEmptyStateDescription}
      error={error}
    >
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-ctp-crust/90 text-xs uppercase tracking-wide text-ctp-subtext0">
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
          </thead>

          <tbody className="divide-y divide-ctp-surface0">
            {peers.items.map((peer) => {
              const href = `${base}/${encodeURIComponent(peer.id)}`;

              return (
                <ClickableTableRow href={href} key={peer.id} className="group">
                  <td className="px-4 py-3 font-medium text-ctp-text sm:px-6">
                    <Link
                      href={href}
                      className="inline-flex rounded-sm underline-offset-2 transition-colors group-hover:text-ctp-lavender hover:underline"
                    >
                      {peer.id}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-ctp-subtext0 sm:px-6">
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
          </tbody>
        </table>
      </div>

      <TablePager
        page={query.page}
        pages={peers.pages}
        size={pageSize}
        total={peers.total}
        isPending={isPending}
        onFirst={pagination.onFirst}
        onPrevious={pagination.onPrevious}
        onNext={pagination.onNext}
        onLast={pagination.onLast}
      />
    </DataSection>
  );
}
