"use client";

import { DataSection } from "@/components/ui/data-section";
import { TablePager } from "@/components/ui/table-controls";
import type { ReactNode } from "react";

type PaginatedTableShellProps = {
  title: string;
  titleClassName?: string;
  total: number;
  isPending: boolean;
  onRefresh: () => void;
  refreshLabel: string;
  emptyTitle: string;
  emptyDescription?: string;
  error?: string | null;
  headerRow: ReactNode;
  bodyRows: ReactNode;
  theadClassName?: string;
  page: number;
  pages: number;
  pageSize: number;
  onFirst: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onLast: () => void;
};

export function PaginatedTableShell({
  title,
  titleClassName,
  total,
  isPending,
  onRefresh,
  refreshLabel,
  emptyTitle,
  emptyDescription,
  error,
  headerRow,
  bodyRows,
  theadClassName = "ui-table-head",
  page,
  pages,
  pageSize,
  onFirst,
  onPrevious,
  onNext,
  onLast,
}: PaginatedTableShellProps) {
  return (
    <DataSection
      title={title}
      titleClassName={titleClassName}
      total={total}
      isPending={isPending}
      onRefresh={onRefresh}
      refreshLabel={refreshLabel}
      emptyTitle={emptyTitle}
      emptyDescription={emptyDescription}
      error={error}
    >
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className={theadClassName}>{headerRow}</thead>
          <tbody className="divide-y divide-[var(--surface-border-muted)]">
            {bodyRows}
          </tbody>
        </table>
      </div>

      <TablePager
        page={page}
        pages={pages}
        size={pageSize}
        total={total}
        isPending={isPending}
        onFirst={onFirst}
        onPrevious={onPrevious}
        onNext={onNext}
        onLast={onLast}
      />
    </DataSection>
  );
}
