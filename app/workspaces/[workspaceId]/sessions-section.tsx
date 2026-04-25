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

type SessionRow = {
  id: string;
  isActive: boolean;
  createdAt: string;
  metadata: Record<string, unknown>;
};

type PaginatedSessionsData = {
  items: SessionRow[];
  page: number;
  pages: number;
  size: number;
  total: number;
};

type SessionsSectionProps = {
  workspaceId: string;
  initialSessions: PaginatedSessionsData;
  sessionsApiPath?: string;
  sessionsBasePath?: string;
  title?: string;
  emptyStateTitle?: string;
  emptyStateDescription?: string;
  showMetadataColumn?: boolean;
};

export function SessionsSection({
  workspaceId,
  initialSessions,
  sessionsApiPath,
  sessionsBasePath,
  title,
  emptyStateTitle,
  emptyStateDescription,
  showMetadataColumn,
}: SessionsSectionProps) {
  const [query, setQuery] = useState({ page: initialSessions.page });
  const [sessions, setSessions] = useState(initialSessions);

  const base =
    sessionsBasePath ??
    `/workspaces/${encodeURIComponent(workspaceId)}/sessions`;
  const resolvedSessionsApiPath =
    sessionsApiPath ??
    `/api/workspaces/${encodeURIComponent(workspaceId)}/sessions`;
  const sectionTitle = title ?? "Sessions";
  const resolvedEmptyStateTitle = emptyStateTitle ?? "No sessions";
  const resolvedEmptyStateDescription =
    emptyStateDescription ?? "This workspace has no sessions yet.";
  const pageSize = sessions.size || 10;
  const pagination = usePagination(setQuery, sessions.pages);

  const buildSessionsUrl = useCallback(
    (refreshNonce: number) => {
      const params = new URLSearchParams();
      params.set("page", String(query.page));
      params.set("size", String(pageSize));
      if (refreshNonce > 0) {
        params.set("refresh", String(refreshNonce));
      }

      return `${resolvedSessionsApiPath}?${params.toString()}`;
    },
    [pageSize, query, resolvedSessionsApiPath],
  );

  const {
    isPending,
    error,
    refresh: refreshSessions,
  } = usePaginatedFetch<PaginatedSessionsData>({
    entityName: "sessions",
    buildUrl: buildSessionsUrl,
    setData: setSessions,
  });

  return (
    <DataSection
      title={sectionTitle}
      total={sessions.total}
      isPending={isPending}
      onRefresh={refreshSessions}
      refreshLabel="Refresh sessions"
      emptyTitle={resolvedEmptyStateTitle}
      emptyDescription={resolvedEmptyStateDescription}
      error={error}
    >
      <div className="overflow-hidden">
        <table className="w-full table-fixed text-left text-sm">
          <thead className="bg-ctp-crust/90 text-xs uppercase tracking-wide text-ctp-subtext0">
            <tr>
              <th scope="col" className="w-[50%] px-3 py-3 font-medium sm:px-4">
                Session ID
              </th>
              <th scope="col" className="w-[25%] px-3 py-3 font-medium sm:px-4">
                Status
              </th>
              <th scope="col" className="w-[25%] px-3 py-3 font-medium sm:px-4">
                Created At
              </th>
              {showMetadataColumn ? (
                <th scope="col" className="px-3 py-3 font-medium sm:px-4">
                  Metadata
                </th>
              ) : null}
            </tr>
          </thead>

          <tbody className="divide-y divide-ctp-surface0">
            {sessions.items.map((session) => {
              const href = `${base}/${encodeURIComponent(session.id)}`;

              return (
                <ClickableTableRow
                  href={href}
                  key={session.id}
                  className="group"
                >
                  <td className="px-3 py-3 font-medium text-ctp-text sm:px-4">
                    <Link
                      href={href}
                      title={session.id}
                      className="block truncate rounded-sm underline-offset-2 transition-colors group-hover:text-ctp-lavender hover:underline"
                    >
                      {session.id}
                    </Link>
                  </td>
                  <td className="px-3 py-3 sm:px-4">
                    <span
                      className={`inline-flex whitespace-nowrap rounded-full border px-2 py-0.5 text-xs font-medium ${
                        session.isActive
                          ? "border-ctp-green/60 bg-ctp-green/15 text-ctp-green"
                          : "border-ctp-surface1 bg-ctp-surface0 text-ctp-subtext0"
                      }`}
                    >
                      {session.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-xs leading-5 text-ctp-subtext0 sm:px-4 sm:text-sm">
                    <RelativeTime value={session.createdAt} />
                  </td>
                  {showMetadataColumn ? (
                    <td className="px-3 py-3 align-top sm:px-4">
                      <JsonCell value={session.metadata} />
                    </td>
                  ) : null}
                </ClickableTableRow>
              );
            })}
          </tbody>
        </table>
      </div>

      <TablePager
        page={query.page}
        pages={sessions.pages}
        size={pageSize}
        total={sessions.total}
        isPending={isPending}
        onFirst={pagination.onFirst}
        onPrevious={pagination.onPrevious}
        onNext={pagination.onNext}
        onLast={pagination.onLast}
      />
    </DataSection>
  );
}
