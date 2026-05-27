"use client";

import { ClickableTableRow } from "@/components/ui/clickable-table-row";
import { EmptyState } from "@/components/ui/empty-state";
import { RelativeTime } from "@/components/ui/relative-time";
import { Surface } from "@/components/ui/surface";
import type { DashboardPeer } from "@/lib/dashboard-types";
import Link from "next/link";
import { useMemo } from "react";

type SessionPeersSectionProps = {
  workspaceId: string;
  initialPeers: DashboardPeer[];
};

export function SessionPeersSection({
  workspaceId,
  initialPeers,
}: SessionPeersSectionProps) {
  const peers = useMemo(
    () =>
      [...initialPeers].sort((left, right) => left.id.localeCompare(right.id)),
    [initialPeers],
  );
  const peersBasePath = `/workspaces/${encodeURIComponent(workspaceId)}/peers`;

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="ui-section-label">Peers ({peers.length})</h2>
      </div>

      {peers.length === 0 ? (
        <EmptyState
          title="No peers"
          description="No peers are currently associated with this session."
        />
      ) : (
        <Surface className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="ui-table-head">
                <tr>
                  <th scope="col" className="px-4 py-3 font-medium sm:px-6">
                    Peer ID
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium sm:px-6">
                    Created At
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[var(--surface-border-muted)]">
                {peers.map((peer) => {
                  const href = `${peersBasePath}/${encodeURIComponent(peer.id)}`;

                  return (
                    <ClickableTableRow
                      href={href}
                      key={peer.id}
                      className="group"
                    >
                      <td className="px-4 py-3 font-medium text-[var(--text-primary)] sm:px-6">
                        <Link
                          href={href}
                          className="inline-flex underline-offset-2 transition-colors group-hover:text-[var(--color-accent)] hover:underline"
                        >
                          {peer.id}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-[var(--text-muted)] sm:px-6">
                        <RelativeTime value={peer.createdAt} />
                      </td>
                    </ClickableTableRow>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Surface>
      )}
    </section>
  );
}
