"use client";

import { Badge } from "@/components/ui/badge";
import { ClickableTableRow } from "@/components/ui/clickable-table-row";
import { DataSection } from "@/components/ui/data-section";
import { JsonCell } from "@/components/ui/json-cell";
import { RelativeTime } from "@/components/ui/relative-time";
import { TablePager } from "@/components/ui/table-controls";
import { usePaginatedFetch } from "@/hooks/use-paginated-fetch";
import { usePagination } from "@/hooks/use-pagination";
import Link from "next/link";
import { useCallback, useState } from "react";

type SessionRow = {
  id: string;
  isActive: boolean;
  createdAt: string;
  metadata: Record<string, unknown>;
  configuration: Record<string, unknown>;
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
  titleClassName?: string;
  emptyStateTitle?: string;
  emptyStateDescription?: string;
  showMetadataColumns?: boolean;
};

export function SessionsSection({
  workspaceId,
  initialSessions,
  sessionsApiPath,
  sessionsBasePath,
  title,
  titleClassName,
  emptyStateTitle,
  emptyStateDescription,
  showMetadataColumns,
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
      titleClassName={titleClassName}
      total={sessions.total}
      isPending={isPending}
      onRefresh={refreshSessions}
      refreshLabel="Refresh sessions"
      emptyTitle={resolvedEmptyStateTitle}
      emptyDescription={resolvedEmptyStateDescription}
      error={error}
    >
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="ui-table-head">
            <tr>
              <th scope="col" className="px-4 py-3 font-medium sm:px-6">
                Session ID
              </th>
              <th scope="col" className="px-4 py-3 font-medium sm:px-6">
                Status
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

          <tbody className="divide-y divide-[var(--surface-border-muted)]">
            {sessions.items.map((session) => {
              const href = `${base}/${encodeURIComponent(session.id)}`;

              return (
                <ClickableTableRow
                  href={href}
                  key={session.id}
                  className="group"
                >
                  <td className="px-4 py-3 font-medium text-[var(--text-primary)] sm:px-6">
                    <Link
                      href={href}
                      title={session.id}
                      className="block truncate break-words whitespace-normal underline-offset-2 transition-colors group-hover:text-[var(--color-accent)] hover:underline"
                    >
                      {session.id}
                    </Link>
                  </td>
                  <td className="px-4 py-3 sm:px-6">
                    <Badge variant={session.isActive ? "success" : "neutral"}>
                      {session.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-xs leading-5 text-[var(--text-muted)] sm:px-6 sm:text-sm">
                    <RelativeTime value={session.createdAt} />
                  </td>
                  {showMetadataColumns ? (
                    <>
                      <td className="px-4 py-3 align-top sm:px-6">
                        <JsonCell value={session.metadata} />
                      </td>
                      <td className="px-4 py-3 align-top sm:px-6">
                        <JsonCell value={session.configuration} />
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
