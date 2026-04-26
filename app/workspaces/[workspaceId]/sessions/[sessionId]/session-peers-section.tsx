"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { ClickableTableRow } from "@/components/ui/clickable-table-row";
import { EmptyState } from "@/components/ui/empty-state";
import { RelativeTime } from "@/components/ui/relative-time";
import { TablePager, TableRefreshButton } from "@/components/ui/table-controls";
import { usePageRefreshSignal } from "@/hooks/use-page-refresh-signal";
import { getApiErrorMessage } from "@/lib/api-client";

type SessionPeer = {
  id: string;
  createdAt: string;
};

type SessionPeersSectionProps = {
  workspaceId: string;
  sessionId: string;
  initialPeers: SessionPeer[];
};

type SessionPeersResponse = {
  items: SessionPeer[];
};

export function SessionPeersSection({
  workspaceId,
  sessionId,
  initialPeers,
}: SessionPeersSectionProps) {
  const [peers, setPeers] = useState(initialPeers);
  const [page, setPage] = useState(1);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pageSize = 10;

  const pages = Math.max(1, Math.ceil(peers.length / pageSize));
  const visiblePeers = useMemo(() => {
    const start = (page - 1) * pageSize;
    return peers.slice(start, start + pageSize);
  }, [page, peers]);

  const refreshPeers = useCallback(async () => {
    if (isPending) {
      return;
    }

    setIsPending(true);

    try {
      const refreshValue = Date.now();
      const response = await fetch(
        `/api/workspaces/${encodeURIComponent(workspaceId)}/sessions/${encodeURIComponent(sessionId)}/peers?refresh=${refreshValue}`,
        {
          cache: "no-store",
        },
      );

      if (!response.ok) {
        throw new Error(
          await getApiErrorMessage(
            response,
            `Failed to load peers (${response.status}).`,
          ),
        );
      }

      const data = (await response.json()) as SessionPeersResponse;
      setPeers(data.items);
      setPage((previous) => {
        const nextPages = Math.max(1, Math.ceil(data.items.length / pageSize));
        return Math.min(previous, nextPages);
      });
      setError(null);
    } catch (refreshError) {
      const message =
        refreshError instanceof Error
          ? refreshError.message
          : "Failed to load peers.";
      setError(message);
    } finally {
      setIsPending(false);
    }
  }, [isPending, sessionId, workspaceId]);

  usePageRefreshSignal(() => {
    void refreshPeers();
  });

  const peersBasePath = `/workspaces/${encodeURIComponent(workspaceId)}/peers`;

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-xs font-semibold uppercase tracking-[0.06em] text-ctp-subtext0">
          Peers ({peers.length})
        </h2>

        <TableRefreshButton
          isPending={isPending}
          onRefresh={() => {
            void refreshPeers();
          }}
          label="Refresh peers"
        />
      </div>

      {peers.length === 0 ? (
        <EmptyState
          title="No peers"
          description="No peers are currently associated with this session."
        />
      ) : (
        <div className="overflow-hidden border-2 border-[var(--pixel-border)] bg-ctp-mantle shadow-[var(--pixel-shadow-md)]">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-ctp-crust text-xs uppercase tracking-[0.05em] text-ctp-subtext0">
                <tr>
                  <th scope="col" className="px-4 py-3 font-medium sm:px-6">
                    Peer ID
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium sm:px-6">
                    Created At
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-ctp-surface0">
                {visiblePeers.map((peer) => {
                  const href = `${peersBasePath}/${encodeURIComponent(peer.id)}`;

                  return (
                    <ClickableTableRow
                      href={href}
                      key={peer.id}
                      className="group hover:bg-transparent"
                    >
                      <td className="px-4 py-3 font-medium text-ctp-text sm:px-6">
                        <Link
                          href={href}
                          className="inline-flex underline-offset-2 transition-colors group-hover:text-ctp-lavender hover:underline"
                        >
                          {peer.id}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-ctp-subtext0 sm:px-6">
                        <RelativeTime value={peer.createdAt} />
                      </td>
                    </ClickableTableRow>
                  );
                })}
              </tbody>
            </table>
          </div>

          <TablePager
            page={page}
            pages={pages}
            size={pageSize}
            total={peers.length}
            isPending={isPending}
            onFirst={() => setPage(1)}
            onPrevious={() => setPage((previous) => Math.max(1, previous - 1))}
            onNext={() => setPage((previous) => Math.min(pages, previous + 1))}
            onLast={() => setPage(pages)}
          />
        </div>
      )}

      {error ? <p className="text-xs text-ctp-red">{error}</p> : null}
    </section>
  );
}
