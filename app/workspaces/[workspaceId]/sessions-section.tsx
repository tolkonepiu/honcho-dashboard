"use client";

import { Badge } from "@/components/ui/badge";
import { ClickableTableRow } from "@/components/ui/clickable-table-row";
import { JsonCell } from "@/components/ui/json-cell";
import { PaginatedTableShell } from "@/components/ui/paginated-table-shell";
import { RelativeTime } from "@/components/ui/relative-time";
import { usePaginatedTable } from "@/hooks/use-paginated-table";
import Link from "next/link";

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
  const { data, query, pageSize, pagination, isPending, error, refresh } =
    usePaginatedTable<SessionRow, PaginatedSessionsData>({
      initialData: initialSessions,
      apiPath: resolvedSessionsApiPath,
      entityName: "sessions",
    });

  return (
    <PaginatedTableShell
      title={sectionTitle}
      titleClassName={titleClassName}
      total={data.total}
      isPending={isPending}
      onRefresh={refresh}
      refreshLabel="Refresh sessions"
      emptyTitle={resolvedEmptyStateTitle}
      emptyDescription={resolvedEmptyStateDescription}
      error={error}
      headerRow={
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
      }
      bodyRows={data.items.map((session) => {
        const href = `${base}/${encodeURIComponent(session.id)}`;

        return (
          <ClickableTableRow href={href} key={session.id} className="group">
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
