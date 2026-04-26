import type { ReactNode } from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { TableRefreshButton } from "@/components/ui/table-controls";

type DataSectionProps = {
  title: string;
  titleClassName?: string;
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
  titleClassName,
  total,
  isPending,
  onRefresh,
  refreshLabel,
  emptyTitle,
  emptyDescription,
  error,
  children,
}: DataSectionProps) {
  const resolvedTitleClassName =
    titleClassName ??
    "text-xs font-semibold uppercase tracking-[0.06em] text-ctp-subtext0";

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className={resolvedTitleClassName}>
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
        <div className="overflow-hidden border-2 border-[var(--pixel-border)] bg-ctp-mantle shadow-[var(--pixel-shadow-md)]">
          {children}
        </div>
      )}

      {error ? <p className="text-xs text-ctp-red">{error}</p> : null}
    </section>
  );
}
