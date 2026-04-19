import type { ReactNode } from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { TableRefreshButton } from "@/components/ui/table-controls";

type DataSectionProps = {
  title: string;
  total: number;
  isPending: boolean;
  onRefresh: () => void;
  refreshLabel: string;
  emptyTitle: string;
  emptyDescription?: string;
  error?: string | null;
  children: ReactNode;
};

export function DataSection({
  title,
  total,
  isPending,
  onRefresh,
  refreshLabel,
  emptyTitle,
  emptyDescription,
  error,
  children,
}: DataSectionProps) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-medium text-ctp-subtext0">
          {title} ({total})
        </h2>

        <TableRefreshButton
          isPending={isPending}
          onRefresh={onRefresh}
          label={refreshLabel}
        />
      </div>

      {total === 0 ? (
        <EmptyState title={emptyTitle} description={emptyDescription} />
      ) : (
        <div className="overflow-hidden rounded-xl border border-ctp-surface0 bg-ctp-mantle shadow-sm">
          {children}
        </div>
      )}

      {error ? <p className="text-xs text-ctp-red">{error}</p> : null}
    </section>
  );
}
