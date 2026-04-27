import { EmptyState } from "@/components/ui/empty-state";
import { Surface } from "@/components/ui/surface";
import { TableRefreshButton } from "@/components/ui/table-controls";
import type { ReactNode } from "react";

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
  const resolvedTitleClassName = titleClassName ?? "ui-section-label";

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
        <Surface className="overflow-hidden">{children}</Surface>
      )}

      {error ? (
        <p className="text-xs text-[var(--color-danger)]">{error}</p>
      ) : null}
    </section>
  );
}
